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

import { Component, Inject, Input, OnInit } from '@angular/core';
import { EUI_SIDESHEET_DATA, EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { ComplianceViolation, ContributingEntitlement, PortalRules } from '@imx-modules/imx-api-cpl';
import { ICartItemCheck } from '@imx-modules/imx-api-qer';
import { DbObjectKey, EntityData, EntitySchema, IEntityColumn, ValType } from '@imx-modules/imx-qbm-dbts';
import { BaseReadonlyCdr, calculateSidesheetWidth, ColumnDependentReference, EntityService, MetadataService, SystemInfoService } from 'qbm';
import { RequestParameterDataEntity } from 'qer';
import { ItemValidatorService } from '../../item-validator/item-validator.service';
import { ApplicableRule, RuleCdrs } from '../compliance-violation-model';
import { ComplianceViolationService } from './compliance-violation.service';
import { EditMitigatingControlsComponent } from './edit-mitigating-controls/edit-mitigating-controls.component';

@Component({
  selector: 'imx-compliance-violation-details',
  templateUrl: './compliance-violation-details.component.html',
  styleUrls: ['./compliance-violation-details.component.scss'],
})
export class ComplianceViolationDetailsComponent implements OnInit {
  @Input() public pwoId: string;
  @Input() public request: RequestParameterDataEntity;
  @Input() public isApproval: boolean = false;
  public mitigatingControlsPerViolation: boolean;

  public cdrRuleDisplay: ColumnDependentReference | undefined;

  public rules: ApplicableRule[] = [];
  public schema: EntitySchema;

  private hasRiskIndex: boolean;

  constructor(
    private readonly validator: ItemValidatorService,
    private complianceApi: ComplianceViolationService,
    private readonly loadingService: EuiLoadingService,
    private readonly metaData: MetadataService,
    private readonly entityService: EntityService,
    private readonly sidesheets: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly systemInfoService: SystemInfoService,
    @Inject(EUI_SIDESHEET_DATA) public data?: ICartItemCheck | any,
  ) {}

  public async ngOnInit(): Promise<void> {
    const ref = this.loadingService.show();

    try {
      this.schema = this.validator.getRulesSchema();
      this.isICartItemCheck(this.data) ? await this.loadCartItemViolations(this.data) : await this.loadRequestViolations(this.pwoId);
      this.hasRiskIndex = !!(await this.systemInfoService.get()).PreProps?.includes('RISKINDEX');
      this.checkHistoryForViolations();

      this.mitigatingControlsPerViolation = await this.complianceApi.getMitigatingControlsPerViolation();
    } finally {
      this.loadingService.hide(ref);
    }
  }

  /**
   * Check for org type violations, we disable the mitigation control settings for them
   * @param item
   * @returns if we can access the EditMitigatingControlsComponent
   */
  public canEditMitigationControls(item: ApplicableRule): boolean {
    return item.violationDetail.ViolationType ? !['Org'].includes(item.violationDetail.ViolationType) : !!item.violationDetail.UidPerson;
  }

  public async addMitigationControls(item: ApplicableRule): Promise<void> {
    this.sidesheets
      .open(EditMitigatingControlsComponent, {
        title: await this.translate.get('#LDS#Heading Mitigating Controls').toPromise(),
        subTitle: item.violationDetail.DisplayRule,
        padding: '0px',
        disableClose: true,
        width: calculateSidesheetWidth(1000),
        testId: 'compliance-violation-details-mitigating-sidesheet',
        data: {
          uidPerson: item.violationDetail.UidPerson,
          uidNonCompliance: item.violationDetail.UidNonCompliance,
          uidPersonWantsOrg: item.violationDetail.UidPersonWantsOrg,
          readOnly: !this.isApproval,
          isMControlPerViolation: this.mitigatingControlsPerViolation,
        },
      })
      .afterClosed()
      .toPromise();
  }

  private getDisplayForSource(item: ContributingEntitlement): string {
    return this.metaData.tables[DbObjectKey.FromXml(item.ObjectKeyEntitlement || '').TableName]?.DisplaySingular ?? '';
  }

  private async loadTableNamesForSources(violations: ComplianceViolation[]): Promise<void> {
    const sourecedRules = violations.filter((elem) => !!elem.Sources?.length);

    if (sourecedRules.length > 0) {
      for (const source of sourecedRules) {
        await this.metaData.updateNonExisting(
          source.Sources?.map((item) => DbObjectKey.FromXml(item.ObjectKeyEntitlement || '').TableName) || [],
        );
      }
    }
  }

  private async loadCartItemViolations(cartItemCheck: ICartItemCheck): Promise<void> {
    let rules = (await this.validator.getRules()).Data;
    await this.loadTableNamesForSources(cartItemCheck.Detail.Violations);

    this.rules = [];

    if (cartItemCheck.Detail.Violations.length === 1) {
      this.cdrRuleDisplay = this.getDisplayRuleCdr(undefined, cartItemCheck.Detail.Violations[0]);
    }

    cartItemCheck.Detail.Violations.forEach(async (item: ComplianceViolation) => {
      const rule = rules.find((x) => x.GetEntity().GetKeys()[0] === item.UidComplianceRule);
      this.rules.push({
        rule,
        violationDetail: item,
        cdrLists: await this.buildCdrForViolations(rule, item),
      });
    });
  }

  private async loadRequestViolations(id: string): Promise<void> {
    const violations = await this.complianceApi.getRequestViolations(id);
    await this.loadTableNamesForSources(violations);
    this.rules = [];

    if (violations.length === 1) {
      this.cdrRuleDisplay = this.getDisplayRuleCdr(undefined, violations[0]);
    }

    violations.forEach(async (violation: ComplianceViolation) => {
      this.rules.push({
        violationDetail: violation,
        cdrLists: await this.buildCdrForViolations(undefined, violation),
      });
    });
  }

  private getDisplayRuleCdr(rule: PortalRules | undefined, detail: ComplianceViolation): ColumnDependentReference {
    const column = rule
      ? rule.GetEntity().GetColumn('DisplayRule')
      : this.buildColumn('DisplayRule', this.translate.instant('#LDS#Violated compliance rule'), detail.DisplayRule);

    return new BaseReadonlyCdr(column);
  }

  private async buildCdrForViolations(rule: PortalRules | undefined, detail: ComplianceViolation): Promise<RuleCdrs> {
    const tableName = DbObjectKey.FromXml(detail.ObjectKeyElement || '').TableName;
    await this.metaData.updateNonExisting([tableName]);
    const displayTitle = this.metaData.tables[tableName]?.DisplaySingular || '';

    //Build common elments
    const cdrColumns = [
      this.buildColumn('DisplayElement', displayTitle, detail.DisplayElement),
      rule
        ? rule.GetEntity().GetColumn('Description')
        : this.buildColumn('Description', this.schema.Columns['Description'].Display || '', detail.Description),
      this.buildColumn('DisplayPerson', await this.translate.get('#LDS#Identity').toPromise(), detail.DisplayPerson),
      rule
        ? rule.GetEntity().GetColumn('RuleNumber')
        : this.buildColumn('RuleNumber', this.schema.Columns['RuleNumber'].Display || '', detail.RuleNumber),
    ];

    if (this.hasRiskIndex) {
      cdrColumns.push(
        rule
          ? rule.GetEntity().GetColumn('RiskIndex')
          : this.buildColumn('RiskIndex', this.schema.Columns['RiskIndex'].Display || '', detail.RiskIndex, ValType.Double),
      );

      if (
        rule != null &&
        rule.GetEntity().GetColumn('RiskIndex').GetValue() !== rule.GetEntity().GetColumn('RiskIndexReduced').GetValue()
      ) {
        cdrColumns.push(rule.GetEntity().GetColumn('RiskIndexReduced'));
      } else {
        if (detail.RiskIndex !== detail.RiskIndexReduced) {
          cdrColumns.push(
            this.buildColumn(
              'RiskIndexReduced',
              this.schema.Columns['RiskIndexReduced'].Display || '',
              detail.RiskIndexReduced,
              ValType.Double,
            ),
          );
        }
      }
    }

    let sources: ColumnDependentReference[] | undefined;
    if (!!detail.Sources?.length) {
      sources = detail.Sources?.map(
        (source, index) => new BaseReadonlyCdr(this.buildColumn(`source ${index}`, this.getDisplayForSource(source), source.Display)),
      );
    }

    return { common: cdrColumns.map((column) => new BaseReadonlyCdr(column)), sources };
  }

  private buildColumn(columnName: string, display: string, value: any, type: ValType = ValType.String): IEntityColumn {
    return this.entityService.createLocalEntityColumn(
      {
        ColumnName: columnName,
        Type: type,
        Display: display,
      },
      undefined,
      { Value: value },
    );
  }

  private checkHistoryForViolations(): void {
    if (this.request?.pwoData && this.request.pwoData.WorkflowHistory && this.request.pwoData.WorkflowHistory.Entities) {
      this.request.pwoData.WorkflowHistory.Entities.forEach((wh: EntityData) => {
        const uid = wh.Columns && wh.Columns['UID_ComplianceRule'] ? wh.Columns['UID_ComplianceRule'].Value : '';
        if (uid.length > 0) {
          this.request.complianceRuleViolation = true;
        }
      });
    }
  }

  // ICartItemCheck type guard
  private isICartItemCheck(obj: any): obj is ICartItemCheck {
    return 'Id' in obj && 'Status' in obj && 'Title' in obj && 'ResultText' in obj && 'Detail' in obj;
  }
}
