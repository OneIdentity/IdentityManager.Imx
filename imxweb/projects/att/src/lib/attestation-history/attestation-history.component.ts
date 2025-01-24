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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import {
  CompareOperator,
  DisplayColumns,
  EntitySchema,
  FilterType,
  TypedEntity,
  FilterData,
  DataModel,
  ValType,
  DbObjectKey,
} from 'imx-qbm-dbts';
import {
  DataSourceItemStatus,
  DataSourceToolbarFilter,
  DataSourceToolbarGroupData,
  DataSourceToolbarSettings,
  DataTableComponent,
  DataTableGroupedData,
  SettingsService,
  UserMessageService,
  ClientPropertyForTableColumns,
  DataSourceToolbarViewConfig,
  BusyService,
} from 'qbm';
import { AttestationHistoryFilterComponent } from './attestation-history-filter/attestation-history-filter.component';
import { AttestationHistoryCase } from './attestation-history-case';
import { AttestationCaseLoadParameters } from './attestation-case-load-parameters.interface';
import { AttestationHistoryService } from './attestation-history.service';
import { AttestationHistoryDetailsComponent } from './attestation-history-details/attestation-history-details.component';
import { Approvers } from '../decision/approvers.interface';
import { AttestationHistoryActionService } from './attestation-history-action.service';
import { AttestationCasesService } from '../decision/attestation-cases.service';
import { createGroupData } from '../datamodel/datamodel-helper';
import { SourceDetectiveSidesheetComponent, SourceDetectiveSidesheetData, SourceDetectiveType, ViewConfigService } from 'qer';
import { ViewConfigData } from 'imx-api-qer';

@Component({
  selector: 'imx-attestation-history',
  templateUrl: './attestation-history.component.html',
  styleUrls: ['./attestation-history.component.scss'],
})
export class AttestationHistoryComponent implements OnInit, OnDestroy {
  @Input() public parameters: { objecttable: string; objectuid: string; filter?: FilterData[] };
  @Input() public itemStatus: DataSourceItemStatus = { enabled: (__) => true };
  @Input() public withAssignmentAnalysis: boolean = false;
  @Input() public selectable: boolean = true;

  @ViewChild('attestorFilter', { static: false }) public attestorFilter: AttestationHistoryFilterComponent;

  public dstSettings: DataSourceToolbarSettings;
  public readonly DisplayColumns = DisplayColumns;
  public readonly entitySchema: EntitySchema;

  public groupedData: { [key: string]: DataTableGroupedData } = {};

  @Output() public selectionChanged = new EventEmitter<AttestationHistoryCase[]>();

  public busyService = new BusyService();

  private filterOptions: DataSourceToolbarFilter[] = [];
  private dataModel: DataModel;

  private navigationState: AttestationCaseLoadParameters;

  private groupData: DataSourceToolbarGroupData;
  private displayedColumns: ClientPropertyForTableColumns[];
  private readonly subscriptions: Subscription[] = [];

  @ViewChild(DataTableComponent) private readonly table: DataTableComponent<TypedEntity>;
  private viewConfig: DataSourceToolbarViewConfig;
  private viewConfigPath = 'attestation/case';

  constructor(
    public readonly attestationAction: AttestationHistoryActionService,
    private readonly attestationCaseService: AttestationCasesService,
    private readonly historyService: AttestationHistoryService,
    private viewConfigService: ViewConfigService,
    private readonly busyServiceElemental: EuiLoadingService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translator: TranslateService,
    private readonly settingsService: SettingsService,
    private readonly messageService: UserMessageService
  ) {
    this.entitySchema = attestationCaseService.attestationCaseSchema;

    this.subscriptions.push(
      this.attestationAction.applied.subscribe(async () => {
        await this.getData();
        this.table?.clearSelection();
      })
    );
  }

  public async ngOnInit(): Promise<void> {
    this.displayedColumns = [this.entitySchema.Columns.UiText, this.entitySchema.Columns.AttestationState];

    if (this.withAssignmentAnalysis) {
      this.displayedColumns.push({
        ColumnName: 'actions',
        Type: ValType.String,
        afterAdditionals: true,
        untranslatedDisplay: '#LDS#View assignment analysis',
      });
    }
    this.navigationState = { ...this.parameters, ...{ PageSize: this.settingsService.DefaultPageSize, StartIndex: 0 } };

    const isBusy = this.busyService.beginBusy();
    try {
      this.dataModel = await this.historyService.getDataModel(
        this.parameters?.objecttable,
        this.parameters?.objectuid,
        this.parameters?.filter
      );
      this.filterOptions = this.dataModel.Filters;
      this.groupData = createGroupData(
        this.dataModel,
        (parameters) => {
          const uidpolicy = this.filterOptions.find((elem) => elem.Name === 'uidpolicy')?.CurrentValue;
          const risk = this.filterOptions.find((elem) => elem.Name === 'risk')?.CurrentValue;
          const state = this.filterOptions.find((elem) => elem.Name === 'state')?.CurrentValue;
          return this.historyService.getGroupInfo({
            ...{
              PageSize: this.navigationState.PageSize,
              StartIndex: 0,
              objecttable: this.parameters?.objecttable,
              objectuid: this.parameters?.objectuid,
              groupFilter: this.parameters?.filter,
              risk,
              state,
              uidpolicy,
            },
            ...parameters,
          });
        },
        []
      );
      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);
      // We will check the configs for default state only on ini
      if (!this.viewConfigService.isDefaultConfigSet()) {
        // If we have no default settings, we will use the due date to sort
        this.navigationState.OrderBy = 'ToSolveTill';
      }

      await this.getData(undefined, true);
    } finally {
      setTimeout(() => {
        isBusy.endBusy();
      });
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s?.unsubscribe());
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

  public async onSearch(search: string): Promise<void> {
    this.historyService.abortCall();
    return this.getData({ search });
  }

  public async onGroupingChange(groupInfo: { key: string; isInitial: boolean }): Promise<void> {
    const isBusy = this.busyService.beginBusy();

    try {
      const groupedData = this.groupedData[groupInfo.key];
      if (groupInfo.isInitial) {
        groupedData.data = { totalCount: 0, Data: [] };
      } else {
        let filter = groupedData.navigationState?.filter;
        if (this.parameters?.filter) {
          filter = [...(groupedData.navigationState?.filter ?? []), ...(this.parameters?.filter ?? [])].filter((elem) => elem != null);
        }
        const navigationState = { ...groupedData.navigationState, filter };
        groupedData.data = await this.historyService.getAttestations(navigationState);
      }

      groupedData.settings = {
        displayedColumns: this.dstSettings.displayedColumns,
        dataModel: this.dstSettings.dataModel,
        dataSource: groupedData.data,
        entitySchema: this.dstSettings.entitySchema,
        navigationState: groupedData.navigationState,
      };
    } finally {
      isBusy.endBusy();
    }
  }

  public async getData(newState?: AttestationCaseLoadParameters, isInitialLoad: boolean = false): Promise<void> {
    this.navigationState = {
      ...(this.dstSettings?.navigationState ?? this.navigationState),
      uid_persondecision: this.attestorFilter?.selectedUid,
      ...newState,
    };

    const isBusy = this.busyService.beginBusy();

    try {
      const data = isInitialLoad ? { totalCount: 0, Data: [] } : await this.historyService.getAttestations(this.navigationState);
      const exportMethod = this.historyService.exportAttestation(this.navigationState);
      exportMethod.initialColumns = this.displayedColumns.map((col) => col.ColumnName);
      if (data) {
        this.dstSettings = {
          dataSource: {
            totalCount: data.totalCount,
            Data: data.Data ? data.Data : undefined,
          },
          filters: this.filterOptions,
          groupData: this.groupData,
          displayedColumns: this.displayedColumns,
          entitySchema: this.entitySchema,
          navigationState: this.navigationState,
          dataModel: this.dataModel,
          viewConfig: this.viewConfig,
          exportMethod,
        };
      }
    } finally {
      isBusy.endBusy();
    }
  }

  public async viewDetails(attestationCase: AttestationHistoryCase): Promise<void> {
    let attestationCaseWithPolicy: AttestationHistoryCase;
    let approvers: Approvers;

    let busyIndicator: OverlayRef;
    setTimeout(() => (busyIndicator = this.busyServiceElemental.show()));

    try {
      attestationCaseWithPolicy = (
        await this.historyService.getAttestations({
          ...{ StartIndex: 0, PageSize: 1 },
          ...{
            objecttable: this.parameters?.objecttable,
            objectuid: this.parameters?.objectuid,
          },
          uidpolicy: attestationCase.UID_AttestationPolicy.value,
          filter: [
            {
              ColumnName: 'UID_AttestationCase',
              Type: FilterType.Compare,
              CompareOp: CompareOperator.Equal,
              Value1: attestationCase.GetEntity().GetKeys()[0],
            },
          ],
        })
      ).Data[0];

      if (attestationCaseWithPolicy && !['approved', 'denied'].includes(attestationCaseWithPolicy.AttestationState.value)) {
        approvers = await this.attestationCaseService.getApprovers(attestationCaseWithPolicy);
      }
    } finally {
      setTimeout(() => this.busyServiceElemental.hide(busyIndicator));
    }

    if (attestationCaseWithPolicy) {
      this.sideSheet.open(AttestationHistoryDetailsComponent, {
        title: await this.translator.get('#LDS#Heading View Attestation Case Details').toPromise(),
        subTitle: attestationCaseWithPolicy.GetEntity().GetDisplay(),
        padding: '0',
        width: '600px',
        testId: 'attestation-history-case-sidesheet',
        data: {
          case: attestationCaseWithPolicy,
          approvers,
          showApprovalActions: this.parameters != null,
        },
      });
    } else {
      this.messageService.subject.next({
        text: '#LDS#You cannot edit the item because the item does not exist. Please reload the page.',
      });
    }
  }

  public async viewAssignmentAnalysis(event: Event, attestationCase: AttestationHistoryCase): Promise<void> {
    event.stopPropagation();
    const uidPerson = attestationCase.UID_Person.value;
    const objectKey = DbObjectKey.FromXml(attestationCase.ObjectKeyBase.value);

    const data: SourceDetectiveSidesheetData = {
      UID_Person: uidPerson,
      Type: SourceDetectiveType.MembershipOfSystemEntitlement,
      UID: objectKey.Keys.join(','),
      TableName: objectKey.TableName,
    };
    this.sideSheet.open(SourceDetectiveSidesheetComponent, {
      title: await this.translator.get('#LDS#Heading View Assignment Analysis').toPromise(),
      subTitle: attestationCase.GetEntity().GetDisplay(),
      padding: '0px',
      width: 'max(50%,500px)',
      disableClose: false,
      testId: 'attestation-history-details-assignment-analysis',
      data,
    });
  }
}
