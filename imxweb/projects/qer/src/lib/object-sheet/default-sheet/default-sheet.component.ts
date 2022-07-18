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

import { Component, OnInit, Input } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiLoadingService } from '@elemental-ui/core';

import { IEntity, DbObjectKey } from 'imx-qbm-dbts';
import { ShapeData, MetaTableData } from 'imx-api-qbm';

import { MetadataService, NavigationService, ShapeClickArgs } from 'qbm';
import { DefaultSheetService } from './default-sheet.service';

/**
 * The default sheet component which shows a hyperview for the specified object.
 */
@Component({
  selector: 'imx-default-sheet',
  templateUrl: './default-sheet.component.html',
  styleUrls: ['./default-sheet.component.scss']
})
export class DefaultSheetComponent implements OnInit {
  public display: string;
  public shapeData: ShapeData[];
  public isMNTable: boolean;
  public objMN: IEntity[];
  public metaTableData: MetaTableData;

  @Input() public isReadOnly: boolean;
  @Input() public objectKey: DbObjectKey;
  @Input() public hideDisplay: boolean;

  constructor(
    private readonly navigationService: NavigationService,
    private readonly busyService: EuiLoadingService,
    private readonly defaultSheetService: DefaultSheetService,
    private readonly metadataService: MetadataService) { }

  public async ngOnInit(): Promise<void> {

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      await this.metadataService.update([this.objectKey.TableName]);
      this.metaTableData = this.metadataService.tables[this.objectKey.TableName];
      this.isMNTable = this.metaTableData && this.metaTableData.IsMNTable;

      const entityData = await this.defaultSheetService.getDbObject(this.objectKey);
      this.display = entityData.Display;

      if (!this.isMNTable) {
        this.shapeData = await this.defaultSheetService.getHyperviewShapeData(this.objectKey);
      }
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }
  public select($event: ShapeClickArgs): void {
    if (!$event.objectKey) {
      return;
    }
    const objectKey = DbObjectKey.FromXml($event.objectKey);
    this.navigationService.navigate(['/objectsheet', objectKey.TableName, objectKey.Keys.join(',')], objectKey);
  }
}
