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

import { UserModelService } from '../user/user-model.service';
import {
  isCancelPwO,
  isPasswordHelpdesk,
  isPersonAdmin,
  isPersonManager,
  isResourceAdmin,
  isRoleAdmin,
  isRoleStatistics,
  isRuleAdmin,
  isShopAdmin,
  isShopStatistics,
  isStructAdmin,
  isStructStatistics,
  hasFeatures,
  isAuditor,
  isStatistics,
  isTsbNameSpaceAdminBase,
} from './qer-permissions-helper';

@Injectable({
  providedIn: 'root',
})
export class QerPermissionsService {
  constructor(private readonly userService: UserModelService) {}

  public async isPersonAdmin(): Promise<boolean> {
    return isPersonAdmin((await this.userService.getFeatures()).Features);
  }
  public async isPersonManager(): Promise<boolean> {
    return isPersonManager((await this.userService.getFeatures()).Features);
  }
  public async isStructAdmin(): Promise<boolean> {
    return isStructAdmin((await this.userService.getFeatures()).Features);
  }
  public async isShopAdmin(): Promise<boolean> {
    return isShopAdmin((await this.userService.getFeatures()).Features);
  }
  public async isRuleAdmin(): Promise<boolean> {
    return isRuleAdmin((await this.userService.getFeatures()).Features);
  }
  public async isCancelPwO(): Promise<boolean> {
    return isCancelPwO((await this.userService.getFeatures()).Features);
  }
  public async isResourceAdmin(): Promise<boolean> {
    return isResourceAdmin((await this.userService.getFeatures()).Features);
  }
  public async isRoleAdmin(): Promise<boolean> {
    return isRoleAdmin((await this.userService.getFeatures()).Features);
  }
  public async hasFeatures(features: string[]): Promise<boolean> {
    return hasFeatures((await this.userService.getFeatures()).Features, features);
  }
  public async isRoleStatistics(): Promise<boolean> {
    return isRoleStatistics((await this.userService.getFeatures()).Features);
  }
  public async isShopStatistics(): Promise<boolean> {
    return isShopStatistics((await this.userService.getFeatures()).Features);
  }
  public async isStructStatistics(): Promise<boolean> {
    return isStructStatistics((await this.userService.getFeatures()).Features);
  }
  public async isPasswordHelpdesk(): Promise<boolean> {
    return isPasswordHelpdesk((await this.userService.getFeatures()).Features);
  }
  public async isStatistics(): Promise<boolean> {
    return isStatistics((await this.userService.getFeatures()).Features);
  }
  public async isAuditor(): Promise<boolean> {
    return isAuditor((await this.userService.getGroups()).map((group) => group.Name));
  }
  public async isTsbNameSpaceAdminBase(): Promise<boolean> {
    return isTsbNameSpaceAdminBase((await this.userService.getGroups()).map((group) => group.Name));
  }
}
