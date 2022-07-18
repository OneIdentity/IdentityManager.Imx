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
 * Copyright 2022 One Identity LLC.
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

import { Injectable } from '@angular/core';

import { FilterType, CompareOperator, ExtendedTypedEntityCollection } from 'imx-qbm-dbts';
import { PortalPersonUid, PortalItshopRequests } from 'imx-api-qer';

import { ClassloggerService } from 'qbm';
import { PersonService } from '../person/person.service';
import { QerApiService } from '../qer-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class ObjectsheetPersonService {

  constructor(
    private readonly qerClient: QerApiService,
    private readonly personService: PersonService,
    private readonly logger: ClassloggerService
  ) {
  }

  public async getRequests(uidPerson: string, daysBefore: number): Promise<ExtendedTypedEntityCollection<PortalItshopRequests, any>> {
    const params = {
      ShowApproved: true,
      ShowOpen: true,
      ShowDeactivated: true,
      ShowOrderByOthers: true,
      ShowSelfOrder: true,
      ShowOrdersInScope: true,
      filter: [
        {
          ColumnName: "UID_PersonOrdered",
          Type: FilterType.Compare,
          CompareOp: CompareOperator.Equal,
          Value1: uidPerson
        },
        {
          ColumnName: "OrderDate",
          Type: FilterType.Compare,
          CompareOp: CompareOperator.GreaterThan,
          Value1: new Date(new Date().setDate(new Date().getDate() - daysBefore))
        }
      ]
    };
    return this.qerClient.typedClient.PortalItshopRequests.Get(params);
  }

  public async getPerson(uidPerson: string): Promise<PortalPersonUid> {
    let person: PortalPersonUid;

    const data = await this.personService.get(uidPerson);
    if (data && data.totalCount > 0) {
      person = data.Data[0];
    } else {
      this.logger.error(this, `No portalpersonuid data found for uid "${uidPerson}"`);
    }

    return person;
  }

}
