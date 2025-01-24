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
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ErrorHandler,
  EventEmitter,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { CollectionLoadParameters, DbObjectKey, IForeignKeyInfo, ValueStruct } from 'imx-qbm-dbts';
import { MetadataService } from '../../base/metadata.service';
import { ClassloggerService } from '../../classlogger/classlogger.service';
import { Candidate } from '../../fk-advanced-picker/candidate.interface';
import { FkAdvancedPickerComponent } from '../../fk-advanced-picker/fk-advanced-picker.component';
import { ForeignKeySelection } from '../../fk-advanced-picker/foreign-key-selection.interface';
import { FkHierarchicalDialogComponent } from '../../fk-hierarchical-dialog/fk-hierarchical-dialog.component';
import { CdrEditor, ValueHasChangedEventArg } from '../cdr-editor.interface';
import { ColumnDependentReference } from '../column-dependent-reference.interface';
import { EntityColumnContainer } from '../entity-column-container';

/**
 * Provides a {@link CdrEditor | CDR editor} for editing / viewing foreign key value columns.
 *
 * There are two methods for selecting values available:
 * <ol>
 * <li>using an auto complete control - this is used for a flat list, containing values from a single table. </li>
 * <li>by using a 'select' / 'change' button - this is used by hierarchical listings or elements from multiple tables.</li>
 * </ol>
 * When set to read-only, it uses a {@link ViewPropertyComponent | view property component} to display the content.
 */
@Component({
  selector: 'imx-edit-fk',
  templateUrl: './edit-fk.component.html',
  styleUrls: ['./edit-fk.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * A component for viewing / editing foreign key relations.
 */
export class EditFkComponent implements CdrEditor, AfterViewInit, OnDestroy, OnInit {
  /**
   * A subject for triggering an update of the editor.
   */
  public readonly updateRequested = new Subject<void>();

  /**
   * The form control associated with the editor.
   */
  public readonly control = new UntypedFormControl(undefined);

  /**
   * The container that wraps the column functionality.
   */
  public readonly columnContainer = new EntityColumnContainer<string>();

  /**
   * @ignore Only used in template.
   */
  public readonly pageSize = 20;

  /**
   * A list of possible candidates, that can be selected.
   */
  private _candidates: Candidate[];

  public get candidates(): Candidate[] {
    return this._candidates;
  }

  public set candidates(value: Candidate[]) {
    this._candidates = value;
  }

  /**
   * Indicator that the component is loading data from the server.
   */
  public loading = false;

  /**
   * The table, the user is currently selecting items from.
   * It is possible to choose elements from different tables at the same time.
   */
  public selectedTable: IForeignKeyInfo;

  /**
   * Indicator, whether the candidate data is hierarchical or not.
   */
  public isHierarchical: boolean;

  /**
   * The number of possible candidates
   */
  public candidatesTotalCount: number;

  /**
   * Event that is emitted, after a value has been changed.
   */
  public readonly valueHasChanged = new EventEmitter<ValueHasChangedEventArg>();

  private parameters: CollectionLoadParameters = { PageSize: this.pageSize, StartIndex: 0 };
  private savedParameters: CollectionLoadParameters;
  private savedCandidates: Candidate[];
  private readonly subscribers: Subscription[] = [];
  private isWriting = false;

  @ViewChild('autocomplete') private autocomplete: MatAutocomplete;
  /**
   * Creates a new EditFkComponent.
   * @param logger The log service, that is used for logging.
   * @param sidesheet Side sheet, that opens the picker dialog for selecting an object.
   * @param metadataProvider Service providing table meta data.
   */
  constructor(
    private readonly logger: ClassloggerService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly translator: TranslateService,
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

  /**
   * Initializes the candidate list, after the 'OnInit' hook is triggered.
   */
  public async ngOnInit(): Promise<void> {
    return this.initCandidates();
    // Unfortunately this is mandatory, to decide, if the component is hierarchical or not
  }

  /**
   * Initializes the autocomplete opened for dynamic scrolling, after the 'AfterViewInit' hook is triggered.
   */
  public async ngAfterViewInit(): Promise<void> {
    if (this.columnContainer && this.columnContainer.canEdit && this.autocomplete) {
      this.subscribers.push(this.autocomplete.opened.subscribe(() => this.registerPanelScrollEvent()));
    }
  }

  /**
   * Unsubscribes all events, after the 'OnDestroy' hook is triggered.
   */
  public ngOnDestroy(): void {
    this.subscribers.forEach((s) => s.unsubscribe());
  }

  /**
   * Reinitialize the candidate list, if the input is focused.
   */
  public async inputFocus(): Promise<void> {
    if (!this.candidates?.length && !this.loading) {
      await this.initCandidates();
    }
  }

  /**
   * Handles the control value and displays it, when the auto complete control is opened.
   */
  public async onOpened(): Promise<void> {
    // Use the stashed values if we already have a selected value
    this.parameters = this.savedParameters ?? { PageSize: this.pageSize, StartIndex: 0 };
    if (!!this.savedCandidates?.length) {
      this.candidates = this.savedCandidates;
    } else if (this.parameters.search || this.parameters.filter || this.control.value == null) {
      await this.updateCandidates({ search: undefined, filter: undefined, StartIndex: 0 }, false);
    }
  }

  /**
   * @ignore Only used in template.
   * Gets the display of a candidate.
   * @param candidate The candidate object.
   * @returns The display of the candidate object.
   */
  public getDisplay(candidate: Candidate): string {
    return candidate ? candidate.DisplayValue : undefined;
  }

  /**
   * Writes the value, if a new one is selected in the auto complete control.
   * @param event The MatAutocompleteSelectedEvent, that was triggered.
   */
  public async optionSelected(event: MatAutocompleteSelectedEvent): Promise<void> {
    return this.writeValue(event.option.value);
  }

  /**
   * Removes all the assignments and writes the 'empty' value to the column.
   * Afterward it resets all request parameter and updates the candidate list.
   * @param event The event, that was emitted.
   */
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

    /* 298890
    if (this.candidatesTotalCount === 0) {
      return this.updateCandidates();
    }
    */
  }

  /**
   * Is called, after the auto complete closes and writes the value to the column.
   * @param event The event, that was emitted.
   */
  public close(event?: any): void {
    if (this.control.value == null || typeof this.control.value === 'string') {
      this.logger.debug(this, 'autoCompleteClose no match - reset to previous value', event);
      this.control.setValue(this.getValueStruct(), { emitEvent: false });
    }
    // Save these parameters for later use, set start index back to zero
    this.savedParameters = this.parameters;
    this.savedCandidates = this.candidates;
  }

  /**
   * Opens a dialog for selecting an object.
   * This is used, if the data is hierarchical or multiple tabes are available.
   * @param event The event, that was emitted.
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
   * Binds a column dependent reference to the component.
   * Subscribes to subjects from the column dependent reference and its container.
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

  public candidateTrackByFn(index: number, candidate: Candidate): string {
    return candidate.DataValue;
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

      this.metadataProvider.updateNonExisting(fkRelations.map((fkr) => fkr.TableName));
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
   * Updates the value for the CDR.
   * @param value The new value struct, that should be used as the new control value.
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

  private async updateCandidates(newState?: CollectionLoadParameters, isCheck: boolean = true, concatCandidates = false): Promise<void> {
    if (this.selectedTable) {
      try {
        this.loading = true;
        if (isCheck) {
          this.changeDetectorRef.detectChanges();
        }
        this.parameters = { ...this.parameters, ...newState };
        const candidateCollection = await this.selectedTable.Get(this.parameters);

        if (candidateCollection) {
          this.candidatesTotalCount = candidateCollection?.TotalCount;

          this.isHierarchical = candidateCollection.Hierarchy != null;

          const multipleFkRelations = this.columnContainer.fkRelations && this.columnContainer.fkRelations.length > 1;
          const identityRelatedTable = this.selectedTable.TableName === 'Person';

          const newCandidates = candidateCollection.Entities?.map((entityData) => {
            let key: string = '';
            let detailValue: string = entityData.LongDisplay ?? '';
            const defaultEmailColumn = entityData.Columns?.['DefaultEmailAddress'];
            /**
             * If the candidates data relate to identities (fkRelation Person table)
             * then we want to use the email address for the detail line (displayLong)
             */
            if (defaultEmailColumn && identityRelatedTable) {
              detailValue = defaultEmailColumn.Value;
            }
            if (multipleFkRelations) {
              this.logger.trace(this, 'dynamic foreign key');
              const xObjectKeyColumn = entityData.Columns?.['XObjectKey'];
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
                key = keys && keys.length ? keys[0] : '';
              }
            }
            return {
              DataValue: key,
              DisplayValue: entityData.Display,
              displayLong: detailValue,
            };
          });
          if (concatCandidates) {
            this.candidates.push(...(newCandidates || []));
            this.savedCandidates = this.candidates;
          } else {
            this.candidates = newCandidates || [];
            this.savedCandidates = this.candidates;
          }
        }
      } finally {
        this.loading = false;
        this.changeDetectorRef.detectChanges();
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
      return value.DataValue === value2.DataValue && value.DisplayValue === value2.DisplayValue;
    }

    return value == null && value2 == null;
  }

  private async search(keyword: string): Promise<void> {
    this.parameters.StartIndex = 0;

    await this.updateCandidates({ search: keyword });
    this.changeDetectorRef.detectChanges();
  }

  private registerPanelScrollEvent(): void {
    setTimeout(() => {
      const panel = this.autocomplete.panel;
      //Remove any listener that might have been added before
      panel.nativeElement.removeEventListener('scroll', (event: any) => this.onScroll(event));
      if (panel) {
        panel.nativeElement.addEventListener('scroll', (event: any) => this.onScroll(event));
      }
    }, 0);
  }

  private async onScroll(event: any): Promise<void> {
    if (
      event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight - 10 &&
      !this.loading &&
      this.candidatesTotalCount > this.pageSize + this.parameters.StartIndex
    ) {
      this.changeDetectorRef.detectChanges();
      this.parameters.StartIndex += this.pageSize;
      await this.updateCandidates(this.parameters, false, true);
      this.changeDetectorRef.detectChanges();
    }
  }
}
