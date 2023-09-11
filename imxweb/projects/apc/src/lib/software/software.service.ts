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

import { Injectable } from '@angular/core';

import { PortalResourcesApplicationsMembership, PortalRespApplication } from 'imx-api-apc';
import { ProjectConfig, QerProjectConfig } from 'imx-api-qer';
import {
  CollectionLoadParameters,
  CompareOperator,
  DataModel,
  EntitySchema,
  ExtendedTypedEntityCollection,
  FilterData,
  FilterType,
  IEntity,
  TypedEntity,
  TypedEntityBuilder,
  TypedEntityCollectionData,
} from 'imx-qbm-dbts';
import { ProjectConfigurationService, QerApiService } from 'qer';
import { ApcApiService } from '../apc-api-client.service';
import { ResourceInfo } from '../app-info.model';

@Injectable({
  providedIn: 'root',
})
export class SoftwareService {
  public readonly resourceMap: Map<string, ResourceInfo> = new Map();

  protected config: QerProjectConfig & ProjectConfig;

  constructor(
    protected readonly project: ProjectConfigurationService,
    private readonly api: ApcApiService,
    private readonly qerClient: QerApiService
  ) {}

  private appInfo = {
    table: 'Application',
    caption: '#LDS#Software',
    accProduct: this.api.typedClient.PortalResourcesApplicationServiceitem,
    resp: {
      type: PortalRespApplication,
      get: async (parameter: any) => this.api.client.portal_resp_application_get(parameter),
      schema: this.api.typedClient.PortalRespApplication.GetSchema(),
      dataModel: async (filter?: FilterData[]) => this.api.client.portal_resp_application_datamodel_get({ filter }),
      interactive: this.api.typedClient.PortalRespApplicationInteractive,
    },
  };

  public async get(parameter: CollectionLoadParameters): Promise<TypedEntityCollectionData<TypedEntity>> {
    const conf = this.appInfo.resp;

    if (!conf) return null;
    const builder = new TypedEntityBuilder(conf.type);
    const data = await conf.get(parameter);

    return builder.buildReadWriteEntities(data, conf.schema);
  }

  public async getDataModel(filter?: FilterData[]): Promise<DataModel> {
    return await this.appInfo.resp.dataModel(filter);
  }

  public async getInteractive(id: string): Promise<PortalRespApplication> {
    return (await this.appInfo.resp.interactive.Get_byid(id)).Data[0];
  }

  public getSchema(interactive: boolean): EntitySchema {
    return interactive ? this.appInfo.resp.interactive.GetSchema() : this.appInfo.resp.schema;
  }
  public get membershipSchema(): EntitySchema {
    return this.api.typedClient.PortalResourcesApplicationsMembership.GetSchema();
  }

  public async getEditableFields(objectType: string, entity: IEntity, primary: boolean = false): Promise<string[]> {
    if (this.config == null) {
      this.config = await this.project.getConfig();
    }

    const list = primary ? this.config.OwnershipConfig.PrimaryFields : this.config.OwnershipConfig.EditableFields;
    return list[objectType].filter((name) => entity.GetSchema().Columns[name]);
  }

  public async getServiceItem(uidAccProduct: string): Promise<TypedEntity> {
    const filter: FilterData[] = [
      {
        Type: FilterType.Compare,
        CompareOp: CompareOperator.Equal,
        ColumnName: 'UID_AccProduct',
        Value1: uidAccProduct,
      },
    ];

    const item = await this.appInfo.accProduct.Get({ filter });

    return item.Data.length > 0 ? item.Data[0] : undefined;
  }

  public async getMemberShips(
    uidApplication: string,
    parameter: CollectionLoadParameters
  ): Promise<ExtendedTypedEntityCollection<PortalResourcesApplicationsMembership, unknown>> {
    return this.api.typedClient.PortalResourcesApplicationsMembership.Get(uidApplication, parameter);
  }

  public async deleteGroupMembers(uidSoftware: string, uidPersonList: string[]): Promise<any[]> {
    return await Promise.all(
      uidPersonList.map(async (item) => {
        (await this.api.typedClient.PortalResourcesApplicationsMembership.Delete(uidSoftware,item)).Data[0]
      }));
  }

  public async unsubscribeMembership(item: TypedEntity): Promise<void> {
    await this.qerClient.client.portal_itshop_unsubscribe_post({ UidPwo: [item.GetEntity().GetColumn('UID_PersonWantsOrg').GetValue()] });
  }
}
