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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit, Inject } from '@angular/core';
import { EuiLoadingService, EuiSidesheetRef, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { MatSelectChange } from '@angular/material/select';

import {
  DataSourceToolbarSettings,
  ClassloggerService,
  HELPER_ALERT_KEY_PREFIX,
  StorageService,
  MetadataService,
  DataSourceToolbarFilter,
  CdrFactoryService
} from 'qbm';
import { CollectionLoadParameters, IClientProperty, EntitySchema, DisplayColumns, TypedEntity, FilterData } from 'imx-qbm-dbts';
import { EntitlementsService } from '../entitlements.service';
import { AddEntitlementParameter, EntitlementSourceType, EntitlementsType } from '../entitlements.model';
import { EntitlementSystemRoleInput } from 'imx-api-aob';
import { SystemRoleConfigComponent } from './system-role-config/system-role-config.component';

const helperAlertKey = `${HELPER_ALERT_KEY_PREFIX}_addNewEntitlements`;

/**
 * A component that represents a sidesheet for adding application entitlements to an {@link PortalApplication}.
 */
@Component({
  selector: 'imx-entitlements-add',
  templateUrl: './entitlements-add.component.html',
  styleUrls: ['./entitlements-add.component.scss']
})
export class EntitlementsAddComponent implements OnInit {
  public readonly EntitlementsType = EntitlementsType; // Enables use of this Enum in Angular Templates.
  public readonly DisplayColumns = DisplayColumns; // Enables use of this static class in Angular Templates.
  public settings: DataSourceToolbarSettings;
  public entitySchema: EntitySchema;
  public navigationState: CollectionLoadParameters;
  public displayedColumns: IClientProperty[] = [];
  public highlightedEntity: TypedEntity;
  public selectedSourceType: EntitlementsType = EntitlementsType.UnsGroup;
  public isSystemRolesEnabled: boolean;
  public entitlementsLabel: string;
  public rolesLabel: string;
  public selections: TypedEntity[];
  public readonly browserCulture: string;
  public entitlementSourceTypes: EntitlementSourceType[] = [];
  public get showHelperAlert(): boolean { return !this.storageService.isHelperAlertDismissed(helperAlertKey); }

  private filters: DataSourceToolbarFilter[];

  constructor(
    public readonly sidesheetRef: EuiSidesheetRef,
    @Inject(EUI_SIDESHEET_DATA) private data: AddEntitlementParameter,
    private logger: ClassloggerService,
    public readonly entitlementsProvider: EntitlementsService,
    private readonly busyService: EuiLoadingService,
    private readonly storageService: StorageService,
    private readonly metaData: MetadataService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly translateService: TranslateService) {
    this.selectedSourceType = data.defaultType;
    this.isSystemRolesEnabled = data.isSystemRolesEnabled;

    this.browserCulture = translateService.currentLang;
  }

  public async ngOnInit(): Promise<void> {

    await this.metaData.update(['ESet', 'UNSGroup', 'QERResource', 'RPSReport', 'TSBAccountDef']);

    this.entitlementSourceTypes = [
      { entitlementsType: EntitlementsType.UnsGroup, display: this.metaData.tables.UNSGroup.Display },
      { entitlementsType: EntitlementsType.Qerresource, display: this.metaData.tables.QERResource.Display },
      { entitlementsType: EntitlementsType.Rpsreport, display: this.metaData.tables.RPSReport.Display },
      { entitlementsType: EntitlementsType.Tsbaccountdef, display: this.metaData.tables.TSBAccountDef.Display },
    ];

    if (this.isSystemRolesEnabled) {
      this.entitlementSourceTypes.unshift({ entitlementsType: EntitlementsType.Eset, display: this.metaData.tables.ESet.Display });
    }

    await this.useSource(this.selectedSourceType);
  }

  public onHelperDismissed(): void {
    this.storageService.storeHelperAlertDismissal(helperAlertKey);
  }


  /**
   * Call to toggle the view and show entitlements candidates or roles candidates.
   */
  public async toggleView(arg: MatSelectChange): Promise<void> {
    this.selectedSourceType = arg.value;
    this.logger.debug(this, `Switching view to ${this.selectedSourceType}.`);
    await this.useSource(this.selectedSourceType);
  }

  public onOk(): void {
    this.logger.debug(this, 'Close the sidesheet for assigning application entitlements');
    this.logger.trace(this, this.selections);
    this.sidesheetRef.close({ selection: this.selections });
  }

  public async onCreateRole(): Promise<void> {
    const entitlementSystemRoleInput: EntitlementSystemRoleInput
      = await this.sidesheet.open(SystemRoleConfigComponent, {
        // TODO: make LDS Heading
        title: await this.translateService.get('#LDS#Create new system role').toPromise(),
        padding: '0px',
        width: 'max(500px, 50%)',
        testId: 'create-role-sidesheet',
        data: { uid: this.data.uidApplication, createOnly: true }
      }).afterClosed().toPromise();

    if (!entitlementSystemRoleInput) {
      this.logger.debug(this, 'role dialog canceled');
      return;
    }

    entitlementSystemRoleInput.UidApplication = this.data.uidApplication;
    entitlementSystemRoleInput.ObjectKeyEntitlements = [];

    this.sidesheetRef.close({ role: entitlementSystemRoleInput });
  }

  public async onAddToRole(): Promise<void> {
    const entitlementSystemRoleInput: EntitlementSystemRoleInput
      = await this.sidesheet.open(SystemRoleConfigComponent, {
        title: await this.translateService.get('#LDS#Heading Merge Application Entitlements into System Role').toPromise(),
        padding: '0px',
        width: 'max(500px, 50%)',
        testId: 'add-to-existing-role-sidesheet',
        data: { uid: this.data.uidApplication, createOnly: false }
      }).afterClosed().toPromise();

    if (!entitlementSystemRoleInput) {
      this.logger.debug(this, 'role dialog canceled');
      return;
    }

    const keys = this.selections.map((elem: TypedEntity) => CdrFactoryService.tryGetColumn(elem.GetEntity(), 'XObjectKey')?.GetValue())
      .filter((elem: string) => elem != null);

    if (keys.length < this.selections.length) {
      this.logger.error(this, 'Attempt to assign entitlement(s) failed');
    }

    entitlementSystemRoleInput.UidApplication = this.data.uidApplication;
    entitlementSystemRoleInput.ObjectKeyEntitlements = keys;

    this.sidesheetRef.close({ role: entitlementSystemRoleInput });
  }

  public onSelectionChanged(selection: TypedEntity[]): void {
    this.selections = selection;
  }

  public onHighlightedEntityChanged(entity: TypedEntity): void {
    this.highlightedEntity = entity;
  }

  public onNavigationStateChanged(newState: CollectionLoadParameters): void {
    this.navigationState = newState;
    this.updateCandidates();
  }

  public onSearch(keywords: string): void {
    this.logger.debug(this, `Searching for: ${keywords}`);
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    this.updateCandidates();
  }

  public async onFilterByTree(filters: FilterData[]): Promise<void> {
    this.navigationState.filter = filters;
    this.updateCandidates();
  }

  private async useSource(type: EntitlementsType): Promise<void> {
    this.selectedSourceType = type;
    this.entitySchema = this.entitlementsProvider.candidateSchema(type);
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      this.filters = (await this.entitlementsProvider.getDataModel(type))?.Filters;
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }

    this.displayedColumns = this.getDisplayedColumnsForEntitlement(this.entitySchema, type);
    this.navigationState = { StartIndex: 0, PageSize: 25 };
    this.highlightedEntity = null;

    this.updateCandidates();
  }

  private async updateCandidates(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      this.logger.debug(this, 'Get candidates from the server...');
      const data = await this.entitlementsProvider.getCandidates(this.selectedSourceType, this.navigationState);

      this.settings = {
        dataSource: data,
        displayedColumns: this.displayedColumns,
        entitySchema: this.entitySchema,
        navigationState: this.navigationState,
        filters: this.filters,
        filterTree: this.selectedSourceType === EntitlementsType.UnsGroup ?
          {
            filterMethode: async (parentkey) => {
              return this.entitlementsProvider.getEntitlementsFilterTree({
                parentkey,
              });
            },
            multiSelect: false,
          }
          : undefined
      };

      if (data == null) {
        this.logger.error(this, 'TypedEntityCollectionData<TypedEntity> is undefined');
      }
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  private getDisplayedColumnsForEntitlement(
    entitySchema: EntitySchema,
    type: EntitlementsType): IClientProperty[] {
    if (!entitySchema) { return []; }
    switch (type) {
      case EntitlementsType.UnsGroup:
        return [
          entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
          entitySchema.Columns.CanonicalName,
          entitySchema.Columns.UID_UNSRoot
        ];
      default:
        return [entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]];
    }
  }

  public LdsInfoAlert = '#LDS#Here you can assign application entitlements to the application. Once assigned, you can publish these application entitlements so that they can be requested.';
}
