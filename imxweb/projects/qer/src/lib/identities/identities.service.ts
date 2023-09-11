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
import { Subject } from 'rxjs';

import { ClassloggerService, DataSourceToolbarExportMethod } from 'qbm';
import {
  CollectionLoadParameters,
  TypedEntityCollectionData,
  FilterType,
  CompareOperator,
  EntityCollectionData,
  GroupInfoData,
  DataModel,
  EntitySchema,
  ExtendedTypedEntityCollection,
  FilterData,
  MethodDefinition,
  MethodDescriptor,
} from 'imx-qbm-dbts';
import { PortalPersonReports, PortalPersonAll, PortalAdminPerson, PortalPersonUid, ViewConfigData, V2ApiClientMethodFactory } from 'imx-api-qer';
import { QerApiService } from '../qer-api-client.service';
import { QerPermissionsService } from '../admin/qer-permissions.service';
import { DuplicateCheckParameter } from './create-new-identity/duplicate-check-parameter.interface';

@Injectable()
export class IdentitiesService {

  public authorityDataDeleted: Subject<string> = new Subject();


  constructor(
    private readonly qerClient: QerApiService,
    private readonly logger: ClassloggerService,
    private readonly qerPermissions: QerPermissionsService) { }

  public get personReportsSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalPersonReports.GetSchema();
  }

  public get personSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalPersonUid.GetSchema();
  }

  public get personAllSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalPersonAll.GetSchema();
  }

  public get adminPersonSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalAdminPerson.GetSchema();
  }


  public getAttestationHelperAlertDescription(count: { total: number; forUser: number; }): { description: string; value?: any; }[] {
    // #LDS#There are currently no pending attestation cases.

    return [
      { description: '#LDS#Here you can get an overview of all attestations cases for this object.' },
      { description: '#LDS#Pending attestation cases: {0}', value: count.total },
      { description: '#LDS#Pending attestation cases you can approve or deny: {0}', value: count.forUser }
    ];
  }

  /**
   * Gets a list of persons.
   *
   * @param navigationState Page size, start index, search and filtering options etc,.
   *
   * @returns Wrapped list of Persons.
   */
  public async getAllPerson(navigationState: CollectionLoadParameters): Promise<TypedEntityCollectionData<PortalPersonAll>> {
    this.logger.debug(this, `Retrieving person list`);
    this.logger.trace('Navigation state', navigationState);
    return this.qerClient.typedClient.PortalPersonAll.Get(navigationState);
  }

  public async getAllPersonAdmin(navigationState: CollectionLoadParameters): Promise<TypedEntityCollectionData<PortalAdminPerson>> {
    this.logger.debug(this, `Retrieving person list`);
    this.logger.trace('Navigation state', navigationState);
    return this.qerClient.typedClient.PortalAdminPerson.Get(navigationState);
  }

  /**
   * Retrieves details of a person.
   * @param id Id of the person to retrieve
   *
   * @returns Details of person.
   */
  public async getPerson(uid: string, navigationState?: CollectionLoadParameters): Promise<PortalPersonUid> {
    this.logger.debug(this, `Retrieving person list`);
    this.logger.trace('Navigation state', navigationState);
    return (await this.qerClient.typedClient.PortalPersonUid.Get(uid, navigationState)).Data[0];
  }

  public exportAdminPerson(navigationState?: CollectionLoadParameters): DataSourceToolbarExportMethod {
    const factory = new V2ApiClientMethodFactory();
    return {
      getMethod: (withProperties: string, PageSize?: number) => {
        let method: MethodDescriptor<EntityCollectionData>;
        if (PageSize) {
          method = factory.portal_admin_person_get({...navigationState, withProperties, PageSize, StartIndex: 0})
        } else {
          method = factory.portal_admin_person_get({...navigationState, withProperties})
        }
        return new MethodDefinition(method);
      }
    }
  }

  public exportPerson(navigationState?: CollectionLoadParameters): DataSourceToolbarExportMethod {
    const factory = new V2ApiClientMethodFactory();
    return {
      getMethod: (withProperties: string, PageSize?: number) => {
        let method: MethodDescriptor<EntityCollectionData>;
        if (PageSize) {
          method = factory.portal_person_reports_get({...navigationState, withProperties, PageSize, StartIndex: 0 });
        } else {
          method = factory.portal_person_reports_get({...navigationState, withProperties});
        }
        return new MethodDefinition(method);
      }
    }
  }

  /**
   * Gets the reports (directly/indirectly subordinated identities) of a person.
   *
   * @param navigationState Page size, start index, search and filtering options etc,.
   *
   * @returns Wrapped list of Persons.
   */
  public async getReportsOfManager(navigationState: CollectionLoadParameters):
    Promise<TypedEntityCollectionData<PortalPersonReports>> {
    this.logger.debug(this, `Retrieving reports of the manager`);
    this.logger.trace('Navigation state', navigationState);
    return this.qerClient.typedClient.PortalPersonReports.Get(navigationState);
  }

  public async getGroupedAllPerson(columns: string, navigationState: CollectionLoadParameters): Promise<GroupInfoData> {
    this.logger.debug(this, `Retrieving person list`);
    this.logger.trace('Navigation state', navigationState);

    return this.qerClient.client.portal_admin_person_group_get(
      {
        by: columns,
        def: '',
        StartIndex: navigationState.StartIndex,
        PageSize: navigationState.PageSize,
        withcount: true,
        withmanager: '',
        orphaned: '',
        deletedintarget: '',
        isinactive: ''
      }
    );
  }

  public async userIsAdmin(): Promise<boolean> {
    return this.qerPermissions.isPersonAdmin();
  }

  /**
   * Retrieves details of an admin person.
   * @param id Id of the admin person to retrieve
   *
   * @returns Details of admin person.
   */
  public async getAdminPerson(id: string): Promise<PortalAdminPerson> {
    const getPersonNavigationState: CollectionLoadParameters = {
      filter: [
        {
          ColumnName: 'UID_Person',
          Type: FilterType.Compare,
          CompareOp: CompareOperator.Equal,
          Value1: id,
        },
      ],
    };
    this.logger.debug(this, `Retrieving admin person with Id ${id}`);
    return (await this.qerClient.typedClient.PortalAdminPerson.Get(getPersonNavigationState)).Data[0];
  }

  public async getPersonInteractive(uid: string): Promise<TypedEntityCollectionData<PortalPersonReports>> {
    return this.qerClient.typedClient.PortalPersonReportsInteractive.Get_byid(uid);
  }

  public async getDataModelAdmin(): Promise<DataModel> {
    return this.qerClient.client.portal_admin_person_datamodel_get(undefined);
  }

  public async getDataModel(): Promise<DataModel> {
    return this.qerClient.client.portal_person_all_datamodel_get(undefined);
  }

  public async getDataModelReport(): Promise<DataModel> {
    return this.qerClient.client.portal_person_reports_datamodel_get(undefined);
  }

  public async deleteIdentity(id: string): Promise<EntityCollectionData> {
    return this.qerClient.client.portal_admin_person_delete(id);
  }

  public async createEmptyEntity(): Promise<PortalPersonReports> {
    return (await this.qerClient.typedClient.PortalPersonReportsInteractive.Get()).Data[0];
  }

  public buildFilterForduplicates(parameter: DuplicateCheckParameter): FilterData[] {
    const filter = [];
    if (parameter.firstName != null && parameter.firstName !== ''
      && parameter.lastName != null && parameter.lastName !== '') {
      filter.push(this.buildFilter('FirstName', parameter.firstName));
      filter.push(this.buildFilter('LastName', parameter.lastName));
    }

    if (parameter.centralAccount != null && parameter.centralAccount !== '') {
      filter.push(this.buildFilter('CentralAccount', parameter.centralAccount));
    }

    if (parameter.defaultEmailAddress != null && parameter.defaultEmailAddress !== '') {
      filter.push(this.buildFilter('DefaultEmailAddress', parameter.defaultEmailAddress));
    }

    return filter;
  }

  public async getDuplicates(parameter: CollectionLoadParameters)
    : Promise<Promise<ExtendedTypedEntityCollection<PortalPersonAll, any>>> {

    if (parameter.filter?.length === 0) {
      return { Data: [], totalCount: 0 };
    }
    return this.qerClient.typedClient.PortalPersonAll.Get(parameter);
  }

  private buildFilter(column: string, value: string): FilterData {
    return {
      CompareOp: CompareOperator.Equal,
      Type: FilterType.Compare,
      ColumnName: column,
      Value1: value
    };
  }
}
