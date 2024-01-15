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

import { DataSourceToolbarSelectedFilter } from '../data-source-toolbar-filters.interface';
import { DataSourceToolbarSettings } from '../data-source-toolbar-settings';
import { SqlWizardExpression } from 'imx-qbm-dbts';

export interface FilterWizardSidesheetData {
  id: string;
  filterExpression: SqlWizardExpression;
  settings: DataSourceToolbarSettings;
  selectedFilters: DataSourceToolbarSelectedFilter[];
  isDataSourceLocal: boolean;
}

export interface FilterFormState {
  filterIdentifier: FilterTypeIdentifier;
  dirty: boolean;
  canClearFilters: boolean;
}

export enum FilterTypeIdentifier {
  Predefined = 'Predefined',
  Custom = 'Custom',
  TargetSystem = 'TargetSystem',
}
