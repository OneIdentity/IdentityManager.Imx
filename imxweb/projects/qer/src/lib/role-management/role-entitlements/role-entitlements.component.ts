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

import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalRolesEntitlements, RoleAssignmentData } from 'imx-api-qer';
import { CollectionLoadParameters, DbObjectKey, DisplayColumns, EntitySchema, IClientProperty, TypedEntity, XOrigin } from 'imx-qbm-dbts';

import { ConfirmationService, DataSourceToolbarSettings, DataTableComponent, imx_SessionService, MetadataService } from 'qbm';
import { QerApiService } from '../../qer-api-client.service';
import { DataManagementService } from '../data-management.service';
import { RoleService } from '../role.service';
import { EntitlementSelectorComponent, SelectedEntitlement } from './entitlement-selector.component';

@Component({
  selector: 'imx-role-entitlements',
  templateUrl: './role-entitlements.component.html',
  styleUrls: ['./role-entitlements.component.scss', '../sidesheet.scss']
})
export class RoleEntitlementsComponent implements OnInit, AfterViewInit {

  get isMobile(): boolean {
    return document.body.offsetWidth <= 768;
  }
  public dstSettings: DataSourceToolbarSettings;
  public navigationState: CollectionLoadParameters = {};
  public entitySchema: EntitySchema;
  public DisplayColumns = DisplayColumns;
  public displayColumns: IClientProperty[];
  public entitlementTypes: Map<string, string>;

  @ViewChild('dataTable') public dataTable: DataTableComponent<TypedEntity>;

  public readonly itemStatus = {
    enabled: (item: PortalRolesEntitlements): boolean => {
      return (item.GetEntity().GetColumn('XOrigin').GetValue() & XOrigin.Direct) > 0
        || item.GetEntity().GetColumn('IsRequestCancellable').GetValue();
    }
  };
  private selectedEntities: TypedEntity[] = [];

  constructor(
    private readonly busyService: EuiLoadingService,
    private readonly qerApiService: QerApiService,
    private readonly roleService: RoleService,
    private dataManagementService: DataManagementService,
    private readonly confirmationService: ConfirmationService,
    private readonly snackbar: MatSnackBar,
    private readonly sidesheet: EuiSidesheetService,
    private readonly metadata: MetadataService,
    private readonly translate: TranslateService,
    private readonly session: imx_SessionService,
  ) { }

  public ngOnInit(): void {
    this.entitySchema = PortalRolesEntitlements.GetEntitySchema();
  }

  public async ngAfterViewInit(): Promise<void> {

    this.displayColumns = [
      this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchema.Columns.XOrigin,
      this.entitySchema.Columns.XDateInserted
    ];
    await this.navigate();
  }

  public getValidUntil(item: TypedEntity): string {
    const validUntil = new Date(item.GetEntity().GetColumn('ValidUntil').GetValue());
    return validUntil.toLocaleDateString();
  }

  // TODO: Does the table support search?
  public async onSearch(keywords: string): Promise<void> {
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.navigate();
  }

  public async onSelectionChanged(items: TypedEntity[]): Promise<any> {
    this.selectedEntities = items;
  }

  public async onSelectEntitlements(): Promise<void> {
    this.busyService.show();
    const entity = this.dataManagementService.entityInteractive.GetEntity();
    let entitlementTypes: RoleAssignmentData[];
    try {
      entitlementTypes = await this.roleService.getEntitlementTypes(entity);
    } finally {
      this.busyService.hide();
    }
    const selectedValues = await this.sidesheet.open(EntitlementSelectorComponent,
      {
        title: await this.translate.get('#LDS#Heading Request Entitlements').toPromise(),
        headerColour: 'iris-blue',
        bodyColour: 'asher-gray',
        padding: '0px',
        width: 'max(600px, 60%)',
        testId: 'role-entitlements-new-sidesheet',
        data: {
          entitlementTypes: entitlementTypes,
          roleEntity: entity
        }
      }
    ).afterClosed().toPromise();
    if (selectedValues) {
      this.processEntitlementSelections(selectedValues);
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
    return metadata.DisplaySingular;
  }

  public canDeleteAllSelected(): boolean {
    if (this.selectedEntities.length < 1) {
      return false;
    }

    return this.selectedEntities.findIndex(item => ! this.canDelete(item)) < 0;
  }

  public async onDeleteEntitlements(): Promise<void> {
    if (await this.confirmationService.confirm({
      Title: '#LDS#Heading Remove Entitlements',
      Message: '#LDS#Are you sure you want to remove the selected entitlements?'
    })) {
      this.busyService.show();
      try {
        const entity = this.dataManagementService.entityInteractive.GetEntity();
        for (const selectedEntity of this.selectedEntities) {
          if (this.isDirectAssignment(selectedEntity)) {
            await this.roleService.removeEntitlements(entity.GetKeys().join(','), selectedEntity.GetEntity());
          }

          if (this.isRequestCancellable(selectedEntity)) {
            await this.roleService.unsubscribe(selectedEntity);
          }

        }

      } finally {
        this.busyService.hide();
        this.dataTable.clearSelection();
        this.openSnackbar('#LDS#The entitlements have been successfully removed. It may take some time for the changes to take effect.',
          '#LDS#Close');
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

  private async processEntitlementSelections(selectedEntities: SelectedEntitlement[]): Promise<void> {
    const overlay = this.busyService.show();
    try {
      const entity = this.dataManagementService.entityInteractive.GetEntity();
      for (const selectedEntity of selectedEntities) {
        const newCartItem = this.qerApiService.typedClient.PortalCartitem.createEntity();

        // i.e. "<Key><T>Org</T><P>4ee782c2-a518-42d3-8d38-73b0d287b7e6</P></Key>"
        newCartItem.RoleMembership.value = entity.GetColumn('XObjectKey').GetValue();

        // i.e. "OrgHasADSGroup|<Key><T>ADSGroup</T><P>468fa7aa-26d8-4c81-8944-a00146014ece</P></Key>"
        newCartItem.EntitlementData.value = selectedEntity.assignmentType.AssignTable + '|' + selectedEntity.entity.GetColumn('XObjectKey').GetValue();

        newCartItem.UID_PersonOrdered.value = this.session.SessionState.UserUid;
        await newCartItem.GetEntity().Commit(false);
      }

    } finally {
      this.busyService.hide(overlay);
    }

    this.openSnackbar('#LDS#The entitlement assignments have been successfully added to your shopping cart.', '#LDS#Close');
  }

  private openSnackbar(message: string, action: string): void {
    this.translate.get([message, action]).subscribe((translations: any[]) => {
      this.snackbar.open(translations[message], translations[action], { duration: 10000 });
    });
  }

  private async navigate(): Promise<void> {
    this.busyService.show();
    try {
      const entity = this.dataManagementService.entityInteractive.GetEntity();
      const ds = await this.roleService.getEntitlements({
        id: entity.GetKeys().join(','),
        navigationState: this.navigationState
      });
      this.entitlementTypes = new Map();

      ds.Data.forEach(async item => {
        this.entitlementTypes.set(item.GetEntity().GetKeys().toString(), await this.getTypeDescription(item));
      });

      this.dstSettings = {
        dataSource: ds,
        entitySchema: this.entitySchema,
        navigationState: this.navigationState,
        displayedColumns: this.displayColumns,
      };

    } finally {
      this.busyService.hide();
    }
  }

  private canDelete(entity: TypedEntity): boolean {
    return this.isDirectAssignment(entity) || this.isDynamicAssignment(entity) || this.isRequestCancellable(entity);
  }

  private isDirectAssignment(entity: TypedEntity): boolean {
    const xorigin = entity.GetEntity().GetColumn('XOrigin').GetValue() as XOrigin;
    // tslint:disable-next-line:no-bitwise
    return xorigin && (XOrigin.Direct === (XOrigin.Direct & xorigin));
  }

  private isDynamicAssignment(entity: TypedEntity): boolean {
    const xorigin = entity.GetEntity().GetColumn('XOrigin').GetValue() as XOrigin;
    // tslint:disable-next-line:no-bitwise
    return xorigin && (XOrigin.Dynamic === (XOrigin.Dynamic & xorigin));
  }

  private isRequestCancellable(entity: TypedEntity): boolean {
    return true === entity.GetEntity().GetColumn('IsRequestCancellable')?.GetValue();
  }

}
