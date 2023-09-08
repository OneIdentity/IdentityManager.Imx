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
import { Router, Route } from '@angular/router';
import { IdentityRoleMembershipsService, NotificationRegistryService, ShoppingCartValidationDetailService } from 'qer';

import { ExtService, MenuItem, MenuService, TabItem} from 'qbm';

import { DashboardPluginComponent } from './dashboard-plugin/dashboard-plugin.component';
import { CartItemComplianceCheckComponent } from './item-validator/cart-item-compliance-check/cart-item-compliance-check.component';
import { isRuleStatistics } from './rules/admin/permissions-helper';
import { RequestRuleViolation } from './request/request-rule-violation';
import { RequestRuleViolationDetail } from './request/request-rule-violation-detail';
import { RoleComplianceViolationsService } from './role-compliance-violations/role-compliance-violations.service';
import { RoleComplianceViolationsComponent } from './role-compliance-violations/role-compliance-violations.component';
import { ApiService } from './api.service';
import { IdentityRuleViolationsComponent } from './identity-rule-violations/identity-rule-violations.component';

@Injectable({ providedIn: 'root' })
export class InitService {
  constructor(
    private readonly extService: ExtService,
    private readonly router: Router,
    private readonly menuService: MenuService,
    private readonly api: ApiService,
    private readonly cplService: RoleComplianceViolationsService,
    private readonly notificationService: NotificationRegistryService,
    private readonly validationDetailService: ShoppingCartValidationDetailService,
    private readonly identityRoleMembershipService: IdentityRoleMembershipsService
  ) {
    this.setupMenu();
  }

  public onInit(routes: Route[]): void {
    this.addRoutes(routes);

    this.extService.register('Dashboard-SmallTiles', { instance: DashboardPluginComponent });
    this.extService.register(RequestRuleViolation.id, new RequestRuleViolation());
    this.extService.register(RequestRuleViolationDetail.id, new RequestRuleViolationDetail());
    this.extService.register('roleOverview', {
      instance: RoleComplianceViolationsComponent,
      inputData: {
        id: 'roleCompliance',
        label: '#LDS#Heading Rule Violations',
        checkVisibility: async (ref) => this.checkCompliances(ref),
      },
      sortOrder: 0,
    });

    this.extService.register('identitySidesheet', {
      instance: IdentityRuleViolationsComponent,
      inputData:
      {
        id: 'NonCompliance',
        label: '#LDS#Heading Rule Violations',
        checkVisibility: async _ => true
      }, sortOrder: 20
    } as TabItem);
    this.validationDetailService.register(CartItemComplianceCheckComponent, 'CartItemComplianceCheck');

    // Register handler for compliance notifications
    this.notificationService.registerRedirectNotificationHandler({
      id: 'OpenNonCompliance',
      message: '#LDS#There are new rule violations for which you can grant or deny exceptions.',
      route: 'compliance/rulesviolations/approve'
    });

  }

  private async checkCompliances(referrer: any): Promise<boolean> {
    this.cplService.handleOpenLoader();
    let violationCount = 0;
    try {
      violationCount =
        (await this.cplService.getRoleComplianceViolations(referrer.tablename, referrer.entity.GetKeys()[0])).Violations?.length || 0;
    } finally {
      this.cplService.handleCloseLoader();
    }

    return violationCount > 0;
  }

  private addRoutes(routes: Route[]): void {
    const config = this.router.config;
    routes.forEach((route) => {
      config.unshift(route);
    });
    this.router.resetConfig(config);
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories((preProps: string[], features: string[]) => {
      if (!preProps.includes('COMPLIANCE') || !isRuleStatistics(features)) {
        return null;
      }

      const items = [];

      if (isRuleStatistics(features)) {
        items.push({
          id: 'CPL_Compliance_Rules',
          route: 'compliance/rules',
          title: '#LDS#Menu Entry Compliance rules',
          description: '#LDS#Shows an overview of compliance rules.',
          sorting: '25-10',
        });
      }

      const menu: MenuItem = {
        id: 'ROOT_Compliance',
        title: '#LDS#Compliance',
        sorting: '25',
        items,
      };
      return menu;
    });
  }
}
