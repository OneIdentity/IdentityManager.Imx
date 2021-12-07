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

import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { EuiLoadingService, EuiSidesheetConfig, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { OwnershipInformation } from 'imx-api-qer';
import { CollectionLoadParameters, DisplayColumns, EntitySchema, IClientProperty, IEntity, TypedEntity, XOrigin } from 'imx-qbm-dbts';
import { DataSourceItemStatus, DataSourceToolbarSettings, DataTableComponent } from 'qbm';
import { SourceDetectiveSidesheetData } from '../../sourcedetective/sourcedetective-sidesheet.component';
import { SourceDetectiveSidesheetComponent } from '../../sourcedetective/sourcedetective-sidesheet.component';
import { SourceDetectiveType } from '../../sourcedetective/sourcedetective-type.enum';
import { MembershipsChooseIdentitiesComponent } from '../memberships-choose-identities/memberships-choose-identities.component';
import { RoleService } from '../role.service';
import { RemoveMembershipComponent } from './remove-membership.component';

@Component({
  selector: 'imx-secondary-memberships',
  templateUrl: './secondary-memberships.component.html',
  styleUrls: ['./secondary-memberships.component.scss', '../sidesheet.scss'],
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

  public canDeleteAllSelected(): boolean {
    if (this.selectedEntities.length < 1)
      return false;

    return this.selectedEntities.filter(item => {
      // is it a direct assignment?
      return ((XOrigin.Direct & item.GetEntity().GetColumn('XOrigin').GetValue()) == XOrigin.Direct)
        || item.GetEntity().GetColumn('IsRequestCancellable').GetValue();
    }).length == this.selectedEntities.length;
  }

  @Input() public entity: IEntity;
  @Input() public ownershipInfo: OwnershipInformation;

  @ViewChild('dataTable') public dataTable: DataTableComponent<TypedEntity>;

  private selectedEntities: TypedEntity[] = [];

  constructor(
    private readonly sidesheet: EuiSidesheetService,
    private readonly membershipService: RoleService,
    private readonly busyService: EuiLoadingService,
    private readonly translate: TranslateService,
  ) {
    this.navigationState = {};
  }

  public async ngOnInit(): Promise<void> {
    this.entitySchema = this.membershipService.getMembershipEntitySchema(this.ownershipInfo, 'get');
    this.displayColumns = [
      this.entitySchema.Columns.UID_Person,
      this.entitySchema.Columns.XDateInserted,
      this.entitySchema.Columns.OrderState,
      this.entitySchema.Columns.XOrigin,
      this.entitySchema.Columns.ValidUntil,
    ];

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

    var config: EuiSidesheetConfig = {
      title: await this.translate.get('#LDS#Heading Remove Memberships').toPromise(),
      width: '650px',
      headerColour: 'red',
      padding: '0px',
      disableClose: false,
      testId: 'role-membership-remove',
      data: {
        ownershipInfo: this.ownershipInfo,
        selectedEntities: this.selectedEntities,
        entity: this.entity
      }
    };
    const sidesheetRef = this.sidesheet.open(RemoveMembershipComponent, config);
    sidesheetRef.afterClosed().subscribe((data) => {
      if (data) {
        this.dataTable.clearSelection();
        this.navigate();
      }
    });

  }

  public async onSelectIdentities(): Promise<void> {
    this.sidesheet.open(MembershipsChooseIdentitiesComponent, {
      title: await this.translate.get("#LDS#Heading Select Identities").toPromise(),
      headerColour: 'blue',
      padding: '0px',
      width: '800px',
      disableClose: false,
      testId: 'role-select-identities',
      data: {
        id: this.entity.GetKeys()[0],
        entity: this.entity,
        ownershipInfo: this.ownershipInfo,
      },
    });
  }

  public async onSelectionChanged(items: TypedEntity[]): Promise<any> {
    this.selectedEntities = items;
  }

  public getValidUntil(item: TypedEntity): string {
    const validUntil = new Date(item.GetEntity().GetColumn('ValidUntil').GetValue());
    return validUntil.toLocaleDateString();
  }

  private async navigate(): Promise<void> {
    this.busyService.show();
    try {
      this.dstSettings = {
        dataSource: await this.membershipService.getMemberships(this.ownershipInfo, this.entity.GetKeys()[0], this.navigationState),
        entitySchema: this.entitySchema,
        navigationState: this.navigationState,
        displayedColumns: this.displayColumns,
      };
    } finally {
      this.busyService.hide();
    }
  }

  public async onShowDetails() {

    const uidPerson = this.membershipService.GetUidPerson(this.ownershipInfo, this.selectedEntities[0]);

    const data: SourceDetectiveSidesheetData = {
      UID_Person: uidPerson,
      Type: SourceDetectiveType.MembershipOfRole,
      UID: this.entity.GetKeys()[0],
      TableName: this.entity.TypeName
    };
    this.sidesheet.open(SourceDetectiveSidesheetComponent, {
      title: await this.translate.get("#LDS#Heading View Assignment Analysis").toPromise(),
      headerColour: 'orange',
      padding: '0px',
      width: '800px',
      disableClose: false,
      testId: 'role-membership-details',
      data: data,
    });
  }

  public isNotEffective(item: TypedEntity): boolean {
    if (!this.entitySchema.Columns["XIsInEffect"])
      return false;

    return !item.GetEntity().GetColumn('XIsInEffect').GetValue();
  }
}
