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

import { ParmData, PolicyFilterElement } from 'imx-api-att';
import { IEntityColumn, MultiValueProperty } from 'imx-qbm-dbts';
import { SelectecObjectsInfo } from '../selected-objects/selected-objects-info.interface';
import { FilterElementColumnService } from './filter-element-column.service';

export class FilterElementModel {
  public columnForFilter: IEntityColumn;
  public selectedObjectsSubject: BehaviorSubject<SelectecObjectsInfo> = new BehaviorSubject<SelectecObjectsInfo>(undefined);

  public get parameterName(): string {
    return this.filterElement.ParameterName;
  }
  public set parameterName(value: string) {
    this.filterElement.ParameterName = value;
  }

  public get attestationSubType(): string {
    return this.filterElement.AttestationSubType;
  }
  public set attestationSubType(value: string) {
    this.filterElement.AttestationSubType = value;
  }

  public get parameterValue(): string {
    return this.filterElement.ParameterValue;
  }
  public set parameterValue(value: string) {
    this.filterElement.ParameterValue = value;
  }

  public get parameterValue2(): string {
    return this.filterElement.ParameterValue2;
  }
  public set parameterValue2(value: string) {
    this.filterElement.ParameterValue2 = value;
  }

  constructor(
    public parameterConfig: ParmData[],
    public displays: string[],
    public readonly filterElement: PolicyFilterElement,
    private readonly uidAttestationObject: string,
    private readonly columnFactory: FilterElementColumnService
  ) {
    this.setColumnForFilter();
  }

  public updateColumn(filter: PolicyFilterElement, displays: string[]): void {
    this.attestationSubType = filter.AttestationSubType;
    this.parameterName = filter.ParameterName;
    this.parameterValue = filter.ParameterValue;
    this.parameterValue2 = filter.ParameterValue2;
    this.displays = displays;
    this.setColumnForFilter();
    this.recalculateMatching();
  }

  public recalculateMatching(): void {
    const data =
      this.filterErrors() == null
        ? {
            policyFilter: {
              ConcatenationType: 'OR',
              Elements: [this.filterElement],
            },
            uidPickCategory: '',
            uidAttestationObject: this.uidAttestationObject,
          }
        : undefined;
    this.selectedObjectsSubject.next(data);
  }

  public policyFilterRequiresParameterName(parameterName: string): boolean {
    return this.parameterNameFitsRequirement(this.attestationSubType, parameterName);
  }

  public getParameterData(parameterType: string): ParmData {
    return FilterElementModel.getParameterData(this.parameterConfig, parameterType);
  }

  public hasFk(): boolean {
    return (
      'UID' === FilterElementModel.getRequiredParameterType(this.getParameterData(this.attestationSubType)) ||
      this.policyFilterRequiresParameterName('DOMAIN')
    );
  }

  public getColumnName(): string {
    return this.getParameterData(this.attestationSubType)?.ColumnName;
  }

  public getTableName(): string {
    return this.getParameterData(this.attestationSubType)?.TableName;
  }

  public filterErrors(): { [key: string]: boolean } | null {
    const subType = FilterElementModel.getRequiredParameterType(this.getParameterData(this.attestationSubType));

    if (this.attestationSubType == null || this.attestationSubType === '') {
      return { noTypeSelected: true };
    }

    if (this.hasFk() && this.parameterValue === '') {
      return { mandatoryProperty: true };
    }

    if ('UINT' === subType && parseInt(this.parameterValue, 10) < 0) {
      return { lagerZero: true };
    }

    if ('THRESHOLD' === subType && (parseFloat(this.parameterValue) < 0 || parseFloat(this.parameterValue) > 1)) {
      return { loweroutOfRange: true };
    }

    if ('THRESHOLD' === subType && (parseFloat(this.parameterValue2) < 0 || parseFloat(this.parameterValue2) > 1)) {
      return { upperoutOfRange: true };
    }

    return null;
  }

  private setColumnForFilter(): void {
    this.columnForFilter = this.columnFactory.buildColumn(
      this.getParameterData(this.attestationSubType),
      this.attestationSubType,
      this.parameterValue,
      this.getColumnDisplay(),
      this.displays,
      this.hasFk()
    );
  }

  private getColumnDisplay(): string {
    if (this.hasFk()) {
      return '#LDS#Selected';
    }

    if (this.policyFilterRequiresParameterName('NAME')) {
      return '#LDS#Name';
    }
    return '';
  }

  private parameterNameFitsRequirement(parameterType: string, parameterName: string): boolean {
    return parameterName === this.getParameterData(parameterType)?.RequiredParameter;
  }

  public static getParameterData(parameters: ParmData[], parameterType: string): ParmData {
    const arr = parameters.filter((p) => p.Uid === parameterType);
    if (arr.length !== 1) {
      return null;
    }

    return arr[0];
  }

  public static getRequiredParameterType(w: ParmData): string {
    if (w == null || w.RequiredParameter == null) {
      return '';
    }

    if (w.RequiredParameter === 'UID_ORIGIN') {
      return 'UID_ORIGIN';
    }
    if (w.RequiredParameter.startsWith('UID_')) {
      return 'UID';
    }
    return w.RequiredParameter;
  }

  public static getDefaultValue(parameterName: string, upper: boolean): string {
    if (parameterName === 'UINT') {
      return upper ? '' : '0';
    }
    if (parameterName === 'THRESHOLD') {
      return upper ? '1' : '0';
    }
    return '';
  }

  public static buildMultiValueSeparatedList(str: string): string {
    if (str === '') {
      return '';
    }
    const seperated = this.replaceAll(this.replaceAll(str, '\'', ''), ',', MultiValueProperty.DefaultSeparator);
    return seperated;
  }

  public static buildCommaSeparatedList(value: string): string {
    return value
      ? value
          .split(MultiValueProperty.DefaultSeparator)
          .map((elem) => `'${elem}'`)
          .join(',')
      : '';
  }

  private static replaceAll(str: string, oldValue: string, newValue: string): string {
    return str.split(oldValue).join(newValue);
  }
}
