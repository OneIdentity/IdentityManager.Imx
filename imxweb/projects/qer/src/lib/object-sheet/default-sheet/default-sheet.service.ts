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

import { DbObjectKey, EntityData } from 'imx-qbm-dbts';
import { ShapeData } from 'imx-api-qbm';

import { QerApiService } from '../../qer-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class DefaultSheetService {

  constructor(
    private readonly qerClient: QerApiService
  ) { }

  public async getDbObject(objectKey: DbObjectKey): Promise<EntityData> {
    // TODO #258578 do not depend on portal -> in context of another api-project use them e.g. opsupport_dbobject_get
    return this.qerClient.client.portal_dbobject_get(objectKey.TableName, objectKey.Keys.join(','));
  }

  public async getHyperviewShapeData(objectKey: DbObjectKey): Promise<ShapeData[]> {
    // TODO #258578 do not depend on portal -> in context of another api-project use them e.g. opsupport_hyperview_get
    return this.qerClient.client.portal_hyperview_get(objectKey.TableName, objectKey.Keys.join(','));
  }
}
