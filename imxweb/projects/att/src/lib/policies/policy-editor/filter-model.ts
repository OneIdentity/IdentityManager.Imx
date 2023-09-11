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

import { BehaviorSubject } from 'rxjs';

import { ParmData, PolicyFilterData, PolicyFilterElement } from 'imx-api-att';
import { SelectecObjectsInfo } from '../selected-objects/selected-objects-info.interface';
import { FilterElementColumnService } from '../editors/filter-element-column.service';
import { FilterElementModel } from '../editors/filter-element-model';

export class FilterModel {
  public totalSelectedObjectsSubject: BehaviorSubject<SelectecObjectsInfo> = new BehaviorSubject<SelectecObjectsInfo>(undefined);
  public policyFilterData: PolicyFilterData;
  public parameterConfig: ParmData[] = [];
  public uidAttestationObject: string;

  constructor(
    public readonly columnFactory: FilterElementColumnService,
    public readonly isEnabledSubject: BehaviorSubject<boolean>,
    public readonly attestationObjectSubject: BehaviorSubject<string>) {
    isEnabledSubject.subscribe(elem => {
      if (!elem && this.policyFilterData && this.policyFilterData.Filter.Elements.length > 0) {
        this.policyFilterData = {
          IsReadOnly: this.policyFilterData ? this.policyFilterData.IsReadOnly : true,
          Filter: { Elements: [], ConcatenationType: 'OR' },
          InfoDisplay: []
        };
      }
      if (elem && this.policyFilterData == null) {
        this.policyFilterData = {
          IsReadOnly: this.policyFilterData ? this.policyFilterData.IsReadOnly : true,
          Filter: { Elements: [], ConcatenationType: 'OR' },
          InfoDisplay: []
        };
      }
      this.totalSelectedObjectsSubject.next(undefined);
    });
    attestationObjectSubject.subscribe(elem => {
      this.uidAttestationObject = elem;

    });
  }

  public dispose(): void {
    this.attestationObjectSubject.unsubscribe();
  }

  public async updateConfig(): Promise<void> {
    this.parameterConfig = await this.columnFactory.policyService.getParmData(this.uidAttestationObject);
  }

  public addCondition(): FilterElementModel {
    const newCondition = this.buildPolicyModel({}, []);
    this.policyFilterData.Filter.Elements.push(newCondition.filterElement);
    this.policyFilterData.InfoDisplay.push(['']);
    return newCondition;
  }

  public deleteCondition(index: number): void {
    this.policyFilterData.Filter.Elements.splice(index, 1);
    this.policyFilterData.InfoDisplay.splice(index, 1);
  }

  public filterHasChanged(filterElements: FilterElementModel[], type: string): void {
    this.totalSelectedObjectsSubject.next(this.filtersAreValid(filterElements) ?
      {
        policyFilter: {
          Elements: filterElements.map(filter => filter.filterElement),
          ConcatenationType: type
        },
        uidPickCategory: '',
        uidAttestationObject: this.uidAttestationObject
      }
      : undefined);
  }

  public updateConcatination(concat: string): void {
    this.policyFilterData.Filter.ConcatenationType = concat;
  }

  public buildPolicyModel(filterElement: PolicyFilterElement, displays?: string[]): FilterElementModel {
    const model = new FilterElementModel(this.parameterConfig,
      displays,
      filterElement,
      this.uidAttestationObject,
      this.columnFactory
    );

    return model;
  }

  private filtersAreValid(filterElements: FilterElementModel[]): boolean {
    return filterElements.filter(elem => elem.filterErrors() == null).length === filterElements.length;
  }
}
