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

import { Component } from '@angular/core';
import { DataManagementService } from '../data-management.service';
import { RoleService } from '../role.service';

@Component({
  selector: 'imx-role-memberships',
  templateUrl: './role-memberships.component.html',
  styleUrls: ['./role-memberships.component.scss', '../sidesheet.scss'],
})
export class RoleMembershipsComponent {
  public autoMembershipsValid = true;

  constructor(
    private readonly roleService: RoleService,
    private dataManagementService: DataManagementService,
    ) {
    this.dataManagementService.autoMembershipDirty$.subscribe((flag) => {
      this.autoMembershipsValid = !flag;
    })
  }

  public get canBeDynamic(): boolean {
    return this.roleService.canHaveDynamicMemberships(this.dataManagementService.entityInteractive.GetEntity().TypeName);
  }

  public get isDynamic(): boolean {
    return this.dataManagementService.entityInteractive.GetEntity().GetSchema().Columns['UID_DynamicGroup'] && this.dataManagementService.entityInteractive.GetEntity().GetColumn('UID_DynamicGroup').GetValue();
  }

  public get uidDynamicGroup(): boolean {
    return this.dataManagementService.entityInteractive.GetEntity().GetColumn('UID_DynamicGroup').GetValue();
  }

  public canHavePrimaryMemberships(): boolean {
    return this.roleService.ownershipInfo && this.roleService.targetMap.get(this.roleService.ownershipInfo.TableName).membership.hasPrimaryMemberships();
  }

}
