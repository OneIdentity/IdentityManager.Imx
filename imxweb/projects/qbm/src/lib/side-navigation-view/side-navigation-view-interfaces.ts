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

import { Type } from '@angular/core';
import { AdminComponent } from '../admin/admin-component.interface';
import { IExtension } from '../ext/extension';
import { ProjectConfig } from 'imx-api-qbm';

export interface SideNavigationItem {
  name: string;
  translationKey: string;
  icon: string;
}
export interface SideNavigationComponent extends AdminComponent {
  data?: any;
  contextId?: string;
}

export interface SideNavigationExtension extends IExtension {
  caption: string;
  name: string;
  icon?: string;
  data?: any;
  instance?: Type<SideNavigationComponent>;
  contextId?: string;
}

export type SideNavigationFactory = (preProps: string[], features: string[], projectConfig?: ProjectConfig, groups?: string[]) => SideNavigationExtension;
