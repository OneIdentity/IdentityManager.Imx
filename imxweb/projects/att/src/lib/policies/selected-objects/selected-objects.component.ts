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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { BehaviorSubject } from 'rxjs';

import { PolicyFilter } from 'imx-api-att';
import { ClassloggerService } from 'qbm';
import { SelectecObjectsInfo } from './selected-objects-info.interface';
import { PolicyService } from '../policy.service';
import { AttestationCasesComponentParameter } from '../attestation-cases/attestation-cases-component-parameter.interface';
import { AttestationCasesComponent } from '../attestation-cases/attestation-cases.component';

@Component({
  templateUrl: './selected-objects.component.html',
  selector: 'imx-selected-objects',
  styleUrls: ['./selected-objects.component.scss']
})
export class SelectedObjectsComponent implements OnInit, OnDestroy {

  public filter: PolicyFilter;
  public uidAttestationObject: string;
  public uidPickCategory: string;
  public countMatching: number;

  @Input() public popupTitle: string;
  @Input() public popupSubtitle = '';
  @Input() public isTotal: boolean;
  @Input() public testId = '';
  @Input() public filterSubject: BehaviorSubject<SelectecObjectsInfo>;

  constructor(
    private readonly sideSheet: EuiSidesheetService,
    private readonly policyService: PolicyService,
    private readonly logger: ClassloggerService) { }

  public ngOnInit(): void {
    if (this.filterSubject) {
      this.filterSubject.subscribe(async (element: SelectecObjectsInfo) => {
        if (!element) {
          this.countMatching = -1;
          return;
        }

        this.filter = element.policyFilter;
        this.uidAttestationObject = element.uidAttestationObject;
        this.uidPickCategory = element.uidPickCategory;

        this.countMatching = await this.getMatchCount(this.filter);
        this.logger.debug(this, 'match count calculated:', this.countMatching);
      });
    }
  }

  public ngOnDestroy(): void {
    this.filterSubject.unsubscribe();
  }

  public showMatchingObjects(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const data: AttestationCasesComponentParameter = {
      subtitle: this.popupSubtitle,
      uidPickCategory: this.uidPickCategory,
      uidobject: this.uidAttestationObject,
      filter: this.filter.Elements,
      concat: this.filter ? this.filter.ConcatenationType : 'OR',
      canCreateRuns: false
    };
    this.sideSheet.open(AttestationCasesComponent, {
      title: this.popupTitle,
      subTitle: this.popupSubtitle,
      padding: '0px',
      width: 'max(600px, 60%)',
      testId: 'selected-objects-showmatching-sidesheet',
      data,
    });
  }

  private async getMatchCount(filter: PolicyFilter): Promise<number> {
    if (filter.Elements.length === 0) { return -1; }
    if (filter.Elements.findIndex(elem => elem.AttestationSubType == null ||
      elem.AttestationSubType === '') >= 0) {
      return -1;
    }

    return (await this.policyService.getObjectsForFilter(this.uidAttestationObject,
      this.uidPickCategory,
      filter, { PageSize: -1 }))
      .totalCount;
  }
}
