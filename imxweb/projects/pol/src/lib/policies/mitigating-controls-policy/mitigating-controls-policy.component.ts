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

import { Component, Input, OnInit } from '@angular/core';
import { PoliciesService } from '../policies.service';
import { EuiLoadingService } from '@elemental-ui/core';
import { CdrFactoryService, ColumnDependentReference } from 'qbm';

/**
 * Used to get and display mitigating controls for each policy
 */
@Component({
  selector: 'imx-mitigating-controls-policy',
  templateUrl: './mitigating-controls-policy.component.html',
  styleUrls: ['./mitigating-controls-policy.component.scss'],
})
export class MitigatingControlsPolicyComponent implements OnInit {
  @Input() public readonly objectUid: string;
  @Input() public isMControlPerViolation: boolean;

  public mControls: ColumnDependentReference[];

  /**
   * @ignore only for dep injection
   */
  constructor(
    private apiService: PoliciesService,
    private readonly busyService: EuiLoadingService,
    private cdrService: CdrFactoryService
  ) {}

  /**
   * Setup component with mitigating controls
   */
  public ngOnInit(): void {
    this.getMitigatingControls();
  }

  /**
   * Calls the api and map the results into display cdrs
   */
  public async getMitigatingControls(): Promise<void> {
    this.busyService.show();
    try {
      this.mControls = (await this.apiService.getMitigatingControls(this.objectUid)).Data.map((control) =>
        this.cdrService.buildCdr(control.GetEntity(), control.UID_MitigatingControl.Column.ColumnName)
      );
    } finally {
      this.busyService.hide();
    }
  }
}
