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

import { Component, OnInit } from '@angular/core';

import { DisplayColumns, EntitySchema, IClientProperty } from 'imx-qbm-dbts';
import { DataSourceToolbarSettings, DynamicTabDataProviderDirective, MetadataService } from 'qbm';
import { RoleComplianceViolationsWrapperService } from './role-compliance-violations-wrapper';
import { RoleComplianceViolationsService } from './role-compliance-violations.service';

@Component({
  templateUrl: './role-compliance-violations.component.html',
  styleUrls: ['./role-compliance-violations.component.scss']
})
export class RoleComplianceViolationsComponent implements OnInit {

  public tablename: string;
  public uidRole: string;
  public dstSettings: DataSourceToolbarSettings;
  public readonly DisplayColumns = DisplayColumns;
  public entitySchema: EntitySchema;
  public showHelperAlert = true;
  public keyDescription: string;

  private displayedColumns: IClientProperty[] = [];
  constructor(
    dataProvider: DynamicTabDataProviderDirective,
    private readonly entityService: RoleComplianceViolationsWrapperService,
    private readonly roleComplianceViolationService: RoleComplianceViolationsService,
    private readonly metaDataService: MetadataService
  ) {
    this.tablename = dataProvider.data.tablename;
    this.uidRole = dataProvider.data.entity.GetKeys()[0];
    this.entitySchema = this.entityService.roleComplianceEntitySchema;
    this.displayedColumns = [
      this.entitySchema.Columns.RuleName,
      this.entitySchema.Columns.ObjectDisplay
    ];

    // tslint:disable:max-line-length
    switch ((this.tablename ?? '').toLowerCase()) {
      case 'aerole' :
        this.keyDescription = '#LDS#Here you can get an overview of all entitlements assigned to this application role that may violate a compliance rule.';
        break;
      case 'department' :
        this.keyDescription = '#LDS#Here you can get an overview of all entitlements assigned to this department that may violate a compliance rule.';
        break;
      case 'locality' :
        this.keyDescription = '#LDS#Here you can get an overview of all entitlements assigned to this location that may violate a compliance rule.';
        break;
      case 'profitcenter' :
        this.keyDescription = '#LDS#Here you can get an overview of all entitlements assigned to this cost center that may violate a compliance rule.';
        break;
      case 'eset' :
        this.keyDescription = '#LDS#Here you can get an overview of all entitlements assigned to this system role that may violate a compliance rule.';
        break;
      case 'org' :
        this.keyDescription = '#LDS#Here you can get an overview of all entitlements assigned to this business role that may violate a compliance rule.';
        break;
      default :
        this.keyDescription = '#LDS#Here you can get an overview of all entitlements assigned to this object that may violate a compliance rule.';
        break;
    }
    // tslint:enable:max-line-length
  }

  public async ngOnInit(): Promise<void> {
    await this.metaDataService.update([this.tablename]);
    await this.getData();
  }

  public async getData(): Promise<void> {
    this.roleComplianceViolationService.handleOpenLoader();
    try {
      const data = await this.roleComplianceViolationService.getRoleComplianceViolations(this.tablename, this.uidRole);
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: this.entityService.build(data.Violations),
        entitySchema: this.entityService.roleComplianceEntitySchema,
        navigationState: {}
      };
    } finally {
      this.roleComplianceViolationService.handleCloseLoader();
    }
  }

  public onHelperDismissed(): void {
    this.showHelperAlert = false;
  }
}
