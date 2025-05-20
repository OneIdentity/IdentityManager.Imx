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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { ITShopConfig, PwoExtendedData, ViewConfigData } from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  DataModel,
  DisplayColumns,
  EntitySchema,
  ExtendedTypedEntityCollection,
  IClientProperty,
  ValType,
} from '@imx-modules/imx-qbm-dbts';

import {
  BusyService,
  DataSourceToolbarFilter,
  DataSourceToolbarSettings,
  DataSourceToolbarViewConfig,
  DataViewInitParameters,
  DataViewSource,
  ExtService,
  IExtension,
  ImxTranslationProviderService,
  calculateSidesheetWidth,
  imx_SessionService,
} from 'qbm';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { ViewConfigService } from '../view-config/view-config.service';
import { ItshopRequest } from './itshop-request';
import { RequestActionService } from './request-action/request-action.service';
import { RequestDetailComponent } from './request-detail/request-detail.component';
import { RequestHistoryService } from './request-history.service';

@Component({
  templateUrl: './request-table.component.html',
  styleUrls: ['./request-table.component.scss'],
  selector: 'imx-request-table',
  providers: [DataViewSource],
})
export class RequestTableComponent implements OnInit, OnDestroy {
  public additional: IClientProperty[] = [];
  public get entitySchema(): EntitySchema {
    return this.requestHistoryService.PortalItshopRequestsSchema;
  }
  public get canWithdrawAdditionalApprover(): boolean {
    return (
      this.itShopConfig != null &&
      this.itShopConfig?.VI_ITShop_OrderHistory_CancelOrder &&
      this.selectedItems.every((item: ItshopRequest) => item.canWithdrawAdditionalApprover)
    );
  }
  public get canWithdrawDelegation(): boolean {
    return (
      this.itShopConfig != null &&
      this.itShopConfig.VI_ITShop_OrderHistory_CancelOrder &&
      this.selectedItems.every((item: ItshopRequest) => item.canWithdrawDelegation)
    );
  }
  public get canRecallLastQuestion(): boolean {
    return this.selectedItems.every((item: ItshopRequest) => item.canRecallLastQuestion);
  }
  public get canRevokeHoldStatus(): boolean {
    return this.selectedItems.every((item: ItshopRequest) => item.canRevokeHoldStatus);
  }
  public get canProlongateRequest(): boolean {
    return this.selectedItems.every((item: ItshopRequest) => item.canProlongate);
  }
  public get canWithdrawRequest(): boolean {
    return this.selectedItems.every((item: ItshopRequest) => item.CancelRequestAllowed.value);
  }
  public get canUnsubscribeRequest(): boolean {
    return this.selectedItems.every((item: ItshopRequest) => item.UnsubscribeRequestAllowed.value);
  }
  public get canEscalateDecision(): boolean {
    return this.selectedItems.every((item: ItshopRequest) => item.canEscalateDecision);
  }
  public get canCopyItems(): boolean {
    return this.selectedItems.every((item: ItshopRequest) => item.canCopyItems);
  }

  public get canPerformActions(): boolean {
    return (
      !!this.selectedItems.length &&
      !this.isReadOnly &&
      (this.canWithdrawAdditionalApprover ||
        this.canWithdrawDelegation ||
        this.canRecallLastQuestion ||
        this.canRevokeHoldStatus ||
        this.canWithdrawRequest ||
        this.canProlongateRequest ||
        this.canUnsubscribeRequest ||
        this.canCopyItems ||
        this.canEscalateDecision)
    );
  }

  @Input() public isReadOnly: boolean;
  @Input() public uidRecipientRequester: string;
  @Input() public isArchivedRequests: boolean;
  @Input() public uidRecipient: string;
  @Input() public filterByDelegations: boolean;
  @Input() public filterMyPendings: boolean;
  @Input() public filterByEndingSoon: boolean;
  public selectedItems: ItshopRequest[] = [];

  public readonly DisplayColumns = DisplayColumns;

  private itShopConfig: ITShopConfig | undefined;
  private filterOptions: DataSourceToolbarFilter[] = [];
  private dataModel: DataModel;
  private viewConfig: DataSourceToolbarViewConfig;
  private get viewConfigPath(): string {
    return this.isArchivedRequests ? 'itshop/history/requests' : 'itshop/requests';
  }
  private userUid: string;
  private extensions: IExtension[] = [];
  private readonly UID_ComplianceRuleId = 'cpl.UID_ComplianceRule';
  private displayedColumns: IClientProperty[];
  private readonly subscriptions: Subscription[] = [];
  public uidpwo: string;
  public readonly busyService = new BusyService();
  public uniqueTableConfig = false;

  constructor(
    public readonly actionService: RequestActionService,
    public readonly translateProvider: ImxTranslationProviderService,
    private readonly translator: TranslateService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly requestHistoryService: RequestHistoryService,
    private viewConfigService: ViewConfigService,
    private readonly session: imx_SessionService,
    private readonly projectConfig: ProjectConfigurationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly ext: ExtService,
    public dataSource: DataViewSource<ItshopRequest, PwoExtendedData>,
  ) {
    this.extensions = this.ext.Registry[this.UID_ComplianceRuleId];

    if (this.extensions && this.extensions.length > 0) {
      this.extensions[0].subject?.subscribe((dstSettings: DataSourceToolbarSettings) => {
        this.dataSource.collectionData.update((collectionData) => ({
          ...collectionData,
          Data: dstSettings.dataSource?.Data as ItshopRequest[],
        }));
      });
    }

    this.subscriptions.push(
      this.actionService.applied.subscribe(async () => {
        this.dataSource.selection.clear();
        this.dataSource.updateState();
      }),
    );
  }

  public async ngOnInit(): Promise<void> {
    this.displayedColumns = [
      this.entitySchema.Columns.DisplayOrg,
      {
        Display: await this.translator.get('#LDS#Badges').toPromise(),
        ColumnName: 'badges',
        Type: ValType.String,
      },
      this.entitySchema.Columns.UiOrderState,
      this.entitySchema.Columns.OrderDate,
    ];

    const busy = this.busyService.beginBusy();
    try {
      this.userUid = (await this.session.getSessionState()).UserUid || '';
      this.dataModel = await this.requestHistoryService.getDataModel(this.userUid);
      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);
      this.activatedRoute.queryParams.subscribe((params) => this.updateFiltersFromRouteParams(params));
      this.filterOptions = await this.requestHistoryService.getFilterOptions(this.dataModel);
      this.itShopConfig = (await this.projectConfig.getConfig()).ITShopConfig;

      await this.getData();
    } finally {
      busy.endBusy();
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public updateFiltersFromRouteParams(params: Params): void {
    if (this.viewConfigService.isDefaultConfigSet()) {
      // If we have a default config, we won't set our filters
      return;
    }
    // Make keys lowercase
    const result = {};
    for (const [key, value] of Object.entries(params)) {
      result[key.toLowerCase()] = value;
    }
    // Case: VI_BuildITShopLink_Show_for_Requester
    if (result['uid_personwantsorg']) {
      this.uidpwo = result['uid_personwantsorg'];
    }
  }

  public async updateConfig(config: ViewConfigData): Promise<void> {
    await this.viewConfigService.putViewConfig(config);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dataSource.viewConfig.set(this.viewConfig);
  }

  public async deleteConfigById(id: string): Promise<void> {
    await this.viewConfigService.deleteViewConfig(id);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dataSource.viewConfig.set(this.viewConfig);
  }

  public getAdditionalText(entity: ItshopRequest): string {
    return (
      this.dataSource
        .additionalListColumns()
        ?.map((elem: IClientProperty) => {
          return `${elem?.Display || elem?.ColumnName}: ${elem?.ColumnName == null ? '-' : entity.GetEntity().GetColumn(elem.ColumnName).GetDisplayValue() || '-'}`;
        })
        .filter((elem) => !!elem)
        .join('; ') || ''
    );
  }

  public async getData(): Promise<void> {
    this.updateCollectionParameters();
    const dataViewInitParameters: DataViewInitParameters<ItshopRequest> = {
      execute: this.isArchivedRequests
        ? (): Promise<ExtendedTypedEntityCollection<ItshopRequest, PwoExtendedData>> =>
            this.requestHistoryService.getArchivedRequests(this.userUid, this.uidRecipient)
        : async (
            params: CollectionLoadParameters,
            signal: AbortSignal,
          ): Promise<ExtendedTypedEntityCollection<ItshopRequest, PwoExtendedData>> => {
            return Promise.resolve(
              this.sortChildrenAfterParents(
                await this.requestHistoryService.getRequests(
                  this.userUid,
                  {
                    ...params,
                    UID_Person: this.uidRecipientRequester,
                    uidpersonordered: this.uidRecipient,
                    uidpersoninserted: this.uidRecipient ? this.userUid : undefined,
                  },
                  signal,
                ),
              ),
            );
          },
      schema: this.entitySchema,
      columnsToDisplay: this.displayedColumns,
      dataModel: this.dataModel,
      exportFunction: !this.isArchivedRequests ? this.requestHistoryService.exportRequests() : undefined,
      viewConfig: this.viewConfig,
      uniqueConfig: this.uniqueTableConfig,
      highlightEntity: (entity: ItshopRequest) => {
        this.viewDetails(entity);
      },
      selectionChange: (selection: ItshopRequest[]) => {
        this.selectedItems = selection;
      },
    };
    this.dataSource.init(dataViewInitParameters);
  }

  public async viewDetails(pwo: ItshopRequest): Promise<void> {
    await this.sideSheet
      .open(RequestDetailComponent, {
        title: await this.translator.get('#LDS#Heading View Request Details').toPromise(),
        subTitle: pwo.GetEntity().GetDisplay(),
        padding: '0px',
        width: calculateSidesheetWidth(),
        testId: 'request-table-view-request-details',
        data: {
          isReadOnly: this.isReadOnly,
          personWantsOrg: pwo,
          itShopConfig: this.itShopConfig,
          userUid: this.userUid,
        },
      })
      .afterClosed()
      .toPromise();
  }

  private updateCollectionParameters(): void {
    const newState: CollectionLoadParameters = {};
    if (this.uidRecipientRequester) {
      const personFilter = this.filterOptions.find((elem) => elem.Name === 'person')?.CurrentValue;
      this.filterOptions.map((filter) => {
        if (filter.Name === 'person') {
          filter.CurrentValue = personFilter ?? '7';
        }
      });
      newState.person = personFilter ?? '7';
      this.uniqueTableConfig = true;
    }
    if (this.filterByDelegations) {
      this.filterOptions.map((filter) => {
        if (filter.Name === 'MyDelegations') {
          filter.CurrentValue = '1';
        }
      });
      newState.MyDelegations = '1';
      this.uniqueTableConfig = true;
    }
    if (this.filterMyPendings) {
      this.filterOptions.map((filter) => {
        if (filter.Name === 'ShowMyPending') {
          filter.CurrentValue = '1';
        }
      });
      newState.ShowMyPending = '1';
      this.uniqueTableConfig = true;
    }
    if (this.filterByEndingSoon) {
      this.filterOptions.map((filter) => {
        if (filter.Name === 'ShowEndingSoon') {
          filter.CurrentValue = '1';
        }
        if (filter.Name === 'person') {
          filter.CurrentValue = '1,4';
        }
      });
      newState.ShowEndingSoon = '1';
      newState.person = '1,4';
      this.uniqueTableConfig = true;
    }
    // If any of the above filters are set, we need to update the state
    if (this.uniqueTableConfig) {
      this.dataSource.state.update((state) => ({ ...state, ...newState }));
    }
    this.dataSource.predefinedFilters.set(this.filterOptions);
  }

  private sortChildrenAfterParents(
    requests: ExtendedTypedEntityCollection<ItshopRequest, PwoExtendedData>,
  ): ExtendedTypedEntityCollection<ItshopRequest, PwoExtendedData> {
    const sorted: ItshopRequest[] = requests.Data;

    for (const request of requests.Data) {
      if (!sorted.find((item) => this.getUid(item) === this.getUid(request))) {
        const parentIndex = sorted.findIndex((item) => this.getUid(item) === request.UID_PersonWantsOrgParent.value);
        if (parentIndex > -1) {
          sorted.splice(parentIndex + 1, 0, request);
        } else {
          for (const item of this.reorder(request, requests.Data)) {
            sorted.push(item);
          }
        }
      }
    }

    return { ...requests, Data: sorted };
  }

  private reorder(request: ItshopRequest, requests: ItshopRequest[]): ItshopRequest[] {
    const parent = request.UID_PersonWantsOrgParent.value
      ? requests.find((item) => this.getUid(item) === request.UID_PersonWantsOrgParent.value)
      : undefined;

    if (parent) {
      const parents = this.reorder(parent, requests);
      parents.push(request);
      return parents;
    }

    return [request];
  }

  private getUid(request: ItshopRequest): string {
    return request.GetEntity().GetKeys()[0];
  }
}
