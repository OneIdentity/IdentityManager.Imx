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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EuiSidesheetService } from '@elemental-ui/core';
import { PortalAdminRoleOrg, TeamRoleData } from '@imx-modules/imx-api-rmb';
import { IEntity, ReadOnlyEntity } from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import { calculateSidesheetWidth, SnackBarService } from 'qbm';
import {
  DataManagementService,
  QerPermissionsService,
  RoleDetailComponent,
  RoleEntitlementActionService,
  RoleRecommendationResultItem,
  RoleRecommendationsComponent,
  RoleService,
} from 'qer';
import { RmbApiService } from '../rmb-api-client.service';

@Component({
  selector: 'imx-team-role',
  templateUrl: './team-role.component.html',
})
export class TeamRoleComponent implements OnInit {
  public teamRole: TeamRoleData;
  public loadingState = false;
  public showTeamRole = false;
  private orgTag = 'Org';
  constructor(
    private readonly rmbApiService: RmbApiService,
    private readonly sidesheetService: EuiSidesheetService,
    private readonly translateService: TranslateService,
    private readonly roleService: RoleService,
    private readonly dataManagementService: DataManagementService,
    private readonly route: ActivatedRoute,
    private readonly permissionService: QerPermissionsService,
    private readonly roleEntitlementActionService: RoleEntitlementActionService,
    private readonly snackbar: SnackBarService,
  ) {}

  async ngOnInit(): Promise<void> {
    const canCreate = (await this.rmbApiService.client.portal_roles_config_businessroles_get()).EnableNewTeamRole;
    if (await this.permissionService.isPersonManager()) {
      await this.getTeamRole();
      this.showTeamRole = canCreate || this.existTeamRole;
    }
  }

  /**
   * Load team role data and open details sidesheet
   */
  public async onManageTeamRole(): Promise<void> {
    if (!this.teamRole.Uid) {
      return;
    }
    try {
      this.loadingState = true;
      const roleItem = (
        await this.roleService.targetMap.get(this.orgTag)?.interactiveResp?.Get_byid(this.teamRole.Uid)
      )?.Data[0].GetEntity();
      if (!roleItem) {
        throw new Error('There was an error getting details about this role');
      }
      await this.setRoleData(roleItem);
      await this.dataManagementService.setInteractive();
      this.sidesheetService
        .open(RoleDetailComponent, {
          title: this.translateService.instant('#LDS#Heading Edit Team Role'),
          subTitle: roleItem.GetDisplay(),
          padding: '0px',
          width: calculateSidesheetWidth(1250, 0.7),
          disableClose: true,
          testId: `${this.orgTag}-role-detail-sidesheet`,
        })
        .afterClosed()
        .subscribe(() => {
          this.getTeamRole();
        });
    } finally {
      this.loadingState = false;
    }
  }
  /**
   * Load recomenndation options and open sidesheet where you can select the options.
   */
  public async onCreateTeamRole(): Promise<void> {
    try {
      this.loadingState = true;
      const teamRoleRecommendOptions = await this.rmbApiService.client.portal_resp_team_teamrole_recommendations_get();
      this.sidesheetService
        .open(RoleRecommendationsComponent, {
          title: this.translateService.instant('#LDS#Heading Create Team Role'),
          padding: '0px',
          width: calculateSidesheetWidth(1000),
          testId: 'role-recommendation-sidesheet',
          data: {
            recommendation: teamRoleRecommendOptions.Items || [],
            canEdit: true,
            infoText:
              '#LDS#Here you can create a team role. To do this, select the entitlements that are currently assigned individually to the members of your team. After you have created the team role, the entitlements are added to your shopping cart and you must submit the request. This team role will then be automatically assigned to all members of your team (along with the aforementioned entitlements).',
            selectionTitle: '#LDS#Selected entitlements',
            submitButtonTitle: '#LDS#Create team role',
            actionColumnTitle: '#LDS#Distribution among the team',
            hideActionConfirmation: true,
            applyWithoutSelection: true,
            noDataText:
              '#LDS#Currently, no entitlements can be recommended. You can still create the team role and assign entitlements later.',
          },
        })
        .afterClosed()
        .subscribe((result: { items: RoleRecommendationResultItem[] }) => {
          if (!!result) {
            this.saveRecommendations(result.items);
          }
        });
    } finally {
      this.loadingState = false;
    }
  }
  /**
   * Check loaded team role data existence.
   * @returns boolean
   */
  public get existTeamRole(): boolean {
    return !!this.teamRole?.Uid;
  }
  /**
   * Loading team role.
   */
  private async getTeamRole(): Promise<void> {
    try {
      this.loadingState = true;
      this.teamRole = await this.rmbApiService.client.portal_resp_team_teamrole_get();
    } finally {
      this.loadingState = false;
    }
  }
  /**
   * This function is called after selected options of recommended team roles.
   * Save the selection and add recommendations to the cart.
   * @param resultItem
   */
  private async saveRecommendations(resultItem: RoleRecommendationResultItem[]): Promise<void> {
    try {
      // It can take a moment for the team role to become visible over the ownerships API because of DBQUeue calculations.
      this.loadingState = true;
      const collectionData = await this.rmbApiService.client.portal_resp_team_teamrole_post({
        ObjectKeys: resultItem.map((item) => item.ObjectKey.value),
      });
      // This entity represents the new team role.
      if (!collectionData.Entities) {
        throw new Error('There was an error posting this role recommendation');
      }
      const entity = new ReadOnlyEntity(PortalAdminRoleOrg.GetEntitySchema(), collectionData.Entities[0]);
      await this.setRoleData(entity);
      const count = await this.roleEntitlementActionService.addRecommendation(entity, resultItem);
      if (count > 0) {
        this.snackbar.open({ key: '#LDS#The entitlement assignments have been successfully added to your shopping cart.' }, '#LDS#Close');
      }
      this.getTeamRole();
    } finally {
      this.loadingState = false;
    }
  }

  /**
   * Set role service sidesheet data with the required params.
   * @param IEntity
   */
  private async setRoleData(entity: IEntity): Promise<void> {
    const isAdmin = this.route.snapshot?.url[0]?.path === 'admin';
    const isStructureAdmin = await this.permissionService.isStructAdmin();
    this.roleService.setSidesheetData({
      ownershipInfo: {
        TableName: this.orgTag,
        Count: 0,
      },
      entity,
      isAdmin,
      canEdit: !isAdmin || (isAdmin && isStructureAdmin),
    });
  }
}
