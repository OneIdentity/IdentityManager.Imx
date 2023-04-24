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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CompareOperator, DisplayColumns, EntitySchema, FilterType, TypedEntity, IClientProperty, ValType, FilterData, DataModel } from 'imx-qbm-dbts';
import {
  DataSourceItemStatus,
  DataSourceToolbarFilter,
  DataSourceToolbarGroupData,
  DataSourceToolbarSettings,
  DataTableComponent,
  DataTableGroupedData,
  SettingsService,
  UserMessageService,
  ClientPropertyForTableColumns
} from 'qbm';
import { AttestationHistoryCase } from './attestation-history-case';
import { AttestationCaseLoadParameters } from './attestation-case-load-parameters.interface';
import { AttestationHistoryService } from './attestation-history.service';
import { AttestationHistoryDetailsComponent } from './attestation-history-details/attestation-history-details.component';
import { Approvers } from '../decision/approvers.interface';
import { AttestationHistoryActionService } from './attestation-history-action.service';
import { AttestationCasesService } from '../decision/attestation-cases.service';
import { createGroupData } from '../datamodel/datamodel-helper';

@Component({
  selector: 'imx-attestation-history',
  templateUrl: './attestation-history.component.html',
  styleUrls: ['./attestation-history.component.scss']
})
export class AttestationHistoryComponent implements OnInit, OnDestroy {
  @Input() public parameters: { objecttable: string; objectuid: string; filter?: FilterData[] };
  @Input() public itemStatus: DataSourceItemStatus = { enabled: __ => true };

  public dstSettings: DataSourceToolbarSettings;
  public readonly DisplayColumns = DisplayColumns;
  public readonly entitySchema: EntitySchema;

  public groupedData: { [key: string]: DataTableGroupedData } = {};

  @Output() public selectionChanged = new EventEmitter<AttestationHistoryCase[]>();

  private filterOptions: DataSourceToolbarFilter[] = [];
  private dataModel: DataModel;

  private navigationState: AttestationCaseLoadParameters;

  private groupData: DataSourceToolbarGroupData;
  private displayedColumns: ClientPropertyForTableColumns[];
  private readonly subscriptions: Subscription[] = [];
  @ViewChild(DataTableComponent) private readonly table: DataTableComponent<TypedEntity>;

  constructor(
    public readonly attestationAction: AttestationHistoryActionService,
    private readonly attestationCaseService: AttestationCasesService,
    private readonly historyService: AttestationHistoryService,
    private readonly busyService: EuiLoadingService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translator: TranslateService,
    private readonly settingsService: SettingsService,
    private readonly messageService: UserMessageService
  ) {
    this.entitySchema = attestationCaseService.attestationCaseSchema;

    this.subscriptions.push(this.attestationAction.applied.subscribe(() => {
      this.getData();
      this.table?.clearSelection();
    }));
  }

  public async ngOnInit(): Promise<void> {
    this.displayedColumns = [
      this.entitySchema.Columns.UiText,
      this.entitySchema.Columns.AttestationState,
      {
        ColumnName: 'viewDetailsButton',
        Display: await this.translator.get('#LDS#Details').toPromise(),
        Type: ValType.String,
        afterAdditionals: true
      }
    ];
    this.navigationState = { ...this.parameters, ...{ PageSize: this.settingsService.DefaultPageSize, StartIndex: 0, OrderBy: 'ToSolveTill asc' } };

    let busyIndicator: OverlayRef;
    setTimeout(() => busyIndicator = this.busyService.show());
    try {
      this.dataModel = await this.historyService.getDataModel(
        this.parameters?.objecttable, this.parameters?.objectuid, this.parameters?.filter);
      this.filterOptions = this.dataModel.Filters;
      this.groupData = createGroupData(
        this.dataModel,
        parameters => {
          const uidpolicy = this.filterOptions.find(elem => elem.Name === 'uidpolicy')?.CurrentValue;
          const risk = this.filterOptions.find(elem => elem.Name === 'risk')?.CurrentValue;
          const state = this.filterOptions.find(elem => elem.Name === 'state')?.CurrentValue;
          return this.historyService.getGroupInfo({
            ...{
              PageSize: this.navigationState.PageSize,
              StartIndex: 0,
              objecttable: this.parameters?.objecttable,
              objectuid: this.parameters?.objectuid,
              groupFilter: this.parameters?.filter,
              risk,
              state,
              uidpolicy
            },
            ...parameters
          });
        },
        []
      );
    } finally {
      setTimeout(() => {
        this.busyService.hide(busyIndicator);
      });
    }

    await this.getData();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s?.unsubscribe());
  }

  public async onSearch(search: string): Promise<void> {
    return this.getData({ search });
  }

  public async onGroupingChange(groupKey: string): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));

    try {
      const groupedData = this.groupedData[groupKey];
      let filter = groupedData.navigationState?.filter;
      if(this.parameters?.filter){
        filter =[...(groupedData.navigationState?.filter ?? []),...(this.parameters?.filter ??[])].filter (elem=> elem != null);
      }
      const navigationState = {...groupedData.navigationState, filter}
      groupedData.data = await this.historyService.getAttestations(navigationState);
      groupedData.settings = {
        displayedColumns: this.dstSettings.displayedColumns,
        dataSource: groupedData.data,
        entitySchema: this.dstSettings.entitySchema,
        navigationState: groupedData.navigationState
      };
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public async getData(newState?: AttestationCaseLoadParameters): Promise<void> {
    const navigationState = {
      ...(this.dstSettings?.navigationState ?? this.navigationState),
      ...newState
    };

    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));
    try {
      const data = await this.historyService.getAttestations(navigationState);
      if (data) {
        this.dstSettings = {
          dataSource: {
            totalCount: data.totalCount,
            Data: data.Data ? data.Data : undefined
          },
          filters: this.filterOptions,
          groupData: this.groupData,
          displayedColumns: this.displayedColumns,
          entitySchema: this.entitySchema,
          navigationState,
          dataModel: this.dataModel,
          identifierForSessionStore: 'attestation-history'
        };
      } else {
        this.dstSettings = undefined;
      }
    } finally {
      setTimeout(() => {
        this.busyService.hide(overlayRef);
      });
    }
  }

  public async viewDetails(attestationCase: AttestationHistoryCase): Promise<void> {
    let attestationCaseWithPolicy: AttestationHistoryCase;
    let approvers: Approvers;

    let busyIndicator: OverlayRef;
    setTimeout(() => busyIndicator = this.busyService.show());

    try {
      attestationCaseWithPolicy = (await this.historyService.getAttestations({
        ...{ StartIndex: 0, PageSize: 1 },
        ...{
          objecttable: this.parameters?.objecttable,
          objectuid: this.parameters?.objectuid
        },
        uidpolicy: attestationCase.UID_AttestationPolicy.value,
        filter: [{
          ColumnName: 'UID_AttestationCase',
          Type: FilterType.Compare,
          CompareOp: CompareOperator.Equal,
          Value1: attestationCase.GetEntity().GetKeys()[0]
        }]
      })).Data[0];

      if (attestationCaseWithPolicy && !['approved', 'denied'].includes(attestationCaseWithPolicy.AttestationState.value)) {
        approvers = await this.attestationCaseService.getApprovers(attestationCaseWithPolicy);
      }
    } finally {
      setTimeout(() => this.busyService.hide(busyIndicator));
    }

    if (attestationCaseWithPolicy) {
      this.sideSheet.open(AttestationHistoryDetailsComponent, {
        title: await this.translator.get('#LDS#Heading View Attestation Case Details').toPromise(),
        headerColour: 'iris-blue',
        panelClass: 'imx-sidesheet',
        padding: '0',
        width: '600px',
        testId: 'attestation-history-case-sidesheet',
        data: {
          case: attestationCaseWithPolicy,
          approvers,
          showApprovalActions: this.parameters != null
        }
      });
    } else {
      this.messageService.subject.next({
        text: '#LDS#You cannot edit the item because the item does not exist. Please reload the page.'
      });
    }
  }
}
