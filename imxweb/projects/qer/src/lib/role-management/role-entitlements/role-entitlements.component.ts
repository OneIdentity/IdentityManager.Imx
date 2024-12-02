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

import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalRolesEntitlements, RoleAssignmentData } from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  DbObjectKey,
  DisplayColumns,
  EntitySchema,
  IClientProperty,
  TypedEntity,
  XOrigin,
} from '@imx-modules/imx-qbm-dbts';

import { Router } from '@angular/router';
import {
  BusyService,
  ConfirmationService,
  DataSourceToolbarSettings,
  DataTableComponent,
  HelpContextualComponent,
  HelpContextualService,
  MetadataService,
  SnackBarService,
  calculateSidesheetWidth,
} from 'qbm';
import { Subscription } from 'rxjs';
import { DataManagementService } from '../data-management.service';
import { RoleService } from '../role.service';
import { EntitlementSelectorComponent } from './entitlement-selector.component';
import { RoleEntitlementActionService } from './role-entitlement-action.service';
import { RoleRecommendationResultItem } from './role-recommendations/role-recommendation-result-item';
import { RoleRecommendationsComponent } from './role-recommendations/role-recommendations.component';
@Component({
  selector: 'imx-role-entitlements',
  templateUrl: './role-entitlements.component.html',
  styleUrls: ['./role-entitlements.component.scss', '../sidesheet.scss'],
})
export class RoleEntitlementsComponent implements OnInit, AfterViewInit, OnDestroy {
  public dstSettings: DataSourceToolbarSettings;
  public navigationState: CollectionLoadParameters = {};
  public entitySchema: EntitySchema;
  public DisplayColumns = DisplayColumns;
  public displayColumns: IClientProperty[];
  public entitlementTypes: Map<string, string>;
  public canEdit: boolean;

  private subscription: Subscription;

  @ViewChild('dataTable') public dataTable: DataTableComponent<TypedEntity>;

  public readonly itemStatus = {
    enabled: (item: PortalRolesEntitlements): boolean => {
      return (
        (item.GetEntity().GetColumn('XOrigin').GetValue() & XOrigin.Direct) > 0 ||
        item.GetEntity().GetColumn('IsRequestCancellable').GetValue()
      );
    },
  };
  public selectedEntities: TypedEntity[] = [];

  public busyService = new BusyService();

  constructor(
    private readonly busyServiceElemental: EuiLoadingService,
    private readonly roleService: RoleService,
    private dataManagementService: DataManagementService,
    private readonly confirmationService: ConfirmationService,
    private readonly snackbar: SnackBarService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly metadata: MetadataService,
    private readonly translate: TranslateService,
    private roleActionService: RoleEntitlementActionService,
    private helpContextService: HelpContextualService,
    private router: Router,
  ) {
    this.canEdit = roleService.canEdit;
  }

  public async ngOnInit(): Promise<void> {
    this.entitySchema = PortalRolesEntitlements.GetEntitySchema();
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public get hasRecommendations(): boolean {
    return this.roleService.getRoleTypeInfo()?.canUseRecommendations || false;
  }

  public async ngAfterViewInit(): Promise<void> {
    this.displayColumns = [
      this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchema.Columns.XOrigin,
      this.entitySchema.Columns.XDateInserted,
    ];
    await this.navigate();
  }

  public getValidUntil(item: TypedEntity): string {
    const validUntil = new Date(item.GetEntity().GetColumn('ValidUntil').GetValue());
    return validUntil.toLocaleDateString();
  }

  public async onSearch(keywords: string): Promise<void> {
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.navigate();
  }

  public async onSelectionChanged(items: TypedEntity[]): Promise<any> {
    this.selectedEntities = items;
  }

  public async onSelectEntitlements(): Promise<void> {
    this.busyServiceElemental.show();
    const entity = this.dataManagementService.entityInteractive?.GetEntity();
    let entitlementTypes: RoleAssignmentData[];
    try {
      entitlementTypes = (await this.roleService.getEntitlementTypes(entity)) ?? [];
    } finally {
      this.busyServiceElemental.hide();
    }
    const helpId = this.roleService.getHelpContextId();
    if (helpId) this.helpContextService.setHelpContextId(helpId);
    const selectedValues = await this.sidesheet
      .open(EntitlementSelectorComponent, {
        title: await this.translate.get('#LDS#Heading Request Entitlements').toPromise(),
        subTitle: entity?.GetDisplay(),
        headerComponent: helpId ? HelpContextualComponent : undefined,
        padding: '0px',
        width: calculateSidesheetWidth(),
        testId: 'role-entitlements-new-sidesheet',
        data: {
          entitlementTypes: entitlementTypes,
          roleEntity: entity,
        },
      })
      .afterClosed()
      .toPromise();
    if (selectedValues) {
      const overlay = this.busyServiceElemental.show();
      try {
        await this.roleActionService.processEntitlementSelections(selectedValues);
      } finally {
        this.busyServiceElemental.hide(overlay);
      }

      this.subscription = this.snackbar
        .open({ key: '#LDS#The entitlement assignments have been successfully added to your shopping cart.' }, '#LDS#Go to cart', {
          duration: 5000,
        })
        .onAction()
        .subscribe(() => {
          this.sidesheet.closeAll();
          this.router.navigate(['shoppingcart']);
        });
    }
  }

  public async onNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }
    await this.navigate();
  }

  public async getTypeDescription(item: any): Promise<string> {
    const colName = this.roleService.getEntitlementFkName();
    const objKey = DbObjectKey.FromXml(item.GetEntity().GetColumn(colName).GetValue());
    const metadata = await this.metadata.GetTableMetadata(objKey.TableName);
    return metadata?.DisplaySingular || '';
  }

  public canDeleteAllSelected(): boolean {
    if (this.selectedEntities.length < 1) {
      return false;
    }

    return this.selectedEntities.findIndex((item) => !this.canDelete(item)) < 0;
  }

  public async onDeleteEntitlements(): Promise<void> {
    if (
      await this.confirmationService.confirm({
        Title: '#LDS#Heading Remove Entitlements',
        Message: '#LDS#Are you sure you want to remove the selected entitlements?',
      })
    ) {
      this.busyServiceElemental.show();
      try {
        await this.roleActionService.deleteEntitlements(this.selectedEntities);
      } finally {
        this.busyServiceElemental.hide();
        this.dataTable.clearSelection();
        this.snackbar.open(
          { key: '#LDS#The entitlements have been successfully removed. It may take some time for the changes to take effect.' },
          '#LDS#Close',
        );
        await this.navigate();
      }
    }
  }

  public isNotEffective(item: TypedEntity): boolean {
    if (!this.entitySchema.Columns.XIsInEffect) {
      return false;
    }

    return !item.GetEntity().GetColumn('XIsInEffect').GetValue();
  }

  public async onShowRecommendations(): Promise<any> {
    const entity = this.dataManagementService.entityInteractive?.GetEntity();
    const result: { items: RoleRecommendationResultItem[] } = await this.sidesheet
      .open(RoleRecommendationsComponent, {
        title: await this.translate.get('#LDS#Heading View Recommended Entitlements').toPromise(),
        subTitle: entity?.GetDisplay(),
        padding: '0px',
        width: calculateSidesheetWidth(1000),
        testId: 'role-recommendation-sidesheet',
        data: {
          tablename: this.roleService.ownershipInfo.TableName,
          uidRole: this.dataManagementService.entityInteractive?.GetEntity().GetKeys()[0],
          canEdit: this.canEdit,
        },
      })
      .afterClosed()
      .toPromise();

    if (!!result) {
      let countAdd = 0;
      let countRemove = 0;
      const overlay = this.busyServiceElemental.show();
      try {
        if (entity) {
          countAdd = await this.roleActionService.addRecommendation(
            entity,
            result.items?.filter((elem) => elem.Type.value === 0),
          );
          countRemove = await this.roleActionService.deleteRecommendations(
            entity,
            result.items?.filter((elem) => elem.Type.value === 1),
          );
        }
      } finally {
        this.busyServiceElemental.hide(overlay);
      }

      let text: string | undefined = undefined;
      switch (true) {
        case countAdd === 0 && countRemove > 0:
          text = '#LDS#The entitlements have been successfully removed. It may take some time for the changes to take effect.';
          break;
        case countAdd > 0 && countRemove === 0:
          text = '#LDS#The entitlement assignments have been successfully added to your shopping cart.';
          break;
        case countAdd > 0 && countRemove > 0:
          text =
            '#LDS#Entitlements have been successfully removed and entitlement assignments have been added to your shopping cart. It may take some time for the changes to take effect.';
      }

      if (text) {
        this.snackbar.open({ key: text }, '#LDS#Close');
      }

      if (countRemove > 0) {
        await this.navigate();
      }
    }
  }

  private async navigate(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      const entity = this.dataManagementService.entityInteractive?.GetEntity();
      const ds = await this.roleService.getEntitlements({
        id: entity?.GetKeys().join(','),
        navigationState: this.navigationState,
      });
      this.entitlementTypes = new Map();

      ds?.Data.forEach(async (item) => {
        this.entitlementTypes.set(item.GetEntity().GetKeys().toString(), await this.getTypeDescription(item));
      });

      this.dstSettings = {
        dataSource: ds,
        entitySchema: this.entitySchema,
        navigationState: this.navigationState,
        displayedColumns: this.displayColumns,
      };
    } finally {
      isBusy.endBusy();
    }
  }

  private canDelete(entity: TypedEntity): boolean {
    return this.isDirectAssignment(entity) || this.isDynamicAssignment(entity) || this.isRequestCancellable(entity);
  }

  private isDirectAssignment(entity: TypedEntity): boolean {
    const xorigin = entity.GetEntity().GetColumn('XOrigin').GetValue() as XOrigin;
    // eslint-disable-next-line no-bitwise
    return (xorigin && XOrigin.Direct === (XOrigin.Direct & xorigin)) || false;
  }

  private isDynamicAssignment(entity: TypedEntity): boolean {
    const xorigin = entity.GetEntity().GetColumn('XOrigin').GetValue() as XOrigin;
    // eslint-disable-next-line no-bitwise
    return (xorigin && XOrigin.Dynamic === (XOrigin.Dynamic & xorigin)) || false;
  }

  private isRequestCancellable(entity: TypedEntity): boolean {
    return true === entity.GetEntity().GetColumn('IsRequestCancellable')?.GetValue();
  }
}
