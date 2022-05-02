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

import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { QerApiService } from '../../qer-api-client.service';
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { BaseCdr, ColumnDependentReference, EntityService, MetadataService } from 'qbm';
import { AbstractControl, FormGroup } from '@angular/forms';
import { RoleCompareItems } from 'imx-api-qer';
import { DbObjectKey, FkCandidateBuilder, FkCandidateRouteDto, ValType } from 'imx-qbm-dbts';
import { RoleService } from '../role.service';

@Component({
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss'],
})
export class CompareComponent implements OnInit {
  public compareItems: RoleCompareItems;

  public cdrList: ColumnDependentReference[] = [];
  public busy = false;

  public displayedColumns = ['Object', 'Role1', 'Role2'];

  constructor(
    private readonly apiService: QerApiService,
    private readonly entityService: EntityService,
    private readonly metadata: MetadataService,
    private readonly roleService: RoleService,
    @Inject(EUI_SIDESHEET_DATA)
    private readonly sidesheetData: {
      isAdmin: boolean;
      roleType: string;
      uidRole: string;
    },
    private readonly cdref: ChangeDetectorRef
  ) {}

  public roleCdr: ColumnDependentReference;

  public async ngOnInit(): Promise<void> {
    const candidates = await this.roleService.getComparisonConfig();
    this.roleCdr = this.createCdrRole(candidates);
  }

  public getTableDisplay(tableName: string) {
    return this.metadata.tables[tableName].DisplaySingular;
  }

  public async loadCompareItems(): Promise<void> {
    this.busy = true;
    try {
      const keyXml = this.roleCdr.column.GetValue();
      if (!keyXml) {
        this.compareItems = null;
        return;
      }
      const key = DbObjectKey.FromXml(keyXml);
      const items = await this.apiService.v2Client.portal_roles_compare_get(
        this.sidesheetData.roleType,
        this.sidesheetData.uidRole,
        key.TableName,
        key.Keys[0]
      );

      this.compareItems = items;
    } finally {
      this.busy = false;
    }
  }

  public addControl(group: FormGroup, name: string, control: AbstractControl): void {
    group.addControl(name, control);
    this.cdref.detectChanges();
  }

  private createCdrRole(candidateRoutes: FkCandidateRouteDto[]): ColumnDependentReference {
    const fkProviderItems = new FkCandidateBuilder(candidateRoutes, this.apiService.apiClient).build();

    return new BaseCdr(
      this.entityService.createLocalEntityColumn(
        {
          ColumnName: 'uidcomparerole',
          Type: ValType.String,
          ValidReferencedTables: candidateRoutes.map((r) => {
            return { TableName: r.FkParentTableName };
          }),
          MinLen: 1,
        },
        fkProviderItems
      ),
      '#LDS#Select comparison object'
    );
  }
}
