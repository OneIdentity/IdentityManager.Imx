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
import { EuiTopNavigationItem, EuiTopNavigationItemType } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { ProjectConfig } from 'imx-api-qbm';

import { MenuFactory, MenuItem } from './menu-item/menu-item.interface';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private factories: MenuFactory[] = [];

  constructor(
    private readonly translate: TranslateService
  ) { }

  public addMenuFactories(...factories: MenuFactory[]): void {
    this.factories.push(...factories);
  }

  public clearFactories(): void {
    this.factories = [];
  }

  public async getMenuItems(preProps: string[], features: string[], allowEmpty: boolean = false, projectConfig?: ProjectConfig, groups?: string[]): Promise<EuiTopNavigationItem[]> {
    const menuItems: MenuItem[] = [];

    this.factories
      .map(factory => factory(preProps, features, projectConfig, groups || []))
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

    return await this.getNavigationItems(menuItems);
  }

  private async getNavigationItems(menuItems: MenuItem[]): Promise<EuiTopNavigationItem[]> {
    const navItems: EuiTopNavigationItem[] = [];

    for (const menuItem of menuItems) {
      const hasSubItems = menuItem.items && menuItem.items.length > 0;
      const caption = await this.translate.get(menuItem.title).toPromise();
      const navItem: EuiTopNavigationItem = {
        type: hasSubItems ? EuiTopNavigationItemType.Menu : EuiTopNavigationItemType.RouterLink,
        text: caption,
        routerLinkActiveOptions: {
          matrixParams: 'exact',
          queryParams: 'exact',
          paths: 'subset',
          fragment: 'exact'
        },
      };
      if (hasSubItems) {
        navItem.items = await this.getNavigationItems(menuItem.items);
      } else {
        navItem.url = menuItem.route ? menuItem.route : menuItem.navigationCommands.commands;
      }
      navItems.push(navItem);
    }
    return navItems;
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
