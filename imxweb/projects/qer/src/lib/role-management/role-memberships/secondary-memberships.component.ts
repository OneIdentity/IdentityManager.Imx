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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit, ViewChild } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import {
  CollectionLoadParameters,
  DisplayColumns,
  EntitySchema,
  IClientProperty,
  TypedEntity,
  XOrigin,
} from 'imx-qbm-dbts';

import { ConfirmationService, DataSourceItemStatus, DataSourceToolbarSettings, DataTableComponent, SnackBarService } from 'qbm';
import { SourceDetectiveSidesheetData } from '../../sourcedetective/sourcedetective-sidesheet.component';
import { SourceDetectiveSidesheetComponent } from '../../sourcedetective/sourcedetective-sidesheet.component';
import { SourceDetectiveType } from '../../sourcedetective/sourcedetective-type.enum';
import { DataManagementService } from '../data-management.service';
import { MembershipsChooseIdentitiesComponent } from '../memberships-choose-identities/memberships-choose-identities.component';
import { RoleService } from '../role.service';
import { RemoveMembershipComponent } from './remove-membership.component';

@Component({
  selector: 'imx-secondary-memberships',
  templateUrl: './secondary-memberships.component.html',
  styleUrls: ['./secondary-memberships.component.scss', '../sidesheet.scss', './role-sidesheet-tabs.scss'],
})
export class SecondaryMembershipsComponent implements OnInit {
  public dstSettings: DataSourceToolbarSettings;
  public navigationState: CollectionLoadParameters = {};
  public entitySchema: EntitySchema;
  public DisplayColumns = DisplayColumns;
  public displayColumns: IClientProperty[];
  public selectableStatus: DataSourceItemStatus = {
    enabled: (item: TypedEntity) => true,
  };

  @ViewChild('dataTable') public dataTable: DataTableComponent<TypedEntity>;

  private selectedEntities: TypedEntity[] = [];

  constructor(
    private readonly sidesheet: EuiSidesheetService,
    private readonly roleService: RoleService,
    private dataManagementService: DataManagementService,
    private readonly busyService: EuiLoadingService,
    private readonly translate: TranslateService,
    private readonly confirmation: ConfirmationService,
    private readonly snackbar: SnackBarService
    ) {
    this.navigationState = {};
  }

  public canDeleteAllSelected(): boolean {
    return this.selectedEntities.length > 0;
  }

  public async ngOnInit(): Promise<void> {
    this.entitySchema = this.roleService.getMembershipEntitySchema('get');
    this.displayColumns = [
      this.entitySchema.Columns.UID_Person,
      this.entitySchema.Columns.XDateInserted,
      this.entitySchema.Columns.OrderState,
      this.entitySchema.Columns.XOrigin,
      this.entitySchema.Columns.ValidUntil,
    ];

    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));

    await this.navigate();
  }

  public async onSearch(keywords: string): Promise<void> {
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.navigate();
  }

  public async onNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }
    await this.navigate();
  }

  public async onDeleteMemberships(): Promise<void> {
    const deletableMemberships = this.selectedEntities.filter((item) => {
      // is it a direct assignment?
      return (
        (XOrigin.Direct & item.GetEntity().GetColumn('XOrigin').GetValue()) === XOrigin.Direct ||
        (XOrigin.Dynamic & item.GetEntity().GetColumn('XOrigin').GetValue()) === XOrigin.Dynamic ||
        item.GetEntity().GetColumn('IsRequestCancellable').GetValue()
      );
    });

    const nonDeletableMemberships = this.selectedEntities.filter(item => deletableMemberships.indexOf(item) < 0);
    const countDynamic = this.getCount(deletableMemberships, XOrigin.Dynamic);
    const countRequested = deletableMemberships.filter((e) => {
      return e.GetEntity().GetColumn('IsRequestCancellable').GetValue();
    }).length;
    const countDirect = this.getCount(deletableMemberships, XOrigin.Direct);

    if (nonDeletableMemberships.length > 0 || countDynamic > 0 || countRequested > 0) {
      const result = await this.sidesheet.open(RemoveMembershipComponent, {
        title: await this.translate.get('#LDS#Heading Remove Memberships').toPromise(),
        width: '650px',
        headerColour: 'warn',
        padding: '0px',
        disableClose: false,
        testId: 'role-membership-remove',
        data: {
          nonDeletableMemberships,
          selectedEntities: deletableMemberships,
          countDirect,
          countDynamic,
          countRequested,
        },
      }).afterClosed().toPromise();

      if (result) {
        this.dataTable.clearSelection();
        this.navigate();
      };
    } else {
      if (await this.confirmation.confirmDelete('#LDS#Heading Remove Memberships','#LDS#Are you sure you want to remove the selected memberships?')) {
        const directs = deletableMemberships.filter((elem) => this.hasBit(elem, XOrigin.Direct));
        this.busyService.show();
        try {
          const id = this.dataManagementService.entityInteractive.GetEntity().GetKeys().join(',');
          for (const membership of directs) {
            await this.roleService.removeMembership(membership, id);
          }
        } finally {
          this.busyService.hide();
          this.snackbar.open({ key: '#LDS#The memberships have been successfully removed.' });
          this.dataTable.clearSelection();
          this.navigate();
        }
      }
    }
  }

  public async onSelectIdentities(): Promise<void> {
    this.sidesheet.open(MembershipsChooseIdentitiesComponent, {
      title: await this.translate.get('#LDS#Heading Select Identities').toPromise(),
      headerColour: 'blue',
      padding: '0px',
      width: '800px',
      disableClose: false,
      testId: 'role-select-identities',
    });
  }

  public async onSelectionChanged(items: TypedEntity[]): Promise<any> {
    this.selectedEntities = items;
  }

  public getValidUntil(item: TypedEntity): string {
    const validUntil = new Date(item.GetEntity().GetColumn('ValidUntil').GetValue());
    return validUntil.toLocaleDateString();
  }

  public async onShowDetails(): Promise<void> {
    const uidPerson = this.roleService.getUidPerson( this.selectedEntities[0]);
    const uidRole = this.roleService.getUidRole(this.selectedEntities[0]);

    const data: SourceDetectiveSidesheetData = {
      UID_Person: uidPerson,
      Type: SourceDetectiveType.MembershipOfRole,
      UID: uidRole,
      TableName: this.roleService.ownershipInfo.TableName,
    };
    this.sidesheet.open(SourceDetectiveSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading View Assignment Analysis').toPromise(),
      headerColour: 'orange',
      padding: '0px',
      width: '800px',
      disableClose: false,
      testId: 'role-membership-details',
      data,
    });
  }

  public isNotEffective(item: TypedEntity): boolean {
    if (!this.entitySchema.Columns.XIsInEffect) {
      return false;
    }
    return !item.GetEntity().GetColumn('XIsInEffect').GetValue();
  }

  private async navigate(): Promise<void> {
    this.busyService.show();

    try {
      this.dstSettings = {
        dataSource: await this.roleService.getMemberships({
          id: this.dataManagementService.entityInteractive.GetEntity().GetKeys().join(','),
          navigationState: this.navigationState
        }),
        entitySchema: this.entitySchema,
        navigationState: this.navigationState,
        displayedColumns: this.displayColumns,
      };
    } finally {
      this.busyService.hide();
    }
  }

  private getCount(selectedEntities: TypedEntity[], xorigin: XOrigin): number {
    return selectedEntities.filter((e) => {
      return this.hasBit(e, xorigin);
    }).length;
  }

  private hasBit(e: TypedEntity, xorigin: XOrigin): boolean {
    return (e.GetEntity().GetColumn('XOrigin').GetValue() & xorigin) > 0;
  }

}
