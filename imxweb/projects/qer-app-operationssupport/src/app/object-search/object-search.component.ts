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
 * Copyright 2024 One Identity LLC.
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

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DbObjectInfo, imx_QBM_SearchService, MetadataService } from 'qbm';

@Component({
  selector: 'imx-object-search',
  templateUrl: './object-search.component.html',
  styleUrls: ['./object-search.component.scss'],
})
export class ObjectSearchComponent {
  public get SearchService(): imx_QBM_SearchService {
    return this.objectSearchService;
  }
  public get MetadataService(): MetadataService {
    return this.metadataService;
  }
  public currentMetadataItem: any;

  constructor(
    private objectSearchService: imx_QBM_SearchService,
    private router: Router,
    private metadataService: MetadataService,
  ) {}

  public itemSelected(event: any): void {
    const dataItem = event as DbObjectInfo;
    if (dataItem.Key?.TableName && dataItem.Key?.Keys?.[0]) {
      this.router.navigate([`/object/${dataItem.Key.TableName}/${dataItem.Key.Keys[0]}`]);
    } else {
      throw Error('DataItem has missing properties - cannot navigate.');
    }
  }

  public async setCurrentItem(dataItem: DbObjectInfo): Promise<void> {
    if (dataItem.Key?.TableName) {
      this.currentMetadataItem = await this.MetadataService.GetTableMetadata(dataItem.Key.TableName);
    }
  }
}
