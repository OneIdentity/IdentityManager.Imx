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

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { ViewConfigData } from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  CompareOperator,
  DataModel,
  DbObjectKey,
  DisplayColumns,
  EntitySchema,
  FilterData,
  FilterType,
  TypedEntity,
  TypedEntityCollectionData,
  ValType,
} from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import {
  BusyService,
  calculateSidesheetWidth,
  ClientPropertyForTableColumns,
  DataSourceItemStatus,
  DataSourceToolbarViewConfig,
  DataTableGroupedData,
  DataViewInitParameters,
  DataViewSource,
  setFilterDisplay,
  UserMessageService,
} from 'qbm';
import { SourceDetectiveSidesheetComponent, SourceDetectiveSidesheetData, SourceDetectiveType, ViewConfigService } from 'qer';
import { Subscription } from 'rxjs';
import { Approvers } from '../decision/approvers.interface';
import { AttestationCasesService } from '../decision/attestation-cases.service';
import { AttestationHistoryActionService } from './attestation-history-action.service';
import { AttestationHistoryCase } from './attestation-history-case';
import { AttestationHistoryDetailsComponent } from './attestation-history-details/attestation-history-details.component';
import { AttestationHistoryService } from './attestation-history.service';

@Component({
  selector: 'imx-attestation-history',
  templateUrl: './attestation-history.component.html',
  styleUrls: ['./attestation-history.component.scss'],
  providers: [DataViewSource],
})
export class AttestationHistoryComponent implements OnInit, OnDestroy {
  @Input() public parameters: { objecttable: string; objectuid: string; filter?: FilterData[] };
  @Input() public itemStatus: DataSourceItemStatus = { enabled: (__) => true };
  @Input() public withAssignmentAnalysis: boolean = false;
  @Input() public selectable: boolean = true;
  @Input() title: string;

  public readonly DisplayColumns = DisplayColumns;
  public readonly entitySchema: EntitySchema;

  public groupedData: { [key: string]: DataTableGroupedData } = {};

  @Output() public selectionChanged = new EventEmitter<TypedEntity[]>();

  public busyService = new BusyService();

  private dataModel: DataModel;
  private displayedColumns: ClientPropertyForTableColumns[];
  private readonly subscriptions: Subscription[] = [];
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
    private readonly messageService: UserMessageService,
    public dataSource: DataViewSource<AttestationHistoryCase>,
  ) {
    this.entitySchema = attestationCaseService.attestationCaseSchema;

    this.subscriptions.push(
      this.attestationAction.applied.subscribe(async () => {
        this.dataSource.updateState();
        this.dataSource.selection.clear();
      }),
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

    const isBusy = this.busyService.beginBusy();
    try {
      this.dataModel = await this.historyService.getDataModel(
        this.parameters?.objecttable,
        this.parameters?.objectuid,
        this.parameters?.filter,
      );
      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);

      await this.initTable();
    } finally {
      isBusy.endBusy();
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s?.unsubscribe());
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

  public async initTable(): Promise<void> {
    this.dataSource.itemStatus = this.itemStatus;
    const dataViewInitParameters: DataViewInitParameters<AttestationHistoryCase> = {
      execute: (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<AttestationHistoryCase>> =>
        this.historyService.getAttestations({ ...this.parameters, ...params }),
      schema: this.entitySchema,
      columnsToDisplay: this.displayedColumns,
      dataModel: this.dataModel,
      groupExecute: (column: string, params: CollectionLoadParameters, signal: AbortSignal) =>
        Promise.resolve(
          this.historyService
            .getGroupInfo({
              ...params,
              ...this.parameters,
              StartIndex: 0,
              def: column,
            })
            .then((groupInfoData) => {
              groupInfoData.Groups?.map((group) => {
                setFilterDisplay(group);
                return group;
              });
              return groupInfoData;
            }),
        ),
      viewConfig: this.viewConfig,
      highlightEntity: (entity: AttestationHistoryCase) => {
        this.viewDetails(entity);
      },
      selectionChange: (selection: Array<AttestationHistoryCase>) => this.selectionChanged.emit(selection),
      exportFunction: this.historyService.exportAttestation(this.dataSource.state()),
    };
    this.dataSource.init(dataViewInitParameters);
  }

  public async viewDetails(entity: AttestationHistoryCase): Promise<void> {
    const attestationCase = entity as AttestationHistoryCase;
    let attestationCaseWithPolicy: AttestationHistoryCase;
    let approvers: Approvers | undefined;
    if (this.busyServiceElemental.overlayRefs.length === 0) {
      this.busyServiceElemental.show();
    }

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
      this.busyServiceElemental.hide();
    }

    if (attestationCaseWithPolicy) {
      this.sideSheet.open(AttestationHistoryDetailsComponent, {
        title: await this.translator.get('#LDS#Heading View Attestation Case Details').toPromise(),
        subTitle: attestationCaseWithPolicy.GetEntity().GetDisplay(),
        padding: '0',
        width: calculateSidesheetWidth(),
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
      width: calculateSidesheetWidth(800, 0.5),
      disableClose: false,
      testId: 'attestation-history-details-assignment-analysis',
      data,
    });
  }
}
