import { OverlayRef } from '@angular/cdk/overlay';
import { Component, Input, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { PortalAttestationCase } from '@imx-modules/imx-api-att';
import {
  CollectionLoadParameters,
  CompareOperator,
  EntitySchema,
  FilterType,
  IClientProperty,
  TypedEntity,
  TypedEntityCollectionData,
} from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import { BusyService, DataSourceToolbarSettings, DataViewInitParameters, DataViewSource } from 'qbm';
import { AttestationHistoryCase } from '../../attestation-history/attestation-history-case';
import { AttestationHistoryDetailsComponent } from '../../attestation-history/attestation-history-details/attestation-history-details.component';
import { AttestationHistoryService } from '../../attestation-history/attestation-history.service';
import { Approvers } from '../approvers.interface';
import { AttestationCasesService } from '../attestation-cases.service';
import { AttestationCaseHistoryService } from './attestation-case-history.service';

@Component({
  selector: 'imx-attestation-case-history',
  templateUrl: './attestation-case-history.component.html',
  styleUrls: ['./attestation-case-history.component.scss', '../../attestation-history/attestation-history.component.scss'],
  standalone: false,
  providers: [DataViewSource],
})
export class AttestationCaseHistoryComponent implements OnInit {
  @Input() case: PortalAttestationCase;

  public dstSettings: DataSourceToolbarSettings;
  public busyService = new BusyService();
  public entitySchema: EntitySchema;
  public navigationState: CollectionLoadParameters = {};
  public displayedColumns: IClientProperty[];

  constructor(
    private readonly attestationCaseHistoryService: AttestationCaseHistoryService,
    private readonly busyServiceElemental: EuiLoadingService,
    private readonly historyService: AttestationHistoryService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translator: TranslateService,
    private readonly attestationCaseService: AttestationCasesService,
    public readonly dataSource: DataViewSource<PortalAttestationCase>,
  ) {
    this.entitySchema = PortalAttestationCase.GetEntitySchema();
    this.displayedColumns = [this.entitySchema.Columns.AttestationState, this.entitySchema.Columns.XDateInserted];
    this.dstSettings = {
      dataSource: { Data: [], totalCount: 0 },
      entitySchema: this.entitySchema,
      navigationState: this.navigationState,
      displayedColumns: this.displayedColumns,
    };
  }

  public async ngOnInit(): Promise<void> {
    await this.getData();
  }

  /**
   * Updates the navigation state and reloads the data.
   * @param navigationState reloads data based on the new navigation state
   */
  public async onNavigationStateChanged(navigationState: CollectionLoadParameters): Promise<void> {
    this.navigationState = navigationState;
    await this.getData();
  }

  /**
   * Searches attestation cases based on the provided keywords.
   * @param keywords The search keywords entered by the user
   */
  public async onSearch(keywords: string): Promise<void> {
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.getData();
  }

  /**
   * Shows the details of the selected attestation case in a side sheet
   * @param selectedItem The item, that was selected from the table
   */
  public async onHighlightedEntityChanged(selectedItem: TypedEntity): Promise<void> {
    const attestationCase: AttestationHistoryCase = selectedItem as AttestationHistoryCase;
    let attestationCaseWithPolicy: AttestationHistoryCase | undefined;
    let approvers: Approvers | undefined;

    let busyIndicator: OverlayRef;
    setTimeout(() => (busyIndicator = this.busyServiceElemental.show()));

    try {
      attestationCaseWithPolicy = (
        await this.historyService.getAttestations({
          ...{ StartIndex: 0, PageSize: 1 },
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
          showApprovalActions: false,
        },
      });
    }
  }

  private async getData(): Promise<void> {
    const dataViewInitParameters: DataViewInitParameters<PortalAttestationCase> = {
      execute: (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<PortalAttestationCase>> => {
        return this.attestationCaseHistoryService.getAttestationCasesForDecision({ ...this.navigationState, ...params }, this.case);
      },
      schema: this.entitySchema,
      columnsToDisplay: this.displayedColumns,
      highlightEntity: (attestationCase: PortalAttestationCase) => {
        this.onHighlightedEntityChanged(attestationCase);
      },
    };
    await this.dataSource.init(dataViewInitParameters);

  }
}
