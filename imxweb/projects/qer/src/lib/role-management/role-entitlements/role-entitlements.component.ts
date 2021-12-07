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
 * Copyright 2021 One Identity LLC.
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

import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EuiLoadingService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { PortalRolesEntitlements } from 'imx-api-qer';
import { OwnershipInformation } from 'imx-api-qer';
import { CollectionLoadParameters, DbObjectKey, DisplayColumns, EntitySchema, IClientProperty, IEntity, TypedEntity, XOrigin } from 'imx-qbm-dbts';
import { ConfirmationService, DataSourceToolbarSettings, DataTableComponent, imx_SessionService, MetadataService } from 'qbm';
import { QerApiService } from '../../qer-api-client.service';
import { RoleService } from '../role.service';
import { EntitlementSelectorComponent, SelectedEntitlements } from './entitlement-selector.component';

@Component({
  selector: 'imx-role-entitlements',
  templateUrl: './role-entitlements.component.html',
  styleUrls: ['./role-entitlements.component.scss', '../sidesheet.scss']
})
export class RoleEntitlementsComponent implements OnInit, AfterViewInit {
  public dstSettings: DataSourceToolbarSettings;
  public navigationState: CollectionLoadParameters = {};
  public entitySchema: EntitySchema;
  public DisplayColumns = DisplayColumns;
  public displayColumns: IClientProperty[];
  public entitlementTypes: Map<string, string>;

  @Input() public entity: IEntity;
  @Input() public ownershipInfo: OwnershipInformation;
  @ViewChild('dataTable') public dataTable: DataTableComponent<TypedEntity>;
  private selectedEntities: TypedEntity[] = [];

  constructor(private readonly busyService: EuiLoadingService,
    private readonly qerApiService: QerApiService,
    private readonly entitlementService: RoleService,
    private readonly confirm: ConfirmationService,
    private readonly snackbar: MatSnackBar,
    private readonly matDialog: MatDialog,
    private readonly metadata: MetadataService,
    private readonly translate: TranslateService,
    private readonly session: imx_SessionService,
  ) { }
  ngOnInit(): void {
    this.entitySchema = PortalRolesEntitlements.GetEntitySchema();
  }

  public readonly itemStatus = {
    enabled: (item: PortalRolesEntitlements): boolean => {
      return (item.GetEntity().GetColumn('XOrigin').GetValue() & XOrigin.Direct) > 0
        || item.GetEntity().GetColumn('IsRequestCancellable').GetValue();
    }
  };

  public async ngAfterViewInit(): Promise<void> {

    this.displayColumns = [
      this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchema.Columns.XOrigin,
      this.entitySchema.Columns.XDateInserted
    ];
    await this.navigate();
  }

  get isMobile(): boolean {
    return document.body.offsetWidth <= 768;
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
    const entlTypes = await this.entitlementService.getEntitlementTypes(this.ownershipInfo, this.entity);
    const dialogRef = this.matDialog.open(EntitlementSelectorComponent, {
      width: this.isMobile ? '90vw' : '60vw',
      maxWidth: this.isMobile ? '90vw' : '80vw',
      minHeight: '60vh',
      data: {
        entitlementTypes: entlTypes,
        roleEntity: this.entity
      }
    });
    dialogRef.afterClosed().subscribe((selectedValues: SelectedEntitlements) => {
      if (selectedValues) {
        this.processEntitlementSelections(selectedValues);
      }
    });

  }

  private async processEntitlementSelections(values: SelectedEntitlements): Promise<void> {
    const overlay = this.busyService.show();
    try {
      for (const entity of values.entities) {
        const newCartItem = this.qerApiService.typedClient.PortalCartitem.createEntity();

        // i.e. "<Key><T>Org</T><P>4ee782c2-a518-42d3-8d38-73b0d287b7e6</P></Key>"
        newCartItem.RoleMembership.value = this.entity.GetColumn("XObjectKey").GetValue();

        // i.e. "OrgHasADSGroup|<Key><T>ADSGroup</T><P>468fa7aa-26d8-4c81-8944-a00146014ece</P></Key>"
        newCartItem.EntitlementData.value = values.assignmentType.AssignTable + "|" + entity.GetColumn("XObjectKey").GetValue();

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

  public async onNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }
    await this.navigate();
  }

  public async getTypeDescription(item: any): Promise<string> {
    const colName = this.entitlementService.getEntitlementFkName(this.ownershipInfo);
    const objKey = DbObjectKey.FromXml(item.GetEntity().GetColumn(colName).GetValue());
    const metadata = await this.metadata.GetTableMetadata(objKey.TableName);
    return metadata.DisplaySingular;
  }

  private async navigate(): Promise<void> {
    this.busyService.show();
    try {
      const ds = await this.entitlementService.getEntitlements(this.ownershipInfo, this.entity.GetKeys()[0], this.navigationState);
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

  public canDeleteAllSelected(): boolean {
    if (this.selectedEntities.length < 1)
      return false;

      return this.selectedEntities.filter(item => {
        // is it a direct or dynamic assignment?
        const xorigin = item.GetEntity().GetColumn('XOrigin').GetValue();
        ((XOrigin.Direct & xorigin) == XOrigin.Direct)
          || ((XOrigin.Dynamic & xorigin) == XOrigin.Dynamic)
          || item.GetEntity().GetColumn('IsRequestCancellable').GetValue()
      }).length == this.selectedEntities.length;
  }

  public async onDeleteEntitlements(): Promise<void> {
    const result = await this.confirm.confirmLeaveWithUnsavedChanges(
      '#LDS#Heading Remove Entitlements',
      '#LDS#Are you sure you want to remove the selected entitlements?'
    );

    if (result) {
      this.busyService.show();
      try {
        for (const entlasgn of this.selectedEntities) {
          // is it a direct assignment?
          if ((XOrigin.Direct & entlasgn.GetEntity().GetColumn('XOrigin').GetValue()) == XOrigin.Direct) {
            await this.entitlementService.removeEntitlements(this.ownershipInfo, this.entity.GetKeys()[0], entlasgn.GetEntity());
          }

          if (entlasgn.GetEntity().GetColumn('IsRequestCancellable').GetValue()) {
            await this.entitlementService.unsubscribe(entlasgn);
          }

        };

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
    if (!this.entitySchema.Columns['XIsInEffect'])
      return false;

    return !item.GetEntity().GetColumn('XIsInEffect').GetValue();
  }
}
