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
 * Copyright 2024 One Identity LLC.
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
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  ValidatorFn,
} from '@angular/forms';
import { EuiLoadingService } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { PolicyFilter } from '@imx-modules/imx-api-att';
import { BusyService, ClassloggerService } from 'qbm';
import { FilterElementModel } from '../editors/filter-element-model';
import { PolicyFilterElementComponent } from '../policy-filter-element/policy-filter-element.component';
import { PolicyService } from '../policy.service';
import { SelectedObjectsComponent } from '../selected-objects/selected-objects.component';
import { FilterModel } from './filter-model';

@Component({
  templateUrl: './policy-editor.component.html',
  selector: 'imx-policy-editor',
  styleUrls: ['./policy-editor.component.scss'],
})
export class PolicyEditorComponent implements OnInit, OnDestroy, AfterViewInit {
  public parametersReady: boolean;

  public filterArray = new FormArray<UntypedFormGroup>([], PolicyEditorComponent.hasFiltersAttachedValidatorFn());
  public filterFormGroup: FormGroup<{ filterArray: FormArray<UntypedFormGroup>; concatenationType: FormControl<string> }> = new FormGroup({
    filterArray: this.filterArray,
    concatenationType: new FormControl<string>('OR', { nonNullable: true }),
  });

  @Input() public formGroup: UntypedFormGroup;
  @Input() public filterModel: FilterModel;
  @Input() public isMissing: boolean;
  @Input() public busyService: BusyService | undefined;
  @Output() public filterChanged = new EventEmitter<PolicyFilter>();
  public isLoading: boolean = false;

  public get showWarning() {
    return this.threshold > 0 && this.threshold < (this.totalCountControl?.countMatching ?? 0);
  }

  @ViewChildren(PolicyFilterElementComponent) private matExpansionPanelQueryList: QueryList<PolicyFilterElementComponent>;
  @ViewChild('totalCount') private totalCountControl: SelectedObjectsComponent;

  private readonly concatenationType = 'concatenationType';
  private readonly filterControl = 'filterControl';
  private readonly filterParameter = 'filterParameter';
  private subscriptions: Subscription[] = [];
  private threshold = -1;

  constructor(
    private readonly euiBusyService: EuiLoadingService,
    private cd: ChangeDetectorRef,
    private readonly policyService: PolicyService,
    private readonly logger: ClassloggerService,
  ) {
    this.subscriptions.push(
      this.filterFormGroup.get(this.concatenationType)?.valueChanges.subscribe((elem) => {
        this.filterModel.updateConcatination(elem);
        this.filterModel.filterHasChanged(this.getFilterList(), elem);
      }) || new Subscription(),
    );
  }

  public ngAfterViewInit(): void {
    this.subscriptions.push(
      this.matExpansionPanelQueryList.changes.subscribe((change) => {
        if (change.last) {
          change.last.open();
          this.cd.detectChanges();
        }
      }),
    );
  }

  public ngOnDestroy(): void {
    this.filterModel?.dispose();
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public async ngOnInit(): Promise<void> {
    this.formGroup.addControl(this.filterControl, this.filterFormGroup);

    this.subscriptions.push(this.filterModel.attestationObjectSubject.subscribe(async (elem) => this.uidAttestationObjectChanged(elem)));
    if (this.busyService != null) {
      this.subscriptions.push(this.busyService.busyStateChanged.subscribe((state) => (this.isLoading = state)));
    }

    await this.updateConfig();
    if (this.filterModel.policyFilterData?.Filter) {
      this.filterModel.policyFilterData?.Filter?.Elements?.forEach((element, index) => {
        const model = this.filterModel.buildPolicyModel(element, this.filterModel.policyFilterData?.InfoDisplay?.[index]);
        model.recalculateMatching();
        this.filterArray.push(
          new UntypedFormGroup(
            {
              filterParameter: new UntypedFormControl(model),
              type: new UntypedFormControl(element.AttestationSubType),
            },
            PolicyEditorComponent.filterElementValidatorFn(),
          ),
        );
      });
      this.logger.debug(this, `${this.filterArray.length} new filter control added`);
      this.filterFormGroup
        .get(this.concatenationType)
        ?.setValue(
          this.filterModel.policyFilterData?.Filter.ConcatenationType == null
            ? 'OR'
            : this.filterModel.policyFilterData?.Filter.ConcatenationType,
        );
      this.updateCurrentFilter(false);
    }
  }

  public deleteCondition(index: number): void {
    this.filterModel.deleteCondition(index);
    this.filterArray.removeAt(index);
    this.filterArray.markAsDirty();
    this.logger.debug(this, `condition ${index + 1} deleted`);
    this.updateCurrentFilter();
  }

  public addCondition(): void {
    const newCondition = this.filterModel.addCondition();
    this.filterArray.push(
      new UntypedFormGroup(
        {
          filterParameter: new UntypedFormControl(newCondition),
          type: new UntypedFormControl(newCondition.attestationSubType),
        },
        PolicyEditorComponent.filterElementValidatorFn(),
      ),
    );
    this.filterArray.markAsDirty();
    this.logger.debug(this, 'new condition added');
    this.updateCurrentFilter();
  }

  public filterParameterChanged(index: number, arg: FilterElementModel): void {
    if (this.euiBusyService.overlayRefs.length === 0) {
      this.euiBusyService.show();
    }
    try {
      const filterElement = arg;

      if (!!this.filterModel.policyFilterData?.Filter?.Elements) {
        this.filterModel.policyFilterData.Filter.Elements[index] = filterElement.filterElement;
      }
      this.logger.trace(this, `data for filter element ${index + 1} updated`, this.filterModel.policyFilterData?.Filter?.Elements?.[index]);
      if (this.filterModel.policyFilterData?.InfoDisplay) {
        this.filterModel.policyFilterData.InfoDisplay[index] = arg.displays;
      }
      this.logger.trace(this, `display for element ${index + 1} updated`, this.filterModel.policyFilterData?.InfoDisplay?.[index]);
      this.updateCurrentFilter();
    } finally {
      this.euiBusyService.hide();
    }
  }

  public selectedConditionTypeChanged(index: number, arg: FilterElementModel): void {
    if (this.filterModel.policyFilterData?.InfoDisplay) {
      this.filterModel.policyFilterData.InfoDisplay[index] = [];
    }
    this.logger.debug(this, 'info display deleted');
    if (!!this.filterModel.policyFilterData?.Filter?.Elements) {
      this.filterModel.policyFilterData.Filter.Elements[index] = arg.filterElement;
    }
    this.logger.trace(this, `data for filter element ${index + 1} updated`, this.filterModel.policyFilterData?.Filter?.Elements?.[index]);
    this.updateCurrentFilter();
  }

  private getFilterList(): FilterElementModel[] {
    return this.filterArray.controls.map((control) => control.get(this.filterParameter)?.value);
  }

  private async updateConfig(): Promise<void> {
    this.parametersReady = false;
    if (this.euiBusyService.overlayRefs.length === 0) {
      this.euiBusyService.show();
    }
    try {
      await this.filterModel.updateConfig();
      this.threshold = await this.policyService.getCasesThreshold();
      this.logger.debug(this, 'parameter config updated');
    } finally {
      this.euiBusyService.hide();
    }
    this.parametersReady = true;
  }

  private updateCurrentFilter(emitEvent: boolean = true): void {
    this.filterModel.filterHasChanged(this.getFilterList(), this.filterModel.policyFilterData?.Filter?.ConcatenationType || '');
    if (emitEvent) {
      this.filterChanged.emit(this.filterModel.policyFilterData?.Filter);
    }
  }

  private async uidAttestationObjectChanged(uid: string): Promise<void> {
    if (this.filterModel == null) {
      return;
    }

    if (!uid) {
      this.filterModel.totalSelectedObjectsSubject.next(undefined);
      return;
    }
    while (this.filterArray.controls.length > 0) {
      this.filterArray.removeAt(0);
    }

    await this.updateConfig();
    this.filterModel.totalSelectedObjectsSubject.next(undefined);
    this.filterFormGroup.get(this.concatenationType)?.setValue(this.filterModel.policyFilterData?.Filter?.ConcatenationType || '');
  }

  private static filterElementValidatorFn(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const filterElement = control.get('filterParameter')?.value;
      return filterElement?.filterErrors();
    };
  }

  private static hasFiltersAttachedValidatorFn(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const group = control as UntypedFormArray;
      return group.length > 0 ? null : { nofilter: true };
    };
  }

  public mismatch: string =
    '#LDS#You cannot save the attestation policy. A condition based on a sample is used but no sample has been specified. Specify a sample or remove the condition.';
}
