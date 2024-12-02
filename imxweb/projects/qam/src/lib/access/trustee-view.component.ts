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

import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { BusyService } from 'qbm';
import { TrusteeAccessData, TrusteeData } from '../TypedClient';
import { QamApiService } from '../qam-api-client.service';

interface TrusteePermissionData {
  path: string;
  allowRead: boolean;
  allowWrite: boolean;
  anyAllow: boolean;
  allowFullControl: boolean;
  allowChangePermissions: boolean;
}

/** Component to display a TrusteeAccessData structure. */
@Component({
  templateUrl: './trustee-view.component.html',
  styleUrls: ['../qam.scss', './trustee-view.component.scss'],
  selector: 'imx-trustee-view',
})
export class TrusteeViewComponent implements OnInit, OnChanges {
  public currentSelectedTrustee: TrusteeData | undefined;
  public currentSelectedTrusteePermissions: TrusteePermissionData[] = [];
  public treeControl = new NestedTreeControl<TrusteeData>((node) => node.Children);
  public dataSource = new MatTreeNestedDataSource<TrusteeData>();
  @Input() public data: TrusteeAccessData | undefined;
  @Input() public busyService: BusyService | undefined;

  public trusteeTypes: { [id: number]: string };

  constructor(private readonly api: QamApiService) {}

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService?.beginBusy();
    try {
      this.trusteeTypes = await this.api.getTrusteeTypes();
    } finally {
      isBusy?.endBusy();
    }

    this.dataSource.data = this.data?.Trustees ?? [];
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.data) {
      this.dataSource.data = this.data?.Trustees ?? [];
    }
  }

  public hasChild = (_: number, node: TrusteeData) => !!node.Children && node.Children.length > 0;

  public isSelected = (node: TrusteeData) => {
    return node.UidQamTrustee === this.currentSelectedTrustee?.UidQamTrustee;
  };

  public updateView(data: TrusteeData) {
    this.currentSelectedTrustee = data;
    this.currentSelectedTrusteePermissions =
      data.Paths?.map((elem) => ({
        path: elem.Path ?? '',
        allowRead: elem.Permissions?.includes('AllowRead') ?? false,
        allowWrite: elem.Permissions?.includes('AllowWrite') ?? false,
        allowChangePermissions: elem.Permissions?.includes('AllowChangePermissions') ?? false,
        allowFullControl: elem.Permissions?.includes('AllowFullControl') ?? false,
        anyAllow: elem.Permissions?.includes('AnyAllow') ?? false,
      })) ?? [];
    console.log('martina', this.currentSelectedTrustee, this.currentSelectedTrusteePermissions);
  }
}
