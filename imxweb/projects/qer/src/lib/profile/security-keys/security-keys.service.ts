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
import { PortalWebauthnkey, WebauthnConfig } from "imx-api-qer";
import { QerApiService } from "../../qer-api-client.service";
import { CollectionLoadParameters, EntitySchema, ExtendedTypedEntityCollection } from "imx-qbm-dbts";
import { ConfirmationService, SnackBarService } from "qbm";

@Injectable({
  providedIn: 'root'
})
export class SecurityKeysService {

  constructor(
    private readonly api: QerApiService,
    private readonly confirmation: ConfirmationService,
    private readonly snackbar: SnackBarService
    ) {}

  public async get(parameters: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<PortalWebauthnkey, WebauthnConfig>> {
    return await this.api.typedClient.PortalWebauthnkey.Get(parameters);
  }

  public getSchema(): EntitySchema {
    return this.api.typedClient.PortalWebauthnkey.GetSchema();
  }

  public async delete(uid: string): Promise<ExtendedTypedEntityCollection<PortalWebauthnkey, WebauthnConfig>> {
    if (await this.confirmation.confirmDelete('#LDS#Heading Delete Security Key', '#LDS#Are you sure you want to delete the security key?')) {
      const deleteMessage = '#LDS#The security key has been successfully deleted.';

      this.snackbar.open({ key: deleteMessage });
      return await this.api.typedClient.PortalWebauthnkey.Delete(uid);
    };
  }

  public async canManageSecurityKeys(): Promise<boolean> {
    try {
      const data = await this.api.typedClient.PortalWebauthnkey.Get({ PageSize: 1000 });
      const config = data.extendedData;
      const keys = data.Data;

      return (config && !!config.NewKeyUrl) || (keys && keys.length > 0);
    } catch (e) {}
  }
}
