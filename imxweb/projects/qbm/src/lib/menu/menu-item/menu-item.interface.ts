import { ProjectConfig } from 'imx-api-qbm';
import { NavigationCommandsMenuItem } from './navigation-commands-menu-item.interface';

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

/** Represents a single menu item. */
export interface MenuItem {
  /** Unique identifier for the menu item. */
  readonly id?: string;

  /** Display name. */
  readonly title: string;

  /** Returns a descriptive text, intended for tooltips. */
  readonly description?: string;

  /** Property for simple navigation. */
  readonly route?: string;

  /** Property for sorting the items. */
  readonly sorting?: string;

  /** Property for complex navigation, including outlets etc. */
  navigationCommands?: NavigationCommandsMenuItem;

  /** Called when the menu item is clicked. */
  readonly trigger?: () => void;

  /** Submenu items. */
  items?: MenuItem[];

}

export type MenuFactory = (preProps: string[], features: string[], projectConfig: ProjectConfig, groups?: string[]) => MenuItem;
