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
 * Copyright 2024 One Identity LLC.
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

import {
  PortalAdminResourcesQerassign,
  PortalAdminResourcesQerresource,
  PortalAdminResourcesQerreuse,
  PortalAdminResourcesQerreuseus,
  PortalRespQerassign,
  PortalRespQerresource,
  PortalRespQerreuse,
  PortalRespQerreuseus,
  ProjectConfig,
  QerProjectConfig,
  V2ApiClientMethodFactory,
} from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  CompareOperator,
  DataModel,
  EntityCollectionData,
  EntitySchema,
  FilterData,
  FilterType,
  IEntity,
  MethodDefinition,
  MethodDescriptor,
  TypedEntity,
  TypedEntityBuilder,
  TypedEntityCollectionData,
} from '@imx-modules/imx-qbm-dbts';
import { DataSourceToolbarExportMethod } from 'qbm';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { QerApiService } from '../qer-api-client.service';
import { ResourceInfo } from './resource-info.model';

@Injectable({
  providedIn: 'root',
})
export class ResourcesService {
  public readonly resourceMap: Map<string, ResourceInfo> = new Map();

  public static readonly QERResource = 'QERResource';
  public static readonly QERReuseUS = 'QERReuseUS';
  public static readonly QERReuse = 'QERReuse';
  public static readonly QERAssign = 'QERAssign';

  public readonly targets = [
    ResourcesService.QERResource,
    ResourcesService.QERReuseUS,
    ResourcesService.QERReuse,
    ResourcesService.QERAssign,
  ];
  protected config: QerProjectConfig & ProjectConfig;

  public editTexts: { [key: string]: string } = {};

  constructor(
    protected readonly project: ProjectConfigurationService,
    private readonly api: QerApiService,
  ) {
    this.registerMap();
  }

  public async get(
    tableName: string,
    isAdmin: boolean,
    parameter: CollectionLoadParameters,
  ): Promise<TypedEntityCollectionData<TypedEntity> | undefined> {
    const conf = isAdmin ? this.resourceMap.get(tableName)?.admin : this.resourceMap.get(tableName)?.resp;

    if (!conf) return undefined;
    const builder = new TypedEntityBuilder(conf.type);
    const data = await conf.get(parameter);

    return conf?.schema ? builder.buildReadWriteEntities(data, conf.schema) : undefined;
  }

  public async getDataModel(tableName: string, isAdmin: boolean, filter?: FilterData[]): Promise<DataModel> {
    const conf = isAdmin ? this.resourceMap.get(tableName)?.admin : this.resourceMap.get(tableName)?.resp;
    return await conf?.dataModel(filter);
  }

  public async getInteractive(tableName: string, id: string, isAdmin: boolean = false): Promise<TypedEntity> {
    const conf = isAdmin ? this.resourceMap.get(tableName)?.admin : this.resourceMap.get(tableName)?.resp;
    return (await conf?.interactive.Get_byid(id)).Data[0];
  }

  public getSchema(tableName: string, isAdmin: boolean, interactive: boolean): EntitySchema {
    const conf = isAdmin ? this.resourceMap.get(tableName)?.admin : this.resourceMap.get(tableName)?.resp;
    return conf == null ? null : interactive ? conf.interactive.GetSchema() : conf.schema;
  }

  public async getEditableFields(objectType: string, entity: IEntity, primary: boolean = false): Promise<string[]> {
    if (this.config == null) {
      this.config = await this.project.getConfig();
    }

    const list = primary ? this.config.OwnershipConfig?.PrimaryFields : this.config.OwnershipConfig?.EditableFields;

    return list?.[objectType].filter((name) => entity.GetSchema().Columns[name]) || [];
  }

  public async getServiceItem(tablename: string, uidResource: string): Promise<TypedEntity> {
    const filter: FilterData[] = [
      {
        Type: FilterType.Compare,
        CompareOp: CompareOperator.Equal,
        ColumnName: 'UID_AccProduct',
        Value1: uidResource,
      },
    ];

    const item = await this.resourceMap.get(tablename)?.accProduct.Get({ filter });

    return item.Data.length > 0 ? item.Data[0] : undefined;
  }

  private registerMap(): void {
    this.targets.forEach((target) => {
      this.resourceMap.set(target, { table: target });
    });

    const factory = new V2ApiClientMethodFactory();

    // QERResource
    this.editTexts[ResourcesService.QERResource] = '#LDS#Heading Edit Resource';

    let source = this.resourceMap.get(ResourcesService.QERResource);
    if (source != null) {
      source.caption = '#LDS#Resources';

      source.accProduct = this.api.typedClient.PortalResourcesQerresourceServiceitem;
      source.admin = {
        type: PortalAdminResourcesQerresource,
        get: async (parameter: any) => this.api.client.portal_admin_resources_qerresource_get(parameter),
        schema: this.api.typedClient.PortalAdminResourcesQerresource.GetSchema(),
        dataModel: async (filter: FilterData[]) => this.api.client.portal_admin_resources_qerresource_datamodel_get({ filter }),
        interactive: this.api.typedClient.PortalAdminResourcesQerresourceInteractive,
        exportMethod: () => {
          return {
            getMethod: (withProperties: string, navigationState: CollectionLoadParameters, PageSize?: number) => {
              let method: MethodDescriptor<EntityCollectionData>;
              if (PageSize) {
                method = factory.portal_admin_resources_qerresource_get({ ...navigationState, withProperties, PageSize, StartIndex: 0 });
              } else {
                method = factory.portal_admin_resources_qerresource_get({ ...navigationState, withProperties });
              }
              return new MethodDefinition(method);
            },
          };
        },
      };

      source.resp = {
        type: PortalRespQerresource,
        get: async (parameter: any) => this.api.client.portal_resp_qerresource_get(parameter),
        schema: this.api.typedClient.PortalRespQerresource.GetSchema(),
        dataModel: async (filter: FilterData[]) => this.api.client.portal_resp_qerresource_datamodel_get({ filter }),
        interactive: this.api.typedClient.PortalRespQerresourceInteractive,
        exportMethod: () => {
          return {
            getMethod: (withProperties: string, navigationState: CollectionLoadParameters, PageSize?: number) => {
              let method: MethodDescriptor<EntityCollectionData>;
              if (PageSize) {
                method = factory.portal_resp_qerresource_get({ ...navigationState, withProperties, PageSize, StartIndex: 0 });
              } else {
                method = factory.portal_resp_qerresource_get({ ...navigationState, withProperties });
              }
              return new MethodDefinition(method);
            },
          };
        },
      };
    }

    // QERReuseUS
    this.editTexts[ResourcesService.QERReuseUS] = '#LDS#Heading Edit Multi Requestable/Unsubscribable Resource';

    source = this.resourceMap.get(ResourcesService.QERReuseUS);
    if (source != null) {
      source.caption = '#LDS#Multi requestable/unsubscribable resources';
      source.accProduct = this.api.typedClient.PortalResourcesQerreuseusServiceitem;
      source.admin = {
        type: PortalAdminResourcesQerreuseus,
        get: async (parameter: any) => this.api.client.portal_admin_resources_qerreuseus_get(parameter),
        schema: this.api.typedClient.PortalAdminResourcesQerreuseus.GetSchema(),
        dataModel: async (filter: FilterData[]) => this.api.client.portal_admin_resources_qerreuseus_datamodel_get({ filter }),
        interactive: this.api.typedClient.PortalAdminResourcesQerreuseusInteractive,
        exportMethod: () => {
          return {
            getMethod: (withProperties: string, navigationState: CollectionLoadParameters, PageSize?: number) => {
              let method: MethodDescriptor<EntityCollectionData>;
              if (PageSize) {
                method = factory.portal_admin_resources_qerreuseus_get({ ...navigationState, withProperties, PageSize, StartIndex: 0 });
              } else {
                method = factory.portal_admin_resources_qerreuseus_get({ ...navigationState, withProperties });
              }
              return new MethodDefinition(method);
            },
          };
        },
      };
      source.resp = {
        type: PortalRespQerreuseus,
        get: async (parameter: any) => this.api.client.portal_resp_qerreuseus_get(parameter),
        schema: this.api.typedClient.PortalRespQerreuseus.GetSchema(),
        dataModel: async (filter: FilterData[]) => this.api.client.portal_resp_qerreuseus_datamodel_get({ filter }),
        interactive: this.api.typedClient.PortalRespQerreuseusInteractive,
        exportMethod: () => {
          return {
            getMethod: (withProperties: string, navigationState: CollectionLoadParameters, PageSize?: number) => {
              let method: MethodDescriptor<EntityCollectionData>;
              if (PageSize) {
                method = factory.portal_resp_qerreuseus_get({ ...navigationState, withProperties, PageSize, StartIndex: 0 });
              } else {
                method = factory.portal_resp_qerreuseus_get({ ...navigationState, withProperties });
              }
              return new MethodDefinition(method);
            },
          };
        },
      };
    }
    // QERReuse
    this.editTexts[ResourcesService.QERReuse] = '#LDS#Heading Edit Multi-Request Resource';
    source = this.resourceMap.get(ResourcesService.QERReuse);
    if (source != null) {
      source.caption = '#LDS#Multi-request resources';
      source.accProduct = this.api.typedClient.PortalResourcesQerreuseServiceitem;
      source.admin = {
        type: PortalAdminResourcesQerreuse,
        get: async (parameter: any) => this.api.client.portal_admin_resources_qerreuse_get(parameter),
        schema: this.api.typedClient.PortalAdminResourcesQerreuse.GetSchema(),
        dataModel: async (filter: FilterData[]) => this.api.client.portal_admin_resources_qerreuse_datamodel_get({ filter }),
        interactive: this.api.typedClient.PortalAdminResourcesQerreuseInteractive,
        exportMethod: () => {
          return {
            getMethod: (withProperties: string, navigationState: CollectionLoadParameters, PageSize?: number) => {
              let method: MethodDescriptor<EntityCollectionData>;
              if (PageSize) {
                method = factory.portal_admin_resources_qerreuse_get({ ...navigationState, withProperties, PageSize, StartIndex: 0 });
              } else {
                method = factory.portal_admin_resources_qerreuse_get({ ...navigationState, withProperties });
              }
              return new MethodDefinition(method);
            },
          };
        },
      };
      source.resp = {
        type: PortalRespQerreuse,
        get: async (parameter: any) => this.api.client.portal_resp_qerreuse_get(parameter),
        schema: this.api.typedClient.PortalRespQerreuse.GetSchema(),
        dataModel: async (filter: FilterData[]) => this.api.client.portal_resp_qerreuse_datamodel_get({ filter }),
        interactive: this.api.typedClient.PortalRespQerreuseInteractive,
        exportMethod: () => {
          return {
            getMethod: (withProperties: string, navigationState: CollectionLoadParameters, PageSize?: number) => {
              let method: MethodDescriptor<EntityCollectionData>;
              if (PageSize) {
                method = factory.portal_resp_qerreuse_get({ ...navigationState, withProperties, PageSize, StartIndex: 0 });
              } else {
                method = factory.portal_resp_qerreuse_get({ ...navigationState, withProperties });
              }
              return new MethodDefinition(method);
            },
          };
        },
      };
    }

    // QERAssign
    this.editTexts[ResourcesService.QERAssign] = '#LDS#Heading Edit Assignment Resource';
    source = this.resourceMap.get(ResourcesService.QERAssign);
    if (source != null) {
      source.caption = '#LDS#Assignment resources';
      source.accProduct = this.api.typedClient.PortalResourcesQerassignServiceitem;
      source.admin = {
        type: PortalAdminResourcesQerassign,
        get: async (parameter: any) => this.api.client.portal_admin_resources_qerassign_get(parameter),
        schema: this.api.typedClient.PortalAdminResourcesQerassign.GetSchema(),
        dataModel: async (filter: FilterData[]) => this.api.client.portal_admin_resources_qerassign_datamodel_get({ filter }),
        interactive: this.api.typedClient.PortalAdminResourcesQerassignInteractive,
        exportMethod: () => {
          return {
            getMethod: (withProperties: string, navigationState: CollectionLoadParameters, PageSize?: number) => {
              let method: MethodDescriptor<EntityCollectionData>;
              if (PageSize) {
                method = factory.portal_admin_resources_qerassign_get({ ...navigationState, withProperties, PageSize, StartIndex: 0 });
              } else {
                method = factory.portal_admin_resources_qerassign_get({ ...navigationState, withProperties });
              }
              return new MethodDefinition(method);
            },
          };
        },
      };
      source.resp = {
        type: PortalRespQerassign,
        get: async (parameter: any) => this.api.client.portal_resp_qerassign_get(parameter),
        schema: this.api.typedClient.PortalRespQerassign.GetSchema(),
        dataModel: async (filter: FilterData[]) => this.api.client.portal_resp_qerassign_datamodel_get({ filter }),
        interactive: this.api.typedClient.PortalRespQerassignInteractive,
        exportMethod: () => {
          return {
            getMethod: (withProperties: string, navigationState: CollectionLoadParameters, PageSize?: number) => {
              let method: MethodDescriptor<EntityCollectionData>;
              if (PageSize) {
                method = factory.portal_resp_qerassign_get({ ...navigationState, withProperties, PageSize, StartIndex: 0 });
              } else {
                method = factory.portal_resp_qerassign_get({ ...navigationState, withProperties });
              }
              return new MethodDefinition(method);
            },
          };
        },
      };
    }
  }

  public getExportMethod(tableName: string, isAdmin: boolean): DataSourceToolbarExportMethod | undefined {
    return isAdmin ? this.resourceMap.get(tableName)?.admin?.exportMethod?.() : this.resourceMap.get(tableName)?.resp?.exportMethod?.();
  }
}
