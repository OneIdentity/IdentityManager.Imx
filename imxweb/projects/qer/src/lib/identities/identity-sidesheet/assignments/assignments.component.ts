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

import { Component, Injector, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';

import { FormControl, FormGroup } from '@angular/forms';
import { EuiSelectOption } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { DynamicTabDataProviderDirective, ExtService, isMobile, TabItem } from 'qbm';
import { IdentityRoleMembershipsComponent } from '../identity-role-memberships/identity-role-memberships.component';
import { IdentityRoleMembershipsService } from '../identity-role-memberships/identity-role-memberships.service';

interface SelectorForm {
  selector: FormControl<string>;
}

@Component({
  selector: 'imx-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.scss'],
})
export class AssignmentsComponent implements OnInit {
  public currentTab: TabItem | undefined;

  public mobileSideNavExpanded = false;
  public showBackdrop = false;
  public contentMargin = isMobile() ? '10px' : '230px';

  public options: EuiSelectOption[];
  public formGroup: FormGroup<SelectorForm> = new FormGroup({
    selector: new FormControl<string>('', { nonNullable: true }),
  });

  private tabItems: TabItem[] = [];

  @Input() public parameters: { objecttable: string; objectuid: string; tableName?: string };
  @ViewChild('content', { static: true, read: ViewContainerRef }) content!: ViewContainerRef;

  constructor(
    private readonly roleService: IdentityRoleMembershipsService,
    private readonly extService: ExtService,
    private readonly injector: Injector,
    private readonly translate: TranslateService,
  ) {}

  public async ngOnInit(): Promise<void> {
    const tabs: TabItem[] = [];

    this.roleService.targets.forEach((target) => {
      const tabitem: TabItem = {
        instance: IdentityRoleMembershipsComponent,
        inputData: {
          id: target,
          checkVisibility: async (_) => true,
          label: this.roleService.getTabData(target)?.label || '',
        },
        sortOrder: this.roleService.getTabData(target)?.index,
      };
      tabs.push(tabitem);
    });

    this.tabItems = [
      ...(await this.extService.getFittingComponents<TabItem>('identityAssignment', (ext) =>
        ext.inputData.checkVisibility(this.parameters),
      )),
      ...tabs,
    ].sort((a: TabItem, b: TabItem) => (a?.sortOrder || 0) - (b?.sortOrder || 0));

    this.options = this.tabItems.map((elem) => ({ display: this.translate.instant(elem.inputData.label), value: elem.inputData.id }));
    this.formGroup.controls.selector.setValue(this.options[0].value);

    this.updateTab(this.options[0]);
  }

  public updateTab(tab: EuiSelectOption | EuiSelectOption[]): void {
    const id = Object.hasOwn(tab, 'value') ? (tab as EuiSelectOption).value : '';
    this.currentTab = this.tabItems.find((elem) => elem.inputData.id === id);
    if (this.currentTab == null) {
      return;
    }
    this.content?.clear();
    const dataProvider = Injector.create({
      providers: [
        {
          provide: DynamicTabDataProviderDirective,
          useValue: { data: { ...this.parameters, ...{ tablename: this.currentTab.inputData.id } } },
        },
      ],
      parent: this.injector,
    });
    if (this.currentTab?.instance != null) {
      this.content.createComponent(this.currentTab.instance, { injector: dataProvider });
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
}
