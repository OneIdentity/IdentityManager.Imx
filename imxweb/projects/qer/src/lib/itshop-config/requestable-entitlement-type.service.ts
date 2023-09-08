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

import { Injectable } from "@angular/core";
import { QerApiService } from "../qer-api-client.service";
import { IRequestableEntitlementType } from "./irequestable-entitlement-type";
import { ResourceEntitlementType } from "./resource-entitlement-type";

@Injectable({ providedIn: 'root' })
export class RequestableEntitlementTypeService {

  constructor(qerApi: QerApiService) {
    const types = [
      new ResourceEntitlementType("QERResource",
        qerApi.typedClient.PortalShopConfigEntitlementsQerresource),
      new ResourceEntitlementType("QERReuse",
        qerApi.typedClient.PortalShopConfigEntitlementsQerreuse),
      new ResourceEntitlementType("QERReuseUS",
        qerApi.typedClient.PortalShopConfigEntitlementsQerreuseus),
      new ResourceEntitlementType("QERAssign",
        qerApi.typedClient.PortalShopConfigEntitlementsQerassign)
    ];
    this.typeProviders = [
      () => Promise.resolve(this.enableResourceTypes ? types : [])
    ];
  }
  private typeProviders: (() => Promise<IRequestableEntitlementType[]>)[];

  /** Specifies whether the default resource types are exposed as candidate object
   * types for assignment in the IT shop.
   */
  public enableResourceTypes: boolean = true;

  async GetTypes(): Promise<IRequestableEntitlementType[]> {
    const all = await Promise.all(this.typeProviders.map(x => x()));
    return all.reduce((x, y) => x.concat(y));
  }

  Register(typeProvider: () => Promise<IRequestableEntitlementType[]>) {
    this.typeProviders.push(typeProvider);
  }

}