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
 * Copyright 2022 One Identity LLC.
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

import { Component, ComponentFactoryResolver, HostListener, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { UserModelService } from '../user/user-model.service';
import { DataExplorerRegistryService } from './data-explorer-registry.service';
import { ClassloggerService, SystemInfoService } from 'qbm';
import { IDataExplorerExtension } from './data-explorer-extension';

export interface SideNavItem {
  name: string;
  translationKey: string;
  icon: string;
}

@Component({
  templateUrl: './data-explorer-view.component.html',
  styleUrls: ['./data-explorer-view.component.scss'],
})
export class DataExplorerViewComponent implements OnInit, OnDestroy {

  get isMobile(): boolean {
    return document.body.offsetWidth <= 768;
  }
  public navigationItems: SideNavItem[] = [];
  public selectedPage: string;
  public mobileSideNavExpanded = false;
  public showBackdrop = false;
  public contentMargin = this.isMobile ? '58px' : '230px';

  @ViewChild('sideNavContent', { read: ViewContainerRef, static: true }) private sideNavContentRef: ViewContainerRef;


  private routerEvents$: Subscription;
  private navItems: IDataExplorerExtension[];

  constructor(
    private readonly logger: ClassloggerService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly systemInfoService: SystemInfoService,
    private readonly userModelService: UserModelService,
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    private readonly dataExplorerRegistryService: DataExplorerRegistryService,
  ) {
    this.routerEvents$ = this.router.events.subscribe(async (val) => {
      if (val instanceof NavigationEnd) {
        await this.handleRouteParam();
        this.loadComponent();
      }
    });
  }

  @HostListener('window:resize')
  public onResize(): void {
    this.showBackdrop = this.isMobile && this.mobileSideNavExpanded;
    setTimeout(() => this.setContentMargin(), 50);
  }

  public async ngOnInit(): Promise<void> {
    await this.setupNavItems();
    this.loadComponent();
  }

  public ngOnDestroy(): void {
    if (this.routerEvents$) {
      this.routerEvents$.unsubscribe();
    }
  }

  public toggleMobileExpand(): void {
    this.mobileSideNavExpanded = !this.mobileSideNavExpanded;
    const showBackdrop = this.isMobile && this.mobileSideNavExpanded;
    setTimeout(
      () => {
        this.showBackdrop = showBackdrop;
      },
      showBackdrop ? 0 : 500
    );
  }

  public selectPage(page: string): void {
    this.router.navigate([`admin/dataexplorer/${page}`]);

    if (this.isMobile) {
      this.toggleMobileExpand();
    }
  }

  private async loadNavItems(): Promise<void> {
    const systemInfo = await this.systemInfoService.get();
    const groups = (await this.userModelService.getGroups()).map(group => group.Name);
    this.navItems = this.dataExplorerRegistryService.getNavItems(systemInfo.PreProps, groups);
  }

  private async setupNavItems(): Promise<void> {
    this.navigationItems = [];

    await this.loadNavItems();

    for (const item of this.navItems) {
      if (!item) {
        continue;
      }
      this.navigationItems.push({
        name: item.name,
        translationKey: item.caption,
        icon: item.icon,
      });

    }
  }

  private setContentMargin(): void {
    this.contentMargin = !this.isMobile ? '230px' : '58px';
  }

  private loadComponent(): void {
    const navItems = this.navItems;

    if (!navItems || navItems.length < 1) {
      this.logger.debug(this, `data-explorer-view: there are no data explorer objects to view.`);
      return;
    }

    const selected = navItems.filter(item => item.name === this.selectedPage);

    if (!selected || selected.length < 1) {
      this.logger.debug(this, `data-explorer-view: the page ${this.selectedPage} was not found.`);
      return;
    }

    this.sideNavContentRef.clear();
    const selectedPageItem = selected[0];
    const component =
      this.sideNavContentRef.createComponent(this.componentFactoryResolver.resolveComponentFactory(selectedPageItem.instance));
    component.instance.data = selectedPageItem.data;
    component.instance.isAdmin = true;
  }


  private async handleRouteParam(): Promise<void> {
    await this.loadNavItems();
    const tab = this.route.snapshot.paramMap.get('tab');
    this.selectedPage = tab ? tab : this.navItems[0].name;
  }
}
