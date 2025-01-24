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

import { Component, Input, OnDestroy, OnInit, ViewChild, OnChanges } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import {
  DataModel,
  DisplayColumns,
  EntitySchema,
  ExtendedTypedEntityCollection,
  IClientProperty,
  TypedEntity,
  ValType,
} from 'imx-qbm-dbts';
import { ITShopConfig, PwoExtendedData, ViewConfigData } from 'imx-api-qer';

import {
  DataSourceToolbarSettings,
  DataSourceToolbarFilter,
  DataSourceToolbarExportMethod,
  imx_SessionService,
  ImxTranslationProviderService,
  DataTableComponent,
  SettingsService,
  ExtService,
  IExtension,
  DataSourceToolbarComponent,
  BusyService,
  DataSourceToolbarViewConfig,
} from 'qbm';
import { RequestDetailComponent } from './request-detail/request-detail.component';
import { RequestHistoryService } from './request-history.service';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { RequestActionService } from './request-action/request-action.service';
import { ItshopRequest } from './itshop-request';
import { RequestHistoryLoadParameters } from './request-history-load-parameters.interface';
import { RequestHistoryFilterComponent } from './request-history-filter/request-history-filter.component';
import { ViewConfigService } from '../view-config/view-config.service';

@Component({
  templateUrl: './request-table.component.html',
  styleUrls: ['./request-table.component.scss'],
  selector: 'imx-request-table',
})
export class RequestTableComponent implements OnInit, OnDestroy, OnChanges {
  public additional: IClientProperty[] = [];
  public get entitySchema(): EntitySchema {
    return this.requestHistoryService.PortalItshopRequestsSchema;
  }
  public get canWithdrawAdditionalApprover(): boolean {
    return (
      this.itShopConfig &&
      this.itShopConfig.VI_ITShop_OrderHistory_CancelOrder &&
      this.selectedItems.every((item) => item.canWithdrawAdditionalApprover)
    );
  }
  public get canWithdrawDelegation(): boolean {
    return (
      this.itShopConfig &&
      this.itShopConfig.VI_ITShop_OrderHistory_CancelOrder &&
      this.selectedItems.every((item) => item.canWithdrawDelegation)
    );
  }
  public get canRecallLastQuestion(): boolean {
    return this.selectedItems.every((item) => item.canRecallLastQuestion);
  }
  public get canRevokeHoldStatus(): boolean {
    return this.selectedItems.every((item) => item.canRevokeHoldStatus);
  }
  public get canProlongateRequest(): boolean {
    return this.selectedItems.every((item) => item.canProlongate);
  }
  public get canWithdrawRequest(): boolean {
    return this.selectedItems.every((item) => item.CancelRequestAllowed.value);
  }
  public get canUnsubscribeRequest(): boolean {
    return this.selectedItems.every((item) => item.UnsubscribeRequestAllowed.value);
  }
  public get canEscalateDecision(): boolean {
    return this.selectedItems.every((item) => item.canEscalateDecision);
  }
  public get canCopyItems(): boolean {
    return this.selectedItems.every((item) => item.canCopyItems);
  }

  public get canPerformActions(): boolean {
    return (
      this.selectedItems.length > 0 &&
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

  @ViewChild('requestHistoryFilter', { static: false }) public requestHistoryFilters: RequestHistoryFilterComponent;

  public dstSettings: DataSourceToolbarSettings;
  public selectedItems: ItshopRequest[] = [];

  public readonly DisplayColumns = DisplayColumns;

  private navigationState: RequestHistoryLoadParameters;
  private itShopConfig: ITShopConfig;
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
  private readonly filterPresets = { ShowEndingSoon: undefined, ShowMyPending: undefined };
  public readonly busyService = new BusyService();
  @ViewChild(DataTableComponent) private readonly table: DataTableComponent<TypedEntity>;
  @ViewChild(DataSourceToolbarComponent) private readonly dataToolbar: DataSourceToolbarComponent;

  constructor(
    public readonly actionService: RequestActionService,
    public readonly translateProvider: ImxTranslationProviderService,
    private readonly translator: TranslateService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly requestHistoryService: RequestHistoryService,
    private viewConfigService: ViewConfigService,
    private readonly session: imx_SessionService,
    readonly settingsService: SettingsService,
    private readonly projectConfig: ProjectConfigurationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly ext: ExtService
  ) {
    this.extensions = this.ext.Registry[this.UID_ComplianceRuleId];

    if (this.extensions && this.extensions.length > 0) {
      this.extensions[0].subject.subscribe((dstSettings: DataSourceToolbarSettings) => {
        this.dstSettings = dstSettings;
      });
    }

    this.navigationState = { PageSize: settingsService.DefaultPageSize, StartIndex: 0 };

    this.subscriptions.push(
      this.actionService.applied.subscribe(async () => {
        this.getData();
        this.table.clearSelection();
      })
    );
  }

  ngOnChanges() {
    if (this.uidRecipient) {
      this.getData();
    }
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
      this.userUid = (await this.session.getSessionState()).UserUid;
      this.dataModel = await this.requestHistoryService.getDataModel(this.userUid);
      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);
      this.activatedRoute.queryParams.subscribe((params) => this.updateFiltersFromRouteParams(params));
      this.filterOptions = await this.requestHistoryService.getFilterOptions(this.userUid, this.filterPresets);
      this.itShopConfig = (await this.projectConfig.getConfig()).ITShopConfig;

      await this.getData(null, true);
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
      this.navigationState.uidpwo = result['uid_personwantsorg'];
    }

    Object.keys(this.filterPresets).forEach(
      (filterName) => (this.filterPresets[filterName] = this.activatedRoute.snapshot.queryParamMap.get(filterName))
    );

    this.navigationState.ShowEndingSoon = this.filterPresets.ShowEndingSoon;
    this.navigationState.ShowMyPending = this.filterPresets.ShowMyPending;
  }

  public onSelectionChanged(items: ItshopRequest[]): void {
    this.selectedItems = items;
  }

  public async updateConfig(config: ViewConfigData): Promise<void> {
    await this.viewConfigService.putViewConfig(config);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dstSettings.viewConfig = this.viewConfig;
  }

  public async deleteConfigById(id: string): Promise<void> {
    await this.viewConfigService.deleteViewConfig(id);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dstSettings.viewConfig = this.viewConfig;
  }

  public onSearch(keywords: string): Promise<void> {
    this.requestHistoryService.abortCall();
    const navigationState = {
      ...this.navigationState,
      ...{
        StartIndex: 0,
        search: keywords,
      },
    };

    return this.getData(navigationState);
  }

  public getAdditionalText(entity: ItshopRequest, additional: IClientProperty[]): string {
    return additional
      .map((elem) => `${elem.Display || elem.ColumnName}: ${entity.GetEntity().GetColumn(elem.ColumnName).GetDisplayValue() || '-'}`)
      .join(';');
  }

  public async getData(newState?: RequestHistoryLoadParameters, isInit = false): Promise<void> {
    const busy = this.busyService.beginBusy();

    if (newState) {
      this.navigationState = newState;
    }

    try {
      const personUid = this.uidRecipientRequester || this.requestHistoryFilters?.selectedUid;
      if (personUid) {
        this.navigationState.UID_Person = personUid;

        const personFilter = this.filterOptions.find((elem) => elem.Name === 'person')?.CurrentValue;
        this.navigationState.person = personFilter ?? '7';
      }
      if (this.uidRecipient) {
        this.navigationState.uidpersonordered = this.uidRecipient;
        this.navigationState.uidpersoninserted = this.userUid;
      }

      // We check here if we have a default config, if so then we will skip the init data to save time
      let data: ExtendedTypedEntityCollection<ItshopRequest, PwoExtendedData>;
      if (isInit) {
        // We don't waste time on the call as the view config hasn't been set yet.
        data = {
          totalCount: 0,
          Data: [],
        };
      } else {
        data = this.isArchivedRequests
          ? await this.requestHistoryService.getArchivedRequests(this.userUid, this.uidRecipient)
          : await this.requestHistoryService.getRequests(this.userUid, this.navigationState);
      }
      let exportMethod: DataSourceToolbarExportMethod;
      // TODO 409926: Api needs to allow exporting of archived requests
      if (!this.isArchivedRequests) {
        exportMethod = this.requestHistoryService.exportRequests(this.navigationState);
        exportMethod.initialColumns = this.displayedColumns.map((col) => col.ColumnName);
      }
      if (data) {
        const dstSettings: DataSourceToolbarSettings = {
          dataSource: {
            ...data,
            Data: data.Data ? this.sortChildrenAfterParents(data.Data) : undefined,
          },
          filters: this.filterOptions,
          displayedColumns: this.displayedColumns,
          entitySchema: this.requestHistoryService.PortalItshopRequestsSchema,
          navigationState: this.navigationState,
          extendedData: data.extendedData ? data.extendedData.Data : undefined,
          dataModel: this.dataModel,
          viewConfig: this.viewConfig,
          exportMethod,
        };
        if (this.extensions && this.extensions[0]) {
          this.extensions[0].inputData = dstSettings;
        } else {
          this.dstSettings = dstSettings;
        }
      }
    } finally {
      busy.endBusy();
    }
  }

  public async onHighlightedEntityChanged(pwo: ItshopRequest): Promise<void> {
    await this.viewDetails(pwo);
  }

  public async viewDetails(pwo: ItshopRequest): Promise<void> {
    await this.sideSheet
      .open(RequestDetailComponent, {
        title: await this.translator.get('#LDS#Heading View Request Details').toPromise(),
        subTitle: pwo.GetEntity().GetDisplay(),
        padding: '0px',
        width: 'max(700px, 60%)',
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

  private sortChildrenAfterParents(requests: ItshopRequest[]): ItshopRequest[] {
    const sorted = [];

    for (const request of requests) {
      if (!sorted.find((item) => this.getUid(item) === this.getUid(request))) {
        const parentIndex = sorted.findIndex((item) => this.getUid(item) === request.UID_PersonWantsOrgParent.value);
        if (parentIndex > -1) {
          sorted.splice(parentIndex + 1, 0, request);
        } else {
          for (const item of this.reorder(request, requests)) {
            sorted.push(item);
          }
        }
      }
    }

    return sorted;
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
