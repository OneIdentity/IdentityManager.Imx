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

import { ErrorHandler, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
  PortalAdminPerson,
  PortalPersonReports,
  PortalRespTeamResponsibilities,
  ResponsibilitiesExtendedData,
  ResponsibilityChangeData,
  ResponsibilityData,
} from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  DataModel,
  DbObjectKey,
  EntitySchema,
  ExtendedTypedEntityCollection,
  GroupInfoData,
} from '@imx-modules/imx-qbm-dbts';
import { SnackBarService } from 'qbm';
import { QerApiService } from '../qer-api-client.service';
import { CartItemsService } from '../shopping-cart/cart-items.service';
import { UserModelService } from '../user/user-model.service';
import { TeamResponsibilityStatusDialogComponent } from './team-responsibility-status-dialog/team-responsibility-status-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class TeamResponsibilitiesService {
  constructor(
    private readonly qerClient: QerApiService,
    private readonly snackbar: SnackBarService,
    private readonly cartItemService: CartItemsService,
    private readonly userModelService: UserModelService,
    private readonly dialogService: MatDialog,
    private readonly router: Router,
    private readonly errorHandler: ErrorHandler,
  ) {}

  public get responsibilitySchema(): EntitySchema {
    return this.qerClient.typedClient.PortalRespTeamResponsibilities.GetSchema();
  }

  public async get(
    parameters: CollectionLoadParameters,
    signal?: AbortSignal,
  ): Promise<ExtendedTypedEntityCollection<PortalRespTeamResponsibilities, ResponsibilitiesExtendedData>> {
    return this.qerClient.typedClient.PortalRespTeamResponsibilities.Get(parameters, { signal });
  }

  public async getGroups(column: string, parameters: CollectionLoadParameters, signal?: AbortSignal): Promise<GroupInfoData> {
    return this.qerClient.client.portal_resp_team_responsibilities_group_get(
      {
        by: column,
        def: '',
        StartIndex: parameters.StartIndex,
        PageSize: parameters.PageSize,
        filter: parameters.filter,
        withcount: true,
        forinactive: parameters.forinactive,
      },
      { signal },
    );
  }

  public async getDataModel(): Promise<DataModel> {
    return this.qerClient.client.portal_resp_team_responsibilities_datamodel_get();
  }

  public async countInactiveIdentity(): Promise<number> {
    const responsibilities = await this.get({ forinactive: '1', PageSize: -1 });
    return responsibilities.totalCount;
  }

  public async removeResponsibilities(responsibilities: PortalRespTeamResponsibilities[], reassign = false): Promise<void> {
    await Promise.all(
      responsibilities.map(async (responsibility) => {
        const responsibilityData = DbObjectKey.FromXml(responsibility.XObjectKey.value);
        const request: ResponsibilityChangeData = {
          Assignments: [{ DeleteAssignment: true, ObjectKeyAssignment: responsibility.ObjectKeyAssignment.value }],
        };
        await this.qerClient.client.portal_resp_team_responsibilities_change_post(
          responsibilityData.TableName,
          responsibilityData.Keys.join(','),
          request,
        );
      }),
    );
    if (!reassign && responsibilities.length > 1) {
      this.snackbar.open({ key: '#LDS#The responsibilities have been successfully removed.' }, '#LDS#Close', { duration: 3000 });
    } else if (!reassign) {
      this.snackbar.open({ key: '#LDS#The responsibility has been successfully removed.' }, '#LDS#Close', { duration: 3000 });
    }
  }
  public async assignResponsibility(
    responsibility: PortalRespTeamResponsibilities,
    identities: (PortalPersonReports | PortalAdminPerson)[],
    extendedData: ResponsibilityData | undefined,
    reassign = false,
  ): Promise<void> {
    const responsibilityData = DbObjectKey.FromXml(responsibility.XObjectKey.value);
    let request: ResponsibilityChangeData;
    if (!!responsibility.ObjectKeyAssignment.value) {
      if (extendedData?.IsRequestable) {
        const recipients = identities.map((identity) => identity.GetEntity().GetKeys().join(','));
        await this.cartItemService.addItemsFromRoles([responsibility.ObjectKeyRole.value], recipients);
        this.userModelService.reloadPendingItems();
        if (reassign) {
          await this.removeResponsibilities([responsibility], true);
        }
      } else {
        request = {
          Assignments: [
            {
              DeleteAssignment: reassign,
              ObjectKeyAssignment: responsibility.ObjectKeyAssignment.value,
              UidPersonAdd: identities.map((identity) => identity.GetEntity().GetKeys().join(',')),
            },
          ],
        };
        await this.qerClient.client.portal_resp_team_responsibilities_change_post(
          responsibilityData.TableName,
          responsibilityData.Keys.join(','),
          request,
        );
      }
    } else {
      request = {
        References: identities.map((identity) => ({
          UidSourceColumn: responsibility.UID_SourceColumn.value,
          UidPersonAssignTo: identity.GetEntity().GetKeys().join(','),
        })),
      };
      await this.qerClient.client.portal_resp_team_responsibilities_change_post(
        responsibilityData.TableName,
        responsibilityData.Keys.join(','),
        request,
      );
    }
    if (!reassign) {
      const snackbarMessage =
        identities.length === 1
          ? '#LDS#The responsibility has been successfully assigned to "{0}".'
          : '#LDS#The responsibility has been successfully assigned to {0} additional identities.';
      const snackbarParam = identities.length === 1 ? identities[0].GetEntity().GetDisplay() : identities.length;
      this.snackbar.open({ key: snackbarMessage, parameters: [snackbarParam] }, '#LDS#Close', { duration: 3000 });
    }
  }

  public async reassignResponsibilities(
    responsibilities: PortalRespTeamResponsibilities[],
    identities: (PortalPersonReports | PortalAdminPerson)[],
    extendedData: (ResponsibilityData | undefined)[],
  ): Promise<void> {
    for (let index = 0; index < responsibilities.length; index++) {
      try {
        if (
          responsibilities.findIndex((responsibility) => responsibility.XObjectKey.value === responsibilities[index].XObjectKey.value) ==
          index
        ) {
          await this.assignResponsibility(responsibilities[index], identities, extendedData[index], true);
        } else {
          await this.removeResponsibilities([responsibilities[index]], true);
        }
      } catch (error) {
        this.errorHandler.handleError(error);
      }
    }
    const requestableResponsibilities = extendedData.filter((data) => data?.IsRequestable).length;
    const reassignResponsibilities = extendedData.filter((data) => !data?.IsRequestable).length;
    const identityParam = identities.length === 1 ? identities[0].GetEntity().GetDisplay() : identities.length;
    if (!!reassignResponsibilities && !requestableResponsibilities) {
      let snackbarMessage = '';
      if (reassignResponsibilities === 1) {
        snackbarMessage =
          identities.length === 1
            ? '#LDS#The responsibility has been successfully reassigned to "{0}".'
            : '#LDS#The responsibility has been successfully reassigned to {0} identities.';
      } else {
        snackbarMessage =
          identities.length === 1
            ? '#LDS#{1} responsibilities have been successfully reassigned to "{0}".'
            : '#LDS#{1} responsibilities have been successfully reassigned to {0} identities.';
      }
      this.snackbar.open({ key: snackbarMessage, parameters: [identityParam, reassignResponsibilities] }, '#LDS#Close');
    } else {
      this.dialogService
        .open(TeamResponsibilityStatusDialogComponent, {
          data: {
            reassignedResponsibilities: reassignResponsibilities,
            cartResponsibilities: requestableResponsibilities,
            newResponsibilities: identities.length,
          },
        })
        .afterClosed()
        .subscribe(async (result) => {
          if (result) {
            this.router.navigate(['shoppingcart']);
          }
        });
    }
  }
}
