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

import { CollectionLoadParameters, DataModel, EntitySchema, ExtendedTypedEntityCollection, GroupInfoData } from 'imx-qbm-dbts';
import { ListReportContentData, PortalReportData } from 'imx-api-rps';

/**
 * Provides methods for API interaction 
 * Is used for navigating though the data of a list report
 * 
 */
export interface ListReportDataProvider {
  /**
   * Fetches the data of a list report from the server
   * @param parameter navigation parameters
   * @returns an {@link ExtendedTypedEntityCollection} with the content of a report
   */
  get: (parameter: CollectionLoadParameters) => Promise<ExtendedTypedEntityCollection<PortalReportData, ListReportContentData>>;

  /**
   * The entity schema of the {@link ExtendedTypedEntityCollection}
   */
  entitySchema: EntitySchema;

  /**
   * Fetches the data model of a list report from the server
   * @returns The data model of the list report
   */
  getDataModel: () => Promise<DataModel>;

  /**
   * Fetches the group info data of a list report from the server
   * @param parameters the navigation state for the group
   * @returns a {@link GroupInfoData} object
   */
  getGroupInfo: (parameters: { by?: string; def?: string } & CollectionLoadParameters) => Promise<GroupInfoData>;
}
