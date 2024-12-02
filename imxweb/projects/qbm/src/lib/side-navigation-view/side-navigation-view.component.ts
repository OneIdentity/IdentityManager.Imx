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
 * Copyright 2024 One Identity LLC.
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

import { ChangeDetectorRef, Component, HostListener, Input, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { isMobile } from '../base/sidesheet-helper';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { HelpContextualValues } from '../help-contextual/help-contextual.service';
import { SideNavigationExtension, SideNavigationItem } from './side-navigation-view-interfaces';

@Component({
  selector: 'imx-side-navigation-view',
  templateUrl: './side-navigation-view.component.html',
})
export class SideNavigationViewComponent implements OnDestroy {
  @Input() public baseUrl = '';
  @Input() public isAdmin = false;
  @Input() public componentName = '';
  @Input() public componentTitle = '';
  @Input() public contextId: HelpContextualValues;
  _navItems: (SideNavigationExtension | undefined)[] = [];
  get navItems(): (SideNavigationExtension | undefined)[] {
    return this._navItems;
  }
  @Input() set navItems(value: (SideNavigationExtension | undefined)[]) {
    this._navItems = value;
    if (value.length > 0) {
      this.setupNavItems();
      this.handleRouteParam();
    }
  }
  public navigationItems: SideNavigationItem[] = [];
  public selectedPage: string = '';
  public mobileSideNavExpanded = false;
  public showBackdrop = false;
  public contentMargin = isMobile() ? '58px' : '230px';

  @ViewChild('sideNavContent', { read: ViewContainerRef }) protected sideNavContentRef: ViewContainerRef;

  protected routerEvents$: Subscription;

  constructor(
    private readonly logger: ClassloggerService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private cdref: ChangeDetectorRef,
  ) {
    this.routerEvents$ = this.router.events.subscribe(async (val) => {
      if (this.navItems.length > 0 && val instanceof NavigationEnd) {
        this.handleRouteParam();
      }
    });
  }

  @HostListener('window:resize')
  public onResize(): void {
    this.showBackdrop = isMobile() && this.mobileSideNavExpanded;
    setTimeout(() => this.setContentMargin(), 50);
  }

  public ngOnDestroy(): void {
    if (this.routerEvents$) {
      this.routerEvents$.unsubscribe();
    }
  }

  public toggleMobileExpand(): void {
    this.mobileSideNavExpanded = !this.mobileSideNavExpanded;
    const showBackdrop = isMobile() && this.mobileSideNavExpanded;
    setTimeout(
      () => {
        this.showBackdrop = showBackdrop;
      },
      showBackdrop ? 0 : 500,
    );
  }

  public selectPage(page: string): void {
    const selectedPage = this.getItem(page, this.navItems);

    if (selectedPage?.instance == null) {
      return;
    } else {
      this.router.navigate([this.baseUrl, page]);
      if (isMobile()) {
        this.toggleMobileExpand();
      }
    }
  }

  private async setupNavItems(): Promise<void> {
    this.navigationItems = [];
    for (const item of this.navItems) {
      if (item == null) {
        continue;
      }

      const navItem = {
        name: item.name,
        translationKey: item.caption,
        icon: item.icon ?? '',
      };
      this.navigationItems.push(navItem);
    }
  }

  private setContentMargin(): void {
    this.contentMargin = !isMobile() ? '230px' : '58px';
  }

  private loadComponent(): void {
    const navItems = this.navItems;

    if (!navItems || navItems.length < 1) {
      this.logger.debug(this, `${this.componentName}: there are no ${this.selectedPage} objects to view.`);
      return;
    }

    const selectedItem = this.getItem(this.selectedPage, navItems);

    if (!selectedItem) {
      this.logger.debug(this, `${this.componentName}: the page ${this.selectedPage} was not found.`);
      return;
    }

    if (selectedItem.instance == null) {
      this.logger.debug(this, `${this.componentName}: there is no component registered for page ${this.selectedPage}`);
      return;
    }
    this.cdref.detectChanges();
    this.sideNavContentRef.clear();
    const selectedPageItem = selectedItem;
    if (selectedPageItem.instance) {
      const component = this.sideNavContentRef.createComponent(selectedPageItem.instance);
      component.instance.data = selectedPageItem.data;
      component.instance.isAdmin = this.isAdmin;
      if (!!selectedPageItem.contextId) {
        component.instance.contextId = selectedPageItem.contextId;
      }
    }
  }

  private handleRouteParam(): void {
    const tab = this.route.snapshot.paramMap.get('tab');
    if (!tab) {
      this.router.navigate([this.navItems[0]?.name], { relativeTo: this.route });
    } else {
      this.selectedPage = tab ? tab : this.navItems[0]?.name || '';
      this.loadComponent();
    }
  }

  private getItem(name: string, list: (SideNavigationExtension | undefined)[]): SideNavigationExtension | null {
    if (list == null) {
      return null;
    }

    for (var item of list) {
      if (item?.name === name) {
        return item;
      }
    }
    return null;
  }
}
