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
 * Copyright 2025 One Identity LLC.
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

import { Component, Input, OnInit } from '@angular/core';
import { DisplayColumns, EntitySchema, IClientProperty } from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import { DataViewSource, LocalDataViewInitParameters } from 'qbm';
import { DugAccessDetailEntity, PortalDgeResourcesbyid, ResourceAccessExpansionPerson } from '../TypedClient';
import { DugAccessAnalysisService } from './dug-access-analysis.service';

@Component({
  templateUrl: './dug-access-analysis.component.html',
  styleUrls: ['./dug-access-analysis.component.scss'],
  selector: 'imx-dge-access-analysis',
  standalone: false,
  providers: [DataViewSource],
})
export class DugAccessAnalysisComponent implements OnInit {
  @Input() public dug: PortalDgeResourcesbyid;
  public displayResource: string;
  public dugBackingFolder: PortalDgeResourcesbyid;
  public identities: ResourceAccessExpansionPerson[];
  public ldsAccess = '#LDS#The following identities have access to the selected resource.';
  public entitySchema: EntitySchema;
  private displayColumns: IClientProperty[] = [];
  public DisplayColumns = DisplayColumns;

  constructor(
    private readonly dugAccessAnalysisService: DugAccessAnalysisService,
    private readonly translate: TranslateService,
    public dataSource: DataViewSource<DugAccessDetailEntity>,
  ) {
    this.entitySchema = DugAccessDetailEntity.GetEntitySchema('Access Detail', '#LDS#Access Detail', this.translate);
  }

  public async ngOnInit(): Promise<void> {
    this.displayResource = this.dug.UID_QAMResourceType.Column.GetDisplayValue();

    if (this.dug.UID_QAMResourceType.value == 'QAM-52F4B02EFBCAEB7A2EE35B8A4636FAEA') {
      // load backing folder for windows computer share

      const uidBackingFolder = this.dug.UID_BackingFolder.value;
      if (uidBackingFolder) {
        this.dugBackingFolder = await this.dugAccessAnalysisService.getBackingFolder(uidBackingFolder);
      }
    }

    this.identities = await this.dugAccessAnalysisService.getIdentities(this.dug.UID_QAMDuG.value);
    this.displayColumns = [
      this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchema.Columns['Department'],
      this.entitySchema.Columns['Location'],
      this.entitySchema.Columns['Role'],
      this.entitySchema.Columns['Manager'],
    ];
    this.init();
  }

  public init() {
    const data = DugAccessDetailEntity.buildEntities(
      DugAccessDetailEntity.buildEntityData(this.identities),
      this.entitySchema,
    );
    const dataViewInitParameters: LocalDataViewInitParameters<DugAccessDetailEntity> = {
      data: data.Data,
      columnsToDisplay: this.displayColumns,
      schema: this.entitySchema,
    };
    this.dataSource.initLocal(dataViewInitParameters);
  }
}
