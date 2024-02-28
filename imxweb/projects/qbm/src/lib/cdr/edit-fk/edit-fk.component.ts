/*
 * ONE IDENTITY LLC. PROPRIETARY INFORMATION
 *
 * This software is confidential.  One Identity, LLC. or one of its affiliates or
 * subsidiaries, has supplied this software to you under terms of a
 * license agreement, nondisclosure agreement or both.
 *
 * You may not copy, disclose, or use this software except in accordance with
 * those terms.
 *
 *
 * Copyright 2023 One Identity LLC.
 * ALL RIGHTS RESERVED.
 *
 * ONE IDENTITY LLC. MAKES NO REPRESENTATIONS OR
 * WARRANTIES ABOUT THE SUITABILITY OF THE SOFTWARE,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE IMPLIED WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, OR
 * NON-INFRINGEMENT.  ONE IDENTITY LLC. SHALL NOT BE
 * LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE
 * AS A RESULT OF USING, MODIFYING OR DISTRIBUTING
 * THIS SOFTWARE OR ITS DERIVATIVES.
 *
 */

import {
  Component,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  EventEmitter,
  OnInit,
  ErrorHandler,
} from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { UntypedFormControl } from '@angular/forms';
import { Subscription, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ListRange } from '@angular/cdk/collections';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { ClassloggerService } from '../../classlogger/classlogger.service';
import { FkAdvancedPickerComponent } from '../../fk-advanced-picker/fk-advanced-picker.component';
import { ValueStruct, IForeignKeyInfo, CollectionLoadParameters, DbObjectKey } from 'imx-qbm-dbts';
import { ColumnDependentReference } from '../column-dependent-reference.interface';
import { EntityColumnContainer } from '../entity-column-container';
import { CdrEditor, ValueHasChangedEventArg } from '../cdr-editor.interface';
import { ForeignKeySelection } from '../../fk-advanced-picker/foreign-key-selection.interface';
import { Candidate } from '../../fk-advanced-picker/candidate.interface';
import { MetadataService } from '../../base/metadata.service';
import { FkHierarchicalDialogComponent } from '../../fk-hierarchical-dialog/fk-hierarchical-dialog.component';
import { LdsReplacePipe } from '../../lds-replace/lds-replace.pipe';

/**
 * A component for viewing / editing foreign key relations
 */
// tslint:disable-next-line: max-classes-per-file
@Component({
  selector: 'imx-edit-fk',
  templateUrl: './edit-fk.component.html',
  styleUrls: ['./edit-fk.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * A component for viewing / editing foreign key relations
 */
export class EditFkComponent implements CdrEditor, AfterViewInit, OnDestroy, OnInit {
  public readonly updateRequested = new Subject<void>();
  public get hasCandidatesOrIsLoading(): boolean {
    return (
      this.candidatesTotalCount > 0 ||
      // make sure the user can change selectedTable even if there are no available candidates
      // in the first candidate table
      this.columnContainer?.fkRelations?.length > 1 ||
      this.parameters?.search?.length > 0 ||
      this.parameters?.filter != null ||
      this.loading
    );
  }

  public readonly control = new UntypedFormControl(undefined);
  public readonly columnContainer = new EntityColumnContainer<string>();
  public readonly pageSize = 20;
  public candidates: Candidate[];
  public loading = false;
  public selectedTable: IForeignKeyInfo;
  public isHierarchical: boolean;
  public candidatesTotalCount: number;

  public readonly valueHasChanged = new EventEmitter<ValueHasChangedEventArg>();

  private parameters: CollectionLoadParameters = { PageSize: this.pageSize, StartIndex: 0 };
  private savedParameters: CollectionLoadParameters;
  private savedCandidates: Candidate[];
  private readonly subscribers: Subscription[] = [];
  private isWriting = false;

  @ViewChild('viewport') private viewport: CdkVirtualScrollViewport;
  /**
   * Creates a new EditFkComponent for column dependent reference with a foreign key relation.
   * @param logger Log service.
   * @param sidesheet Dialog to open the pickerdialog for selecting an object.
   * @param metadataProvider Service providing table meta data
   */
  constructor(
    private readonly logger: ClassloggerService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly translator: TranslateService,
    private readonly ldsReplace: LdsReplacePipe,
    public readonly metadataProvider: MetadataService,
    private readonly errorHandler: ErrorHandler
  ) {
    this.subscribers.push(
      this.control.valueChanges.pipe(debounceTime(500)).subscribe(async (keyword) => {
        if (keyword != null && typeof keyword !== 'string') {
          this.control.setErrors(null);
          return;
        }

        return this.search(keyword);
      })
    );
  }

  public async ngOnInit(): Promise<void> {
    return this.initCandidates();
    // Muss leider immer gemacht werden, damit klar ist, ob es sich um eine hierarchische Ansicht handelt oder nicht
  }

  public async ngAfterViewInit(): Promise<void> {
    if (this.columnContainer && this.columnContainer.canEdit && this.viewport) {
      // Give a debounce to the stream so we don't get multiple calls and lose data
      this.subscribers.push(
        this.viewport.renderedRangeStream.pipe(debounceTime(100)).subscribe(async (value: ListRange) => {
          const bottom = this.parameters.StartIndex + this.pageSize;
          if (value.end >= bottom) {
            // Save old data, extend start index and delay the detecting of changes until we call within this function
            const tmpCandidates: Candidate[] = this.candidates.map((candidate) => candidate);
            this.parameters.StartIndex += this.pageSize;
            await this.updateCandidates(this.parameters, false);

            // Append new data to old, keep scroll at the bottom, check the size, and detect changes
            this.candidates = tmpCandidates.concat(...this.candidates);
            this.viewport.scrollToIndex(bottom);
            this.viewport.checkViewportSize();
            this.changeDetectorRef.detectChanges();
          }
        })
      );
    }
  }

  public ngOnDestroy(): void {
    this.subscribers.forEach((s) => s.unsubscribe());
  }

  public async inputFocus(): Promise<void> {
    if (!this.candidates?.length && !this.loading) {
      await this.initCandidates();
    }
  }

  public async onOpened(): Promise<void> {
    if (this.control.value) {
      // Use the stashed values if we already have a selected value
      this.parameters = this.savedParameters ?? { PageSize: this.pageSize, StartIndex: 0 };
      if ((this.savedCandidates?.length ?? 0) > 0) {
        this.candidates = this.savedCandidates;
      }
    } else if (this.parameters.search || this.parameters.filter || this.control.value == null) {
      // If we don't have a chosen value, then we have residual values, reset them and update
      await this.updateCandidates({ search: undefined, filter: undefined, StartIndex: 0 }, false);
    }

    if (this.viewport) {
      this.viewport.scrollToIndex(0);
      this.viewport.checkViewportSize();
      this.changeDetectorRef.detectChanges();
    }
  }

  public getDisplay(candidate: Candidate): string {
    return candidate ? candidate.DisplayValue : undefined;
  }

  public async optionSelected(event: MatAutocompleteSelectedEvent): Promise<void> {
    // Save these parameters for later use, set start index back to zero
    this.savedParameters = this.parameters;
    this.savedCandidates = this.candidates;
    return this.writeValue(event.option.value);
  }

  public async removeAssignment(event?: Event): Promise<void> {
    if (event) {
      event.stopPropagation();
    }

    const value = { DataValue: undefined };
    this.control.setValue(value, { emitEvent: false });
    await this.writeValue(value);

    // Also reset search, filter and update
    if (this.parameters.search || this.parameters.filter) {
      this.parameters.StartIndex = 0;
      await this.updateCandidates({ search: undefined, filter: undefined });
    }
    this.viewport?.scrollToIndex(0);

    /* 298890
    if (this.candidatesTotalCount === 0) {
      return this.updateCandidates();
    }
    */
  }

  public close(event?: any): void {
    if (this.control.value == null || typeof this.control.value === 'string') {
      this.logger.debug(this, 'autoCompleteClose no match - reset to previous value', event);
      this.control.setValue(this.getValueStruct(), { emitEvent: false });
    }
  }

  /**
   * @ignore
   * Opens a dialog for selecting an object
   */
  public async editAssignment(event?: Event): Promise<void> {
    if (event) {
      event.stopPropagation();
    }

    const dialogRef = this.sidesheet.open(this.isHierarchical ? FkHierarchicalDialogComponent : FkAdvancedPickerComponent, {
      title: await this.translator.get('#LDS#Heading Edit Property').toPromise(),
      subTitle: await this.translator.get(this.columnContainer?.display).toPromise(),
      padding: '0',
      disableClose: true,
      width: 'max(600px,60%)',
      testId: this.isHierarchical ? 'edit-fk-hierarchy-sidesheet' : 'edit-fk-sidesheet',
      data: {
        fkRelations: this.columnContainer.fkRelations,
        selectedTableName: this.selectedTable.TableName,
        idList: this.columnContainer.value ? [this.columnContainer.value] : [],
      },
    });

    dialogRef.afterClosed().subscribe(async (selection: ForeignKeySelection) => {
      if (selection) {
        this.logger.debug(this, 'dialog ok', selection);
        this.candidates = null;
        this.selectedTable = selection.table;

        if (!this.columnContainer.canEdit) {
          return;
        }

        const value = selection.candidates && selection.candidates.length > 0 ? selection.candidates[0] : { DataValue: undefined };
        this.control.setValue(value, { emitEvent: false });
        await this.writeValue(value);
      } else {
        this.logger.debug(this, 'dialog cancel');
      }
    });
  }

  /**
   * Binds a column dependent reference to the component
   * @param cdref a column dependent reference
   */
  public bind(cdref: ColumnDependentReference): void {
    if (cdref && cdref.column) {
      this.columnContainer.init(cdref);
      this.setControlValue();

      if (cdref.minlengthSubject) {
        this.subscribers.push(
          cdref.minlengthSubject.subscribe((elem) => {
            this.setControlValue();
            this.changeDetectorRef.detectChanges();
          })
        );
      }

      // bind to entity change event
      this.subscribers.push(
        this.columnContainer.subscribe(async () => {
          if (this.isWriting) {
            return;
          }

          if (this.control.value?.DataValue !== this.columnContainer.value) {
            this.loading = true;
            try {
              this.logger.trace(
                this,
                `Control (${this.columnContainer.name}) set to new value:`,
                this.columnContainer.value,
                this.control.value
              );
              this.candidates = [];
              this.setControlValue();
            } finally {
              this.loading = false;
              this.changeDetectorRef.detectChanges();
            }
          }
          this.valueHasChanged.emit({ value: this.control.value });
        })
      );

      this.subscribers.push(
        this.updateRequested.subscribe(() => {
          setTimeout(async () => {
            this.loading = true;
            try {
              this.setControlValue();
              await this.initCandidates();
              this.control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
            } finally {
              this.loading = false;
            }
            this.valueHasChanged.emit({ value: this.control.value });
          });
        })
      );
      this.logger.trace(this, 'Control initialized', this.control.value);
    } else {
      this.logger.error(this, 'The Column Dependent Reference is undefined');
    }
  }

  private setControlValue(): void {
    const fkRelations = this.columnContainer.fkRelations;
    if (fkRelations && fkRelations.length > 0) {
      let table: IForeignKeyInfo;
      if (fkRelations.length > 1 && this.columnContainer.value) {
        this.logger.trace(this, 'the column already has a value, and it is a dynamic foreign key');
        const dbObjectKey = DbObjectKey.FromXml(this.columnContainer.value);
        table = fkRelations.find((fkr) => fkr.TableName === dbObjectKey.TableName);
      }
      this.selectedTable = table || fkRelations[0];

      this.metadataProvider.update(fkRelations.map((fkr) => fkr.TableName));
    }
    this.control.setValue(this.getValueStruct(), { emitEvent: false });

    const autoCompleteValidator = (control) =>
      control.value != null || this.parameters.search == null || this.candidates?.length > 0 ? null : { checkAutocomplete: true };
    if (this.columnContainer.isValueRequired && this.columnContainer.canEdit) {
      this.control.setValidators([
        (control) => (control.value == null || control.value.length === 0 ? { required: true } : null),
        autoCompleteValidator,
      ]);
    } else {
      this.control.setValidators(autoCompleteValidator);
    }
    this.changeDetectorRef.detectChanges();
  }

  /** loads the candidates and updates the listings */
  private async initCandidates(): Promise<void> {
    if (this.columnContainer && this.columnContainer.canEdit) {
      await this.updateCandidates({
        StartIndex: 0,
        PageSize: this.pageSize,
        filter: undefined,
        search: undefined,
      });

      this.changeDetectorRef.detectChanges();
    }
  }

  /**
   * updates the value for the CDR
   * @param value the new value
   */
  private async writeValue(value: ValueStruct<string>): Promise<void> {
    this.logger.debug(this, 'writeValue called with value', value);

    if (!this.columnContainer.canEdit || this.equal(this.getValueStruct(), value)) {
      return;
    }

    this.isWriting = true;
    this.loading = true;
    try {
      this.logger.debug(this, 'writeValue - updateCdrValue...');
      await this.columnContainer.updateValueStruct(value);

      const valueAfterWrite = this.getValueStruct();

      if (!this.equal(this.control.value, valueAfterWrite)) {
        this.control.setValue(valueAfterWrite, { emitEvent: false });

        this.logger.debug(this, 'writeValue - value has changed after interaction with the Entity. Value:', this.control.value);
      }

      this.control.markAsDirty();
      this.valueHasChanged.emit({ value, forceEmit: true });
    } catch (error) {
      this.errorHandler.handleError(error);
    } finally {
      this.loading = false;
      this.isWriting = false;
      this.changeDetectorRef.detectChanges();
    }
  }

  private async updateCandidates(newState?: CollectionLoadParameters, isCheck: boolean = true): Promise<void> {
    if (this.selectedTable) {
      try {
        this.loading = true;
        if (isCheck) {
          this.changeDetectorRef.detectChanges();
        }
        this.parameters = { ...this.parameters, ...newState };
        const candidateCollection = await this.selectedTable.Get(this.parameters);
        this.candidatesTotalCount = candidateCollection?.TotalCount;

        this.isHierarchical = candidateCollection.Hierarchy != null;

        const multipleFkRelations = this.columnContainer.fkRelations && this.columnContainer.fkRelations.length > 1;
        const identityRelatedTable = this.selectedTable.TableName === 'Person';

        this.candidates = candidateCollection.Entities.map((entityData) => {
          let key: string = null;
          let detailValue: string = entityData.LongDisplay;
          const defaultEmailColumn = entityData.Columns['DefaultEmailAddress'];
          /**
           * If the candidates data relate to identities (fkRelation Person table)
           * then we want to use the email address for the detail line (displayLong)
           */
          if (defaultEmailColumn && identityRelatedTable) {
            detailValue = defaultEmailColumn.Value;
          }
          if (multipleFkRelations) {
            this.logger.trace(this, 'dynamic foreign key');
            const xObjectKeyColumn = entityData.Columns['XObjectKey'];
            key = xObjectKeyColumn ? xObjectKeyColumn.Value : undefined;
          } else {
            this.logger.trace(this, 'foreign key');

            const parentColumn = entityData.Columns ? entityData.Columns[this.columnContainer.fkRelations[0].ColumnName] : undefined;
            if (parentColumn != null) {
              this.logger.trace(this, 'Use value from explicit parent column');
              key = parentColumn.Value;
            } else {
              this.logger.trace(this, 'Use the primary key');
              const keys = entityData.Keys;
              key = keys && keys.length ? keys[0] : undefined;
            }
          }
          return {
            DataValue: key,
            DisplayValue: entityData.Display,
            displayLong: detailValue,
          };
        });
      } finally {
        this.loading = false;
        if (isCheck) {
          this.changeDetectorRef.detectChanges();
        }
      }
    }
  }

  private getValueStruct(): ValueStruct<string> {
    if (this.columnContainer.value) {
      return { DataValue: this.columnContainer.value, DisplayValue: this.columnContainer.displayValue || '' };
    }

    return undefined;
  }

  private equal(value: ValueStruct<string>, value2: ValueStruct<string>): boolean {
    if (value && value2) {
      return value.DataValue === value2.DataValue && value.DisplayValue === value.DisplayValue;
    }

    return value == null && value2 == null;
  }

  private async search(keyword: string): Promise<void> {
    this.parameters.StartIndex = 0;

    await this.updateCandidates({ search: keyword });
    this.viewport?.scrollToIndex(0);
    this.changeDetectorRef.detectChanges();
  }
}
