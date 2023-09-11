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

import { DependencyToConfirm, OpsupportNamespaces, OpsupportOutstandingTables, OutstandingAction, OutstandingObject } from 'imx-api-dpr';
import { ExtendedTypedEntityCollection } from 'imx-qbm-dbts';
import { ApiService } from '../api.service';

@Injectable()
export class OutstandingService {


  constructor(private apiService: ApiService) { }


  public async getNamespaces(): Promise<ExtendedTypedEntityCollection<OpsupportNamespaces, unknown>> {
    return this.apiService.typedClient.OpsupportNamespaces.Get({ PageSize: 1024 });
  }

  public async getTableData(newNamespace: OpsupportNamespaces):
    Promise<ExtendedTypedEntityCollection<OpsupportOutstandingTables, unknown>> {
    return this.apiService.typedClient.OpsupportOutstandingTables.Get(
      { PageSize: 1024, namespace: newNamespace.Ident_DPRNameSpace.value });
  }

  public async getDependencies(action: OutstandingAction, values: string[]): Promise<DependencyToConfirm[]> {
    return this.apiService.client.opsupport_outstanding_dependencies_post(action,
      values);
  }

  public async getOutstandingTable(tableName: string, namespace: string, actionfilter: string): Promise<OutstandingObject[]> {
    return this.apiService.client.opsupport_outstanding_table_get(tableName, {
      namespace: namespace,
      actionfilter: actionfilter
    });
  }


  public getOutstandingNamespace(namespace: string, actionfilter: string): Promise<OutstandingObject[]> {
    return this.apiService.client.opsupport_outstanding_namespace_get(namespace, { actionfilter: actionfilter });
  }

  public processObjects(action: OutstandingAction, bulk: boolean, objects: string[]): Promise<any> {
    return this.apiService.client.opsupport_outstanding_process_post(action, objects, { bulk: bulk });
  }
}
