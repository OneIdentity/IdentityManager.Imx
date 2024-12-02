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

import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, UntypedFormArray } from '@angular/forms';
import { MatTab, MatTabChangeEvent } from '@angular/material/tabs';
import { EUI_SIDESHEET_DATA, EuiLoadingService, EuiSidesheetRef, EuiSidesheetService } from '@elemental-ui/core';
import { DbObjectKey, ValType } from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import {
  BaseCdr,
  BusyService,
  CdrFactoryService,
  ColumnDependentReference,
  ConfirmationService,
  EntityService,
  ExtService,
  SnackBarService,
  SystemInfoService,
  TabItem,
  calculateSidesheetWidth,
} from 'qbm';
import { RiskAnalysisSidesheetComponent, WorkflowActionComponent } from 'qer';
import { Subscription } from 'rxjs';
import { DugOverviewService } from '../dug-overview/dug-overview.service';
import { ChangeRequestType, DgeConfigData, PortalDgeResourcesActivity, PortalDgeResourcesbyid } from '../TypedClient';

interface DugResourceFormGroup {
  array: UntypedFormArray;
}

@Component({
  selector: 'imx-dug-sidesheet',
  styleUrls: ['./dug-sidesheet.component.scss'],
  templateUrl: './dug-sidesheet.component.html',
})
export class DugSidesheetComponent implements OnInit, OnDestroy {
  public dug: PortalDgeResourcesbyid;
  public config: DgeConfigData;
  public busyService = new BusyService();
  public subscriptions: Subscription[] = [];

  public supportsActivity: boolean;
  public isShare: boolean;
  public canAnalyzeRisk: boolean;
  public isRpsEnabled: boolean;
  public isAttEnabled: boolean;
  public activity: PortalDgeResourcesActivity[] = [];
  public ChangeRequestType = ChangeRequestType;
  public showChangePropertyButton: boolean = false;
  public hideActionBar: boolean = false;

  public dugResourceFormGroup = new FormGroup<DugResourceFormGroup>({ array: new UntypedFormArray([]) });
  public dugResourceConditionsFormGroup = new FormGroup<DugResourceFormGroup>({ array: new UntypedFormArray([]) });
  public cdrList: (ColumnDependentReference | undefined)[] = [];
  public isLoading = true;
  public dynamicTabs: TabItem[] = [];
  public readonly parameters: { objecttable: string; objectuid: string };

  public get saveDisabled(): boolean {
    return (
      (!this.dugResourceFormGroup.dirty && !this.dugResourceConditionsFormGroup.dirty) ||
      this.dugResourceFormGroup.invalid ||
      this.dugResourceConditionsFormGroup.invalid
    );
  }

  public cdrListOrderConditions: (ColumnDependentReference | undefined)[] = [];
  public orderRestrictionHint =
    '#LDS#You can specify who can order access to this resource. If nothing is assigned, the resource can be ordered by all employees.';

  @ViewChild('accessTab') private accessTab: MatTab;

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly data: { uid: string },
    private readonly dugOverviewProvider: DugOverviewService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly loadingService: EuiLoadingService,
    private readonly systemInfoService: SystemInfoService,
    private readonly translate: TranslateService,
    private readonly cdrFactory: CdrFactoryService,
    private readonly extService: ExtService,
    private readonly entityService: EntityService,
    private readonly snackbar: SnackBarService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly changeDetector: ChangeDetectorRef, // private readonly sidesheetRef: EuiSidesheetRef, //ToDO: DGE add apply, if Main Data changed
    confirm: ConfirmationService,
  ) {
    this.parameters = {
      objecttable: dugOverviewProvider.DugResourceSchema.TypeName ?? '',
      objectuid: data.uid,
    };

    this.subscriptions.push(
      this.busyService.busyStateChanged.subscribe((state: boolean) => {
        this.isLoading = state;
        this.changeDetector.detectChanges();
      }),
    );
    this.subscriptions.push(
      sidesheetRef.closeClicked().subscribe(async () => {
        if (!this.saveDisabled && !(await confirm.confirmLeaveWithUnsavedChanges())) {
          return;
        }

        sidesheetRef.close(false);
      }),
    );
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      const info = await this.systemInfoService.get();
      this.canAnalyzeRisk = info.PreProps?.includes('RISKINDEX') ?? false;
      this.isRpsEnabled = info.PreProps?.includes('REPORT_SUBSCRIPTION') ?? false;
      this.isAttEnabled = info.PreProps?.includes('ATTESTATION') ?? false;

      this.config = await this.dugOverviewProvider.getDgeConfig();
      this.dug = await this.dugOverviewProvider.getDugResourceById(this.data.uid);
      this.supportsActivity = this.dug.UID_QAMResourceType.value != 'QAM-A2EB93DC78054195837671623098181F';
      this.isShare = this.dug.UID_QAMResourceType.value == 'QAM-52F4B02EFBCAEB7A2EE35B8A4636FAEA';

      this.cdrList = this.cdrFactory
        .buildCdrFromColumnList(this.dug.GetEntity(), [
          'UID_QAMDuG',
          'UID_QAMNode',
          'UID_QAMResourceType',
          'UID_PersonResponsible',
          'UID_AERoleOwner',
          'IsSecurityInformationIndexed',
          'UID_BackingFolder',
          'UID_QAMDuGParent',
          'DisplayName',
          'FullPath',
          'DisplayPath',
          'RiskIndexCalculated',
          'RequiresOwnership',
          'UID_QAMClassificationLevelMan',
          'IsSecurityInheritanceBlocked',
        ])
        .filter((elem) => elem);

      this.cdrListOrderConditions = this.cdrFactory
        .buildCdrFromColumnList(this.dug.GetEntity(), ['InProfitCenter', 'InDepartment', 'InAERole', 'InLocality', 'InOrg'])
        .filter((elem) => elem);

      if (this.supportsActivity) {
        this.activity = (await this.dugOverviewProvider.getAllResourceActivities(this.data.uid)).Data;
      } else {
        this.activity = [];
      }

      this.dynamicTabs = (
        await this.extService.getFittingComponents<TabItem>('dugSidesheet', (ext) => ext.inputData.checkVisibility(this.parameters))
      ).sort((tab1: TabItem, tab2: TabItem) => (tab1.sortOrder ?? 0) - (tab2.sortOrder ?? 0));
    } finally {
      isBusy.endBusy();
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions?.forEach((elem) => elem?.unsubscribe());
  }

  public async save(): Promise<void> {
    const overlay = this.loadingService.show();
    try {
      await this.dug.GetEntity().Commit();
      this.snackbar.open({ key: '#LDS#The resource has been saved' });
      this.sidesheetRef.close(true);
    } finally {
      this.loadingService.hide(overlay);
    }
  }

  public async analyzeRisk(): Promise<void> {
    this.sideSheet.open(RiskAnalysisSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading Analyze Risk').toPromise(),
      padding: '0px',
      width: calculateSidesheetWidth(600, 0.4),
      data: { objectKey: new DbObjectKey('QAMDuG', this.data.uid).ToXmlString() },
    });
  }

  public updateCurrentTab(event: MatTabChangeEvent): void {
    this.hideActionBar = this.dynamicTabs.some((elem) => this.translate.instant(elem.inputData.label) === event.tab.textLabel);
    this.showChangePropertyButton = event.tab === this.accessTab;
  }

  public async makeRequest(type: ChangeRequestType): Promise<void> {
    const actionParameters = {
      reason: this.createCdrReason(undefined, 2),
    };
    const result = await this.sideSheet
      .open(WorkflowActionComponent, {
        title: this.translate.instant(
          type === ChangeRequestType.Change ? '#LDS#Heading Request Property Change' : '#LDS#Heading Reject Ownership',
        ),
        subTitle: this.dug.DisplayName.value,
        padding: '0',
        width: calculateSidesheetWidth(),
        testId: 'dug-sidesheet-' + (type === ChangeRequestType.Change ? 'change' : 'reject-ownership'),
        data: {
          requests: [this.dug],
          actionParameters,
        },
      })
      .afterClosed()
      .toPromise();

    if (result) {
      await this.dugOverviewProvider.makeRequest(this.data.uid, type, actionParameters.reason.column.GetValue());
      this.snackbar.open({
        key:
          type === ChangeRequestType.Change
            ? '#LDS#The change of a property has been requested'
            : '#LDS#A rejection of the ownership has been requested',
      });
    }
  }

  private createCdrReason(display?: string, reasonType: number = 0): BaseCdr {
    const column = this.entityService.createLocalEntityColumn({
      ColumnName: 'ReasonHead',
      Type: ValType.Text,
      IsMultiLine: true,
      MinLen: reasonType === 2 ? 1 : 0,
    });

    return new BaseCdr(column, display || '#LDS#Reason for your decision');
  }
}
