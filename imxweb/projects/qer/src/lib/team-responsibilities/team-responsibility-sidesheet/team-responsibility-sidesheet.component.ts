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

import { Component, Inject } from '@angular/core';
import { EUI_SIDESHEET_DATA, EuiSidesheetService } from '@elemental-ui/core';
import { ResponsibilityData } from 'imx-api-qer';

@Component({
  selector: 'imx-team-responsibility-sidesheet',
  templateUrl: './team-responsibility-sidesheet.component.html',
})
export class TeamResponsibilitySidesheetComponent {
  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: { extendedData: ResponsibilityData },
    private readonly sidesheetService: EuiSidesheetService
  ) {}

  closeSidesheet(): void {
    this.sidesheetService.close();
  }
}
