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

import { Component, ComponentFactoryResolver, Injector, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';

import { DynamicTabDataProviderDirective, ExtService, TabItem } from 'qbm';
import { IdentityRoleMembershipsComponent } from '../identity-role-memberships/identity-role-memberships.component';
import { IdentityRoleMembershipsService } from '../identity-role-memberships/identity-role-memberships.service';

@Component({
  selector: 'imx-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.scss']
})
export class AssignmentsComponent implements OnInit {

  public currentTab: TabItem;
  public dynamicTabs: TabItem[] = [];

  get isMobile(): boolean {
    return document.body.offsetWidth <= 768;
  }

  public mobileSideNavExpanded = false;
  public showBackdrop = false;
  public contentMargin = this.isMobile ? '10px' : '230px';

  @Input() public parameters: { objecttable: string; objectuid: string; tableName?: string };
  @ViewChild('sideNavContent', { read: ViewContainerRef, static: true }) private sideNavContentRef: ViewContainerRef;

  constructor(
    private readonly roleService: IdentityRoleMembershipsService,
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    private readonly extService: ExtService,
    private readonly injector: Injector
  ) { }

  public async ngOnInit(): Promise<void> {

    const tabs: TabItem[] = [];

    this.roleService.targets.forEach(target => {
      const tabitem: TabItem = {
        instance: IdentityRoleMembershipsComponent,
        inputData: {
          id: target,
          checkVisibility: async _ => true,
          label: this.roleService.getTabData(target).label
        },
        sortOrder: this.roleService.getTabData(target).index
      };
      tabs.push(tabitem);
    });


    this.dynamicTabs = [...(await this.extService.getFittingComponents<TabItem>('identityAssignment',
      (ext) => ext.inputData.checkVisibility(this.parameters))), ...tabs]
      .sort((a: TabItem, b: TabItem) => a.sortOrder - b.sortOrder);

    this.updateTab(this.dynamicTabs[0]);
  }

  public updateTab(tab: TabItem): void {
    this.currentTab = tab;
    this.sideNavContentRef.clear();
    const dataProvider = Injector.create({
      providers: [{
        provide: DynamicTabDataProviderDirective,
        useValue: { data: { ...this.parameters, ...{ tablename: tab.inputData.id } } }
      }],
      parent: this.injector,
    });

    this.sideNavContentRef.createComponent(this.componentFactoryResolver.resolveComponentFactory(this.currentTab.instance),
      undefined, dataProvider);
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


}
