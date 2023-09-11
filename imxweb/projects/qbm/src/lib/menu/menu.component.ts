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

import { Component, ErrorHandler, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { MenuItem } from './menu-item/menu-item.interface';
import { ClassloggerService } from '../classlogger/classlogger.service';

/**
 * Displays a menu and provides logic for navigation
 */
@Component({
  selector: 'imx-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
/**
 * The menu structure
 */
  @Input() public menuItems: MenuItem[];

  private errorMessageNonExistingRoute = '';

  constructor(
    private readonly router: Router,
    private readonly logger: ClassloggerService,
    private readonly errorHandler: ErrorHandler,
    translator: TranslateService) {
    translator.get('#LDS#the route does not exist').subscribe(value => this.errorMessageNonExistingRoute = value);
  }

  public isActive(item: MenuItem): boolean {
    if (!item) {
      return false;
    }

    if (item.items) {
      for (const subitem of item.items) {
        if (this.isActive(subitem)) {
          return true;
        }
      }
    }

    const itemIsActive = this.router.url === item.route;

    if (itemIsActive) {
      this.logger.debug('currently active menu item:', item);
    }

    return itemIsActive;
  }

  public navigate(item: MenuItem): void {
    if (item.trigger) {
      this.logger.debug(this, 'call trigger');
      item.trigger();
      return;
    }

    if (item.route) {
      const route = this.router.config.find(configItem => configItem.path === item.route);

      if (route) {
        this.logger.debug(this, 'navigate to route');
        this.router.navigate([`/${item.route}`]);
      } else {
        this.errorHandler.handleError(this.errorMessageNonExistingRoute);
      }

      this.logger.trace(this, item.route);
    }

    if (item.navigationCommands) {
      this.logger.debug(this, 'navigate to route');
      this.router.navigate(item.navigationCommands.commands);
      this.logger.trace(this, item.navigationCommands);
    }
  }
}
