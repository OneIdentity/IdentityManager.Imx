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

import { IReadValue, IEntityColumn, IEntity } from 'imx-qbm-dbts';
import { PwoData } from 'imx-api-qer';
import { ColumnDependentReference } from 'qbm';

export interface RequestParameterDataEntity {
  DecisionLevel: IReadValue<number>;
  UiOrderState: IReadValue<string>;
  UID_QERWorkingMethod: IReadValue<string>;
  propertyInfo: ColumnDependentReference[];
  pwoData: PwoData;
  qerWorkingMethod?: string;
  parameterColumns: IEntityColumn[];
  GetEntity: () => IEntity;
  complianceRuleViolation?: boolean;
  isArchived?: boolean;
  UID_AccProduct: IReadValue<string>;
  TableName: IReadValue<string>;
}
