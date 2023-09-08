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

import { Component } from "@angular/core";
import { PortalPersonAll } from "imx-api-qer";
import { QerApiService } from "qer";

@Component({
  templateUrl: './start.component.html'
})
export class StartComponent {

  constructor(private qerApi: QerApiService) { }

  persons: PortalPersonAll[] = [];
  totalCount = 0;
  busy = false;

  async loadPersonData() {

    try {
      this.busy = true;

      // load some address book data from the API Server.
      // This call uses the default parameters, which will
      // return the first 20 identities in the database.
      const personData = await this.qerApi.typedClient.PortalPersonAll.Get();

      this.persons = personData.Data;
      this.totalCount = personData.totalCount;
    } finally {
      // Even if the call fails, reset the busy flag
      this.busy = false;
    }
  }

}