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

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { TranslateService } from '@ngx-translate/core';

import {
  SnackBarService,
  DataSourceToolbarSettings,
  ClassloggerService,
  DataTileBadge,
  TextContainer,
  SettingsService,
  SystemInfoService,
  MetadataService,
  DataTableComponent,
  DataTilesComponent,
  ClientPropertyForTableColumns,
  BusyService,
} from 'qbm';
import { PortalEntitlement, PortalApplication, PortalEntitlementServiceitem, EntitlementSystemRoleInput } from 'imx-api-aob';
import { CollectionLoadParameters, IClientProperty, ValType, DisplayColumns, EntitySchema, TypedEntity, DbObjectKey } from 'imx-qbm-dbts';
import { EntitlementsService } from './entitlements.service';
import { LifecycleAction } from '../lifecycle-actions/lifecycle-action.enum';
import { LifecycleActionComponent } from '../lifecycle-actions/lifecycle-action.component';
import { EntitlementsAddComponent } from './entitlement-add/entitlements-add.component';
import { EntitlementsType } from './entitlements.model';
import { EntitlementFilter } from './entitlement-filter';
import { ShopsService } from '../shops/shops.service';
import { ServiceItemsService } from '../service-items/service-items.service';
import { EntitlementDetailComponent } from './entitlement-detail/entitlement-detail.component';
import { EntitlementWrapper } from './entitlement-wrapper.interface';
import { EntitlementEditAutoAddComponent } from './entitlement-edit-auto-add/entitlement-edit-auto-add.component';
import { EntitlementEditAutoAddService } from './entitlement-edit-auto-add/entitlement-edit-auto-add.service';

/**
 * A component for viewing, editing and acting all {@link PortalEntitlement|entitlements} for a given {@link PortalApplication|application}.
 *
 * @see addEntitlements
 * @see addRoles
 * @see publish
 * @see unpublish
 * @see unassign
 */
@Component({
  selector: 'imx-entitlements',
  templateUrl: './entitlements.component.html',
  styleUrls: ['./entitlements.component.scss'],
})
export class EntitlementsComponent implements OnChanges {
  /** The {@link PortalApplication|application} */
  @Input() public application: PortalApplication;
  @Output() public reloadRequested = new EventEmitter<void>();
  @ViewChild('table') public table: DataTableComponent<PortalEntitlement>;
  @ViewChild('tiles') public tiles: DataTilesComponent;

  public readonly DisplayColumns = DisplayColumns; // Enables use of this static class in Angular Templates.
  public readonly EntitlementsType = EntitlementsType; // Enables use of this static class in Angular Templates.
  public dstSettings: DataSourceToolbarSettings;
  public navigationState: CollectionLoadParameters;
  public selections: PortalEntitlement[] = [];
  public publishDisabled = true;
  public unpublishDisabled = true;
  public unassignedDisabled = true;
  public isUsedInDialog = false;
  public readonly entitySchema: EntitySchema;
  public readonly filter = new EntitlementFilter();
  public busyService = new BusyService();

  public isSystemRoleEnabled: boolean;
  public isLoading = false;

  /**
   * Checks, if there's a dynamic assignment rule attached to this application
   */
  public get hasConditionForDynamicAssignment(): boolean {
    return (
      this.application.extendedDataRead?.SqlExpression?.Expressions?.length &&
      this.application.extendedDataRead?.SqlExpression?.Expressions[0].Expression.Expressions.length > 0
    );
  }

  /**
   * Defines a set of status information methods, that are used to determine the status of each element in the entitlements table
   */
  public readonly status = {
    getBadges: (entitlement: PortalEntitlement): DataTileBadge[] => this.entitlementsProvider.getEntitlementBadges(entitlement),
    enabled: (_: PortalEntitlement): boolean => {
      return true;
    },
  };

  private readonly displayedColumns: ClientPropertyForTableColumns[];
  private readonly updatedTableNames: string[] = [];

  constructor(
    private readonly logger: ClassloggerService,
    private matDialog: MatDialog,
    private entitlementsProvider: EntitlementsService,
    private readonly euiBusyService: EuiLoadingService,
    private readonly dialog: MatDialog,
    private readonly snackbar: SnackBarService,
    private readonly shopsProvider: ShopsService,
    private readonly serviceItemsProvider: ServiceItemsService,
    private readonly platform: Platform,
    private readonly translateService: TranslateService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly settingsService: SettingsService,
    private readonly systemInfo: SystemInfoService,
    private readonly metadata: MetadataService,
    private readonly autoAddService: EntitlementEditAutoAddService
  ) {
    this.entitySchema = entitlementsProvider.entitlementSchema;
    this.displayedColumns = [
      this.entitySchema.Columns.Ident_AOBEntitlement,
      {
        Type: ValType.String,
        ColumnName: 'badges',
        untranslatedDisplay: '#LDS#Badges',
      },
      {
        Type: ValType.String,
        ColumnName: 'type',
        untranslatedDisplay: '#LDS#Type',
      },
      this.entitySchema.Columns.UID_AERoleOwner,
      {
        Type: ValType.Date,
        ColumnName: 'assigned',
        untranslatedDisplay: '#LDS#Assigned',
      },
      {
        Type: ValType.String,
        ColumnName: 'status',
        untranslatedDisplay: '#LDS#Status',
      },
    ];

    this.busyService.busyStateChanged.subscribe((elem) => (this.isLoading = elem));
  }

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.application?.currentValue?.UID_AOBApplication.value === changes.application?.previousValue?.UID_AOBApplication.value) {
      return;
    }
    const isBusy = this.busyService.beginBusy();
    try {
      this.isSystemRoleEnabled = (await this.systemInfo.get()).PreProps.includes('ESET');
      this.getData(true);
    } finally {
      isBusy.endBusy();
    }
  }

  /**
   * checks, if an Entitlement can be edited
   * @param aobEntitlement the entitlement to check
   * @returns true, if the entitlements Ident_AOBEntitlement or Description property can be edited
   */
  public canEdit(aobEntitlement: PortalEntitlement): boolean {
    return (
      aobEntitlement != null &&
      (aobEntitlement.Ident_AOBEntitlement.GetMetadata().CanEdit() || aobEntitlement.Description.GetMetadata().CanEdit())
    );
  }

  public openInfo(event: Event): void {
    event.stopPropagation();
  }

  /**
   * Opens a sidesheet to assign new entitlements to the application
   * Afterwards entitlements are added to the application as single entitlements or wrapped into a system role
   */
  public async addNewElement(): Promise<void> {
    const candidates = await this.sidesheet
      .open(EntitlementsAddComponent, {
        title: await this.translateService.get('#LDS#Heading Assign Application Entitlements').toPromise(),
        padding: '0px',
        width: 'max(600px, 60%)',
        testId: 'entitlements-sidesheet',
        data: {
          defaultType: this.isSystemRoleEnabled ? EntitlementsType.Eset : EntitlementsType.UnsGroup,
          isSystemRolesEnabled: this.isSystemRoleEnabled,
          uidApplication: this.application.GetEntity().GetKeys()[0],
        },
      })
      .afterClosed()
      .toPromise();

    if (!candidates) {
      this.logger.debug(this, 'candidate dialog canceled');
      return;
    }

    if (candidates.role) {
      await this.buildRoleAndAddItToApplication(candidates.role);
    } else {
      await this.addDirectEntitlements(candidates.selection);
    }
  }

  /**
   * Applys the dynamic assignment rule, that is defined for the application
   */
  public async applyMappingForDynamicAssignments(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.euiBusyService.show()));
    try {
      this.autoAddService.mapEntitlementsToApplication(this.application.UID_AOBApplication.value);
    } finally {
      setTimeout(() => this.euiBusyService.hide(overlayRef));
    }
    this.snackbar.open({ key: '#LDS#The application entitlements are added now. This may take some time.' });
  }

  /**
   * Opens a side sheet to create/edit the dynamic assignement rule that belongs to the application
   */
  public async editConditionForDynamicAssignments(): Promise<void> {
    const sidesheetTitle = this.hasConditionForDynamicAssignment
      ? '#LDS#Heading Edit Automatic Assignment'
      : '#LDS#Heading Create Automatic Assignment';

    const reload = await this.sidesheet
      .open(EntitlementEditAutoAddComponent, {
        title: await this.translateService.get(sidesheetTitle).toPromise(),
        subTitle: this.application.GetEntity().GetDisplay(),
        padding: '0px',
        disableClose: true,
        width: 'max(600px, 60%)',
        testId: 'entitlements-edit-auto-add-sidesheet',
        data: {
          sqlExpression: this.application.extendedDataRead.SqlExpression.Expressions[0],
          application: this.application,
        },
      })
      .afterClosed()
      .toPromise();

    if (!reload) {
      return;
    }

    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.euiBusyService.show()));
    try {
      this.reloadRequested.emit();
    } finally {
      setTimeout(() => this.euiBusyService.hide(overlayRef));
    }
  }

  /**
   * Call to publish the specified {@link PortalEntitlement|entitlement} or the list of selected {@link PortalEntitlement|entitlements}.
   * @param aobEntitlement the {@link PortalEntitlement|entitlement} to publish
   */
  public async publish(aobEntitlement: PortalEntitlement = null): Promise<void> {
    const shops = await this.shopsProvider.getApplicationInShop(this.application.UID_AOBApplication.value);

    if (shops == null) {
      this.logger.error(this, 'TypedEntityCollectionData<AobApplicationinshop> is undefined');
      return;
    }

    const selectedEntitlements = aobEntitlement != null ? [aobEntitlement] : this.selections;

    const dialogConfig = {
      data: {
        action: LifecycleAction.Publish,
        elements: selectedEntitlements,
        shops: shops.Data,
        type: 'AobEntitlement',
      },
      height: this.platform.TRIDENT ? '550px' : 'auto',
    };
    const dialogRef = this.dialog.open(LifecycleActionComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(async (publishData) => {
      if (publishData) {
        const overlay = this.euiBusyService.show();

        try {
          this.logger.debug(
            this,
            `Publishing entitlement(s)/role(s) ${publishData.date && publishData.publishFuture ? `on ${publishData.date}` : 'now'}`
          );

          const publishCount = await this.entitlementsProvider.publish(selectedEntitlements, publishData);

          this.matDialog.closeAll();

          if (publishCount > 0) {
            this.logger.debug(this, 'Deselect published entitlement(s)/role(s)');
            this.clearSelections();
            let publishMessage: TextContainer = {
              key: 'Application entitlements published',
            };
            if (publishData.publishFuture && publishData.date) {
              const browserCulture = this.translateService.currentLang;
              publishMessage = {
                key: '#LDS#The application entitlement will be published on {0} at {1} (your local time) if the application is published.',
                parameters: [publishData.date.toLocaleDateString(browserCulture), publishData.date.toLocaleTimeString(browserCulture)],
              };
            }
            this.snackbar.open(publishMessage, '#LDS#Close');
            await this.getData();
          }

          if (publishCount < selectedEntitlements.length) {
            this.logger.error(this, 'Attempt to publish entitlement(s)/role(s) failed');
          }
        } finally {
          this.euiBusyService.hide(overlay);
        }
      } else {
        this.logger.debug(this, 'dialog Cancel');
      }
    });
  }

  /**
   * Call to unpublish the specified {@link PortalEntitlement|entitlement} or the list of selected {@link PortalEntitlement|entitlements}.
   * @param aobEntitlement the {@link PortalEntitlement|entitlement} to unpublish
   */
  public async unpublish(aobEntitlement: PortalEntitlement = null): Promise<void> {
    const selectedEntitlements = aobEntitlement != null ? [aobEntitlement] : this.selections;
    const dialogConfig = {
      data: { action: LifecycleAction.Unpublish, elements: selectedEntitlements, type: 'AobEntitlement' },
      width: '800px',
      height: '500px',
    };
    const dialogRef = this.dialog.open(LifecycleActionComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        const overlay = this.euiBusyService.show();
        try {
          this.logger.debug(this, 'Unpublish entitlement(s)/role(s)...');

          const unpublishCount = await this.entitlementsProvider.unpublish(selectedEntitlements);

          this.matDialog.closeAll();

          if (unpublishCount > 0) {
            this.logger.debug(this, 'Deselect unpublished entitlement(s)/role(s)');
            this.clearSelections();
            this.snackbar.open({ key: '#LDS#Application entitlements unpublished' }, '#LDS#Close');
            await this.getData();
          }

          if (unpublishCount < selectedEntitlements.length) {
            this.logger.error(this, 'Attempt to unpublish entitlement(s)/role(s) failed');
          }
        } finally {
          this.euiBusyService.hide(overlay);
        }
      } else {
        this.logger.debug(this, 'dialog Cancel');
      }
    });
  }

  /**
   * Call to unassign the specified {@link PortalEntitlement|entitlement} or the list of selected {@link PortalEntitlement|entitlements}
   * from the associated {@link PortalApplication|application}.
   * @param aobEntitlement the {@link PortalEntitlement|entitlement} to unassign
   */
  public async unassign(aobEntitlement: PortalEntitlement = null): Promise<void> {
    const selectedEntitlements = aobEntitlement != null ? [aobEntitlement] : this.selections;
    const dialogConfig = {
      data: { action: LifecycleAction.Unassign, elements: selectedEntitlements, type: 'AobEntitlement' },
      width: '800px',
      height: '500px',
    };
    const dialogRef = this.dialog.open(LifecycleActionComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.logger.debug(this, 'Remove entitlement(s) from application');
        if (selectedEntitlements.length > 0) {
          let overlayRef: OverlayRef;
          setTimeout(() => (overlayRef = this.euiBusyService.show()));
          try {
            const unassignResult = await this.entitlementsProvider.unassign(selectedEntitlements);
            if (unassignResult) {
              this.clearSelections();
              await this.getData();
              this.snackbar.open({ key: '#LDS#Application entitlements unassigned' }, '#LDS#Close');
            } else {
              this.logger.error(this, 'Attempt to unassign entitlement(s)/role(s) failed');
            }
          } finally {
            setTimeout(() => this.euiBusyService.hide(overlayRef));
          }
        }
        this.matDialog.closeAll();
      } else {
        this.logger.debug(this, 'dialog Cancel');
      }
    });
  }

  /**
   * Call to get data from server depending on the {@link CollectionLoadParameters}.
   * @param resetNavigationState Indicates wether the navigation state should be reset or not.
   * @param newState Optional argument for loading new date for the given {@link CollectionLoadParameters}.
   */
  public async getData(resetNavigationState: boolean = false, newState?: CollectionLoadParameters): Promise<void> {
    if (resetNavigationState) {
      this.navigationState = { PageSize: this.settingsService.DefaultPageSize, StartIndex: 0 };
    } else if (newState) {
      this.navigationState = newState;
    }

    await this.navigate();
  }

  /**
   * Opens a side sheet to edit entitlement information
   * @param entitlement the entitlement to edit
   */
  public async editEntitlement(entitlement: PortalEntitlement): Promise<void> {
    const entitlementWrapper = await this.createEntitlementWrapper(entitlement);

    if (entitlementWrapper?.entitlement == null) {
      this.logger.error(this, 'AobEntitlement is undefined');
      return;
    }

    this.sidesheet.open(EntitlementDetailComponent, {
      title: await this.translateService.get('#LDS#Heading Edit Application Entitlement').toPromise(),
      subTitle: entitlementWrapper.entitlement.GetEntity().GetDisplay(),
      padding: '0',
      width: 'max(600px, 60%)',
      disableClose: true,
      data: entitlementWrapper,
      testId: 'application-entitlement-edit-sidesheet',
    });
  }

  /**
   * Triggered action from the {@link DataTableComponent} or {@link TilesComponent} after the selection have changed.
   */
  public onSelectionChanged(selection: PortalEntitlement[]): void {
    this.selections = selection;

    this.unassignedDisabled = true;
    this.publishDisabled = true;
    this.unpublishDisabled = true;

    if (this.selections == null || this.selections.length === 0) {
      return;
    }

    this.unassignedDisabled = selection.some(elem => elem.IsDynamic.value === true);

    let foundPublished = false;
    let foundUnpublished = false;
    let foundWillBePublished = false;
    let foundReadonly = false;

    this.selections.forEach((item) => {
      if (this.filter.notPublished(item)) {
        foundUnpublished = true;
      }

      if (this.filter.willPublish(item)) {
        foundWillBePublished = true;
      }

      if (this.filter.published(item)) {
        foundPublished = true;
      }

      if (!this.canEdit(item)) {
        foundReadonly = true;
      }
    });

    if ((foundUnpublished || foundWillBePublished) && !foundPublished) {
      this.publishDisabled = foundReadonly;
    }
    if ((foundPublished || foundWillBePublished) && !foundUnpublished) {
      this.unpublishDisabled = foundReadonly;
    }
  }

  /**
   * Triggered action from the {@link DataSourceToolbar|DataSourceToolbar} after the grouping have changed.
   */
  public onGroupingChanged(col: IClientProperty): void {
    this.logger.trace(this, 'grouping changed', col);
  }

  public getType(data: PortalEntitlement): string {
    if (data?.ObjectKeyElement?.value == null) {
      return '';
    }
    const tableName = DbObjectKey.FromXml(data.ObjectKeyElement.value)?.TableName;
    return tableName != null && this.metadata.tables[tableName] ? this.metadata.tables[tableName]?.DisplaySingular : '';
  }

  private async addDirectEntitlements(candidates: TypedEntity[]): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.euiBusyService.show()));
    try {
      const assignedCount = await this.entitlementsProvider.assign(this.application, candidates);
      if (assignedCount > 0) {
        await this.getData();
      }

      if (assignedCount < candidates.length) {
        this.logger.error(this, 'Attempt to assign entitlement(s)/role(s) failed');
      }
    } finally {
      setTimeout(() => this.euiBusyService.hide(overlayRef));
    }
  }

  private async buildRoleAndAddItToApplication(entitlementSystemRoleInput: EntitlementSystemRoleInput): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.euiBusyService.show()));
    let success = true;
    try {
      await this.entitlementsProvider.addElementsToRole(entitlementSystemRoleInput);
    } catch {
      success = false;
    } finally {
      setTimeout(() => this.euiBusyService.hide(overlayRef));
    }
    if (success) {
      this.snackbar.open(
        { key: '#LDS#The application entitlements have been successfully merged into the system role and added to application.' },
        '#LDS#Close'
      );
      await this.getData();
    }
  }

  private clearSelections(): void {
    this.selections = [];
    this.table?.clearSelection();
    this.tiles?.clearSelection();
  }

  private async navigate(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      const data = await this.entitlementsProvider.getEntitlementsForApplication(this.application, this.navigationState);
      await this.updateTableNames(data.Data);
      if (data) {
        this.dstSettings = {
          displayedColumns: this.displayedColumns,
          dataSource: data,
          entitySchema: this.entitySchema,
          navigationState: this.navigationState,
        };
      } else {
        this.logger.error(this, 'TypedEntityCollectionData<PortalEntitlement> is undefined');
      }
    } finally {
      isBusy.endBusy();
    }
  }

  private async updateTableNames(objs: PortalEntitlement[]): Promise<void> {
    const newTableNamesForUpdate = objs
      .map((obj) => DbObjectKey.FromXml(obj.ObjectKeyElement.value).TableName)
      .filter((obj) => !this.updatedTableNames.includes(obj));
    if (newTableNamesForUpdate.length === 0) {
      this.logger.debug(this, 'there are no new table names in this data');
      return;
    }
    this.updatedTableNames.push(...newTableNamesForUpdate);
    this.logger.trace(this, 'following items are added to the list of table names', newTableNamesForUpdate);
    return this.metadata.update([...new Set(newTableNamesForUpdate)]);
  }

  private async createEntitlementWrapper(entitlement: PortalEntitlement): Promise<EntitlementWrapper> {
    let entitlementReloaded: PortalEntitlement;
    let serviceItem: PortalEntitlementServiceitem;

    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.euiBusyService.show()));

    try {
      entitlementReloaded = await this.entitlementsProvider.reload(entitlement);
      if (entitlementReloaded) {
        serviceItem = (await this.serviceItemsProvider.get(entitlement))?.Data?.[0];
      }
    } finally {
      setTimeout(() => this.euiBusyService.hide(overlayRef));
    }

    return {
      entitlement: entitlementReloaded,
      serviceItem,
    };
  }
}
