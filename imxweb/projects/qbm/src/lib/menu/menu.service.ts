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
 * Copyright 2021 One Identity LLC.
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
import { ProjectConfig } from 'imx-api-qbm';

import { MenuFactory, MenuItem } from './menu-item/menu-item.interface';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private factories: MenuFactory[] = [];

  public addMenuFactories(...factories: MenuFactory[]): void {
    this.factories.push(...factories);
  }

  public clearFactories(): void {
    this.factories = [];
  }

  public getMenuItems(
    preProps: string[],
    groups: string[],
    allowEmpty: boolean = false,
    projectConfig?: ProjectConfig): MenuItem[] {
    const menuItems: MenuItem[] = [];

    this.factories
      .map(factory => factory(preProps, groups, projectConfig))
      .filter(menu => menu && (allowEmpty || (menu.items && menu.items.length > 0)))
      .sort((item1, item2) => this.compareMenuItems(item1, item2))
      .forEach(menu => {
        const existing = menu.id != null && menuItems.find(item => item.id === menu.id);
        if (existing) {
          if (existing.items) {
            // Here only splice it there are items, otherwise this is a flat home button and it already exists
            existing.items.splice(-1, 0, ...menu.items);
            existing.items = this.sortMenuItems(existing.items);
          }
        } else {
          menuItems.push(menu);
          menu.items = this.sortMenuItems(menu.items);
        }
      });

    return menuItems;
  }

  private sortMenuItems(items: MenuItem[]): MenuItem[] {
    if (!items) {
      return items;
    }
    return items.sort((item1, item2) => this.compareMenuItems(item1, item2))
      .filter((item, index, array) => !item.id || index === array.findIndex(t => t.id === item.id));
  }

  private compareMenuItems(item1: MenuItem, item2: MenuItem): number {
    return +!item1.sorting - +!item2.sorting || item1.sorting?.toString().localeCompare(item2.sorting?.toString());
  }
}
