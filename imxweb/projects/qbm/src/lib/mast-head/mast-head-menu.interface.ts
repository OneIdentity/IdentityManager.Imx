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

import { MastHeadMenuItem } from './mast-head-menu-item.interface';

/**
 * Dynmically inserted mnenues into the masthead.
 */
export interface MastHeadMenu {
  /**
   * The name of the Elemental UI icon.
   */
  iconName: string;

  /**
   * Returns whether the icon should be highlighted.
   */
  highlighted?: boolean;

  badgeCount?: number;

  /**
   * The unique identifier of the menu.
   * Must only contain letters, numbers and "-".
   */
  identifier: string;

  /**
   * List of {@link MastHeadMenuItem|menu items}.
   */
  menuItems: MastHeadMenuItem[];

  /**
   * Needed by Type Guard.
   */
  type: 'menu' | 'button';
}
