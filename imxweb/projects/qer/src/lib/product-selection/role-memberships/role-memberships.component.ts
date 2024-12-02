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

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';

import { PortalItshopPeergroupMemberships } from '@imx-modules/imx-api-qer';
import { CollectionLoadParameters, DisplayColumns, TypedEntity, ValType, ValueStruct } from '@imx-modules/imx-qbm-dbts';
import { DataSourceToolbarComponent, DataSourceToolbarSettings, DataSourceWrapper } from 'qbm';
import { ItshopService } from '../../itshop/itshop.service';
import { RecipientsWrapper } from '../recipients-wrapper';

@Component({
  selector: 'imx-role-memberships',
  templateUrl: './role-memberships.component.html',
  styleUrls: ['./role-memberships.component.scss'],
})
export class RoleMembershipsComponent implements OnChanges {
  @Input() public recipients: RecipientsWrapper;
  @Input() public referenceUser: ValueStruct<string>;
  @Input() public personPeerGroupUid: string;
  @Input() public dataSourceView = { selected: 'cardlist' };

  @Output() public selectionChanged = new EventEmitter<PortalItshopPeergroupMemberships[]>();
  @Output() public addItemToCart = new EventEmitter<PortalItshopPeergroupMemberships>();

  public dstSettings: DataSourceToolbarSettings | undefined;
  public isLoading = false;
  public noDataText = '#LDS#No data';

  public readonly dstWrapper: DataSourceWrapper<PortalItshopPeergroupMemberships>;

  public get options(): string[] {
    return this.personPeerGroupUid ?? '' !== '' ? ['search', 'filter', 'settings'] : ['search', 'filter', 'settings', 'selectedViewGroup'];
  }

  @ViewChild(DataSourceToolbarComponent) private readonly dst: DataSourceToolbarComponent;

  constructor(
    private readonly itshop: ItshopService,
    private readonly busy: EuiLoadingService,
  ) {
    const entitySchema = this.itshop.PortalItshopPeergroupMembershipsSchema;

    this.dstWrapper = new DataSourceWrapper(
      (state) =>
        this.itshop.getPeerGroupMemberships({
          ...(this.referenceUser
            ? { UID_PersonReference: this.referenceUser.DataValue }
            : { UID_PersonPeerGroup: this.personPeerGroupUid }),
          ...{ UID_Person: this.recipients ? this.recipients.uids.join(',') : undefined },
          ...state,
        }),
      [
        entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
        entitySchema.Columns.FullPath,
        {
          ColumnName: 'addCartButton',
          Type: ValType.String,
          afterAdditionals: true,
          untranslatedDisplay: '#LDS#Add to cart',
        },
      ],
      entitySchema,
      undefined,
      'product-selection-role-membership',
    );
  }

  public async ngOnChanges(change: SimpleChanges): Promise<void> {
    if (change.referenceUser || change.personPeerGroupUid) {
      this.dst?.clearSelection();
      await this.getData();
    }
  }

  public async getData(newState?: CollectionLoadParameters): Promise<void> {
    if (this.busy.overlayRefs.length === 0) {
      this.busy.show();
    }
    this.isLoading = true;

    try {
      this.dstSettings = await this.dstWrapper.getDstSettings(newState);
      this.dstWrapper.extendedData?.PeerGroupSize === 0
        ? (this.noDataText = '#LDS#Peer group is empty')
        : (this.noDataText = '#LDS#No data');
    } finally {
      this.busy.hide();
      this.isLoading = false;
    }
  }

  public async viewSelectionChanged(view: string): Promise<void> {
    this.dataSourceView.selected = view;
  }

  public selectAllOnPage(): void {
    this.dst?.selectAllOnPage();
  }

  public deselectAll(): void {
    this.dst?.clearSelection();
  }

  public onSelectionChanged(entities: TypedEntity[]) {
    this.selectionChanged.emit(entities as PortalItshopPeergroupMemberships[]);
  }

  public onActionSelected(entity: TypedEntity | undefined) {
    this.addItemToCart.emit(entity as PortalItshopPeergroupMemberships);
  }
}
