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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BusyService, calculateSidesheetWidth, DataSourceToolbarSettings, DataViewInitParameters, DataViewSource, HELP_CONTEXTUAL, HelpContextualValues, SideNavigationComponent } from 'qbm';

import { EuiSidesheetService } from '@elemental-ui/core';
import { CollectionLoadParameters, DataModel, DisplayColumns, EntitySchema, IClientProperty, TypedEntity, TypedEntityCollectionData, ValType } from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import { DugSidesheetComponent } from '../dug/dug-sidesheet.component';
import { PortalDgeResources } from '../TypedClient';
import { DugOverviewService } from './dug-overview.service';

@Component({
  selector: 'imx-dug-overview',
  templateUrl: './dug-overview.component.html',
  styleUrls: ['./dug-overview.component.scss'],
  providers: [DataViewSource],
})
export class DugOverviewComponent implements OnInit, SideNavigationComponent {

  @Input() public isAdmin = false;
  @Input() public uiddugnode: string = ''; 
  @Input() public isAuditView: boolean = false;
  @Output() public goBackToAuditView = new EventEmitter<void>();

  public data?: any;
  public contextId?: HelpContextualValues;
  private dataModel: DataModel;
  public busyService = new BusyService();
  public navigationState: CollectionLoadParameters = {};
  public dstSettings: DataSourceToolbarSettings;
  public entitySchema: EntitySchema;
  private displayedColumns: IClientProperty[] = [];
  public readonly DisplayColumns = DisplayColumns;
  public activeTabIndex = 0;
  public rootDug: PortalDgeResources[] = [];

  constructor(
    private readonly overviewService: DugOverviewService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    public dataSource: DataViewSource<PortalDgeResources>
  ) {
    this.entitySchema = overviewService.DugResourceSchema;
    this.displayedColumns = [
      this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchema.Columns.UID_QAMResourceType,
      this.entitySchema.Columns.RiskIndexCalculated,
    ];
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.dataModel = await this.overviewService.getDataModel();
      if(this.isAuditView){
        this.displayedColumns.push(
          {
            ColumnName: 'actions',
            Type: ValType.String
          }
        );
        await this.getData({uiddugnode: this.uiddugnode});
      }
      else{
        await this.getData();
      }
        
    } finally {
      this.contextId = this.isAuditView ? HELP_CONTEXTUAL.AuditingGovernedData : ( this.isAdmin ? HELP_CONTEXTUAL.GovernedDataOverview : HELP_CONTEXTUAL.GovernedData );
      isBusy.endBusy();
    }
  }

  /**
   * Occurs when the navigation state has changed - e.g. users clicks on the next page button.
   *
   */
  public async onNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    await this.getData(newState);
  }

  /**
   * Occurs when user triggers search.
   *
   * @param keywords Search keywords.
   */
  public async onSearch(keywords: string): Promise<void> {
    await this.getData({ ...this.navigationState, StartIndex: 0, search: keywords });
  }

  public async showDugResource(resource: TypedEntity): Promise<void> {
    const sidesheetRef = this.sideSheet.open(DugSidesheetComponent, {
      title: this.translate.instant('#LDS#Heading Edit Governed Data'),
      subTitle: resource.GetEntity().GetDisplay(),
      width: calculateSidesheetWidth(1000, 0.9),
      disableClose: true,
      padding: '0',
      testId: 'edit-dug-resource-sidesheet',
      data: { uid: resource.GetEntity().GetKeys()[0] },
    });
    sidesheetRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getData(this.navigationState);
      }
    });
  }

  private async getData(parameter: CollectionLoadParameters = {}): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    this.navigationState = this.isAdmin ? { ...parameter, allresources: '1' } : { ...parameter, owned: '1' };
    try {
      const dataViewInitParameters: DataViewInitParameters<PortalDgeResources> = {
        execute: async (): Promise<TypedEntityCollectionData<PortalDgeResources>> => {
          return await this.overviewService.getData(this.navigationState);
        },
        dataModel: this.dataModel,
        schema: this.entitySchema,
        columnsToDisplay: this.displayedColumns,
        highlightEntity: (dugResource: PortalDgeResources) => {
          this.showDugResource(dugResource);
        },
      };
      this.dataSource.init(dataViewInitParameters);
    } finally {
      isBusy.endBusy();
    }
  }

  public async viewContent (item: PortalDgeResources): Promise<void> {
    this.rootDug.push(item);
    await this.getData({uiddugnode: this.uiddugnode, uiddugparent: item.GetEntity().GetKeys()[0]});
  }

  public async goBackToRoot(item?: PortalDgeResources): Promise<void> {
    if(!item){
      this.goBackToAuditView.emit();
      return;
    }
    this.rootDug.pop();
    await this.getData({uiddugnode: this.uiddugnode, uiddugparent: item.GetEntity().GetColumn('UID_QAMDuGParent').GetValue()});
  }

  public get lastRootDuGItem() {
    return this.rootDug[this.rootDug.length - 1];
  }

  public get hasRootDug(): boolean {
    return this.rootDug.length > 0;
  }
}
