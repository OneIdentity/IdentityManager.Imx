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

import { PortalPersonAll } from 'imx-api-qer';
import { DisplayColumns } from 'imx-qbm-dbts';
import { DataSourceWrapper } from 'qbm';
import { PersonService } from '../person/person.service';
import { AddressbookDetail } from './addressbook-detail/addressbook-detail.interface';

@Injectable({
  providedIn: 'root',
})
export class AddressbookService {
  public abortController = new AbortController();

  constructor(private readonly personService: PersonService) {}

  public async createDataSourceWrapper(columnNames: string[], identifier?: string): Promise<DataSourceWrapper> {
    const entitySchema = this.personService.schemaPersonAll;

    const displayedColumns = columnNames
      .filter((columnName) => entitySchema.Columns[columnName])
      .map((columnName) => entitySchema.Columns[columnName]);
    displayedColumns.unshift(entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]);

    return new DataSourceWrapper(
      (state, requestOpts, isInitial) =>
        isInitial ? Promise.resolve({ totalCount: 0, Data: [] }) : this.personService.getAll(state, requestOpts),
      displayedColumns,
      entitySchema,
      {
        dataModel: await this.personService.getDataModel(),
        getGroupInfo: (parameters) => this.personService.getGroupInfo(parameters),
        groupingFilterOptions: ['withmanager', 'orphaned'],
      },
      identifier
    );
  }

  public async getDetail(personAll: PortalPersonAll, columnNames: string[]): Promise<AddressbookDetail> {
    const personUid = personAll.GetEntity().GetKeys()[0];

    const personDetailEntity = (await this.personService.get(personUid)).Data[0].GetEntity();

    const entitySchema = this.personService.schemaPersonUid;

    return {
      columns: columnNames
        .filter((columnName) => entitySchema.Columns[columnName])
        .map((columnName) => personDetailEntity.GetColumn(columnName)),
      personUid,
    };
  }

  public abortCall(): void {
    this.abortController.abort();
    this.abortController = new AbortController();
  }
}
