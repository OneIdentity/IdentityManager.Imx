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

import { Component, Inject, OnInit } from '@angular/core';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { RoleRecommendationItem } from 'imx-api-qer';
import { EntitySchema } from 'imx-qbm-dbts';
import { BusyService, ConfirmationService, DataSourceToolbarSettings } from 'qbm';

import { RoleRecommendationResultItem } from './role-recommendation-result-item';
import { RoleRecommendationResultBuilder } from './role-recommendation-result-item-builder';
import { RoleService } from '../../role.service';

@Component({
  selector: 'imx-role-recommendations',
  templateUrl: './role-recommendations.component.html',
  styleUrls: ['./role-recommendations.component.scss'],
})
export class RoleRecommendationsComponent implements OnInit {
  public dstSettings: DataSourceToolbarSettings;
  public entitySchema: EntitySchema;
  public selectedEntities: RoleRecommendationResultItem[] = [];

  public recommendationText: string;
  public recommendationSubtext: string;
  public busyService = new BusyService();

  private recommendationItemBuilder = new RoleRecommendationResultBuilder();
  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public readonly data: {
      tablename: string;
      uidRole: string;
      canEdit: boolean;
      infoText?: string;
      recommendation?: RoleRecommendationItem[];
      selectionTitle?: string;
      submitButtonTitle?: string;
      actionColumnTitle?: string;
      hideActionConfirmation?: boolean;
    },
    public roleService: RoleService,
    public sidesheetRef: EuiSidesheetRef,
    private confirm: ConfirmationService
  ) {
    this.entitySchema = RoleRecommendationResultItem.GetEntitySchema();
    this.recommendationText =
      data.infoText ||
      (data.canEdit
        ? '#LDS#Here you can see recommendations for adding or removing entitlements. Additionally, you can perform the recommended actions right away.'
        : '#LDS#Here you can see recommendations for adding or removing entitlements.');
    this.recommendationSubtext = '#LDS#It may take some time for the changes to take effect.';
  }

  public async ngOnInit(): Promise<void> {
    const isbusy = this.busyService.beginBusy();
    try {
      if (!!this.data.recommendation) {
        this.buildDataSource(this.data.recommendation);
      } else {
        const recommendation = await this.roleService.getRecommendations(this.data.tablename, this.data.uidRole);
        this.buildDataSource(recommendation.Items);
      }
    } finally {
      isbusy.endBusy();
    }
  }

  public async onSelectionChanged(items: RoleRecommendationResultItem[]): Promise<any> {
    this.selectedEntities = items;
  }

  public async applyActions(): Promise<void> {
    const added = this.selectedEntities.reduce((elements, arr) => {
      return arr.Type.value === 0 ? elements + 1 : elements;
    }, 0);

    const remove = this.selectedEntities.reduce((elements, arr) => {
      return arr.Type.value === 1 ? elements + 1 : elements;
    }, 0);
    if (
      this.data.hideActionConfirmation || await this.confirm.confirm({
        Title: '#LDS#Heading Perform Recommended Actions',
        Message:
          '#LDS#Are you sure you want to perform the selected recommended actions? {0} entitlement assignments will be added to your shopping cart so you can request them. {1} entitlement assignments will be removed.',
        Parameter: [added, remove],
      })
    ) {
      this.sidesheetRef.close(this.selectedEntities);
    }
  }

  private buildDataSource(items: RoleRecommendationItem[]): void {
    const dataSource = this.recommendationItemBuilder.build(this.recommendationItemBuilder.buildEntityCollectionData(items));
    this.dstSettings = {
      dataSource,
      entitySchema: this.entitySchema,
      navigationState: {},
      displayedColumns: [this.entitySchema.Columns.Display, this.entitySchema.Columns.Reason],
    };
  }
}
