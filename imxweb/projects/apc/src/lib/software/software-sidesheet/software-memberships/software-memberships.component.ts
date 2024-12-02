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

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalResourcesApplicationsMembership } from '@imx-modules/imx-api-apc';
import {
  CollectionLoadParameters,
  DbObjectKey,
  DisplayColumns,
  EntitySchema,
  IClientProperty,
  TypedEntity,
  TypedEntityCollectionData,
  ValType,
  XOrigin,
} from '@imx-modules/imx-qbm-dbts';
import { BusyService, calculateSidesheetWidth, ConfirmationService, DataViewInitParameters, DataViewSource, SnackBarService } from 'qbm';
import { SourceDetectiveSidesheetComponent, SourceDetectiveSidesheetData, SourceDetectiveType } from 'qer';
import { SoftwareService } from '../../software.service';

@Component({
  selector: 'imx-software-memberships',
  templateUrl: './software-memberships.component.html',
  styleUrls: ['./software-memberships.component.scss'],
  providers: [DataViewSource],
})
export class SoftwareMembershipsComponent implements OnChanges {
  public DisplayColumns = DisplayColumns;
  public entitySchema: EntitySchema;
  public selections: PortalResourcesApplicationsMembership[] = [];

  public showUnsubscribeWarning = false;

  public readonly status = {
    enabled: (item: PortalResourcesApplicationsMembership): boolean => {
      return item.XOrigin.value === XOrigin.Direct || (item.UID_PersonWantsOrg?.value ?? '') !== '';
    },
  };

  private displayColumns: IClientProperty[];
  public busyService = new BusyService();

  @Input() public uidSoftware: string;

  public membershipHint =
    '#LDS#Here you can specify which identities have access to the software application. You can remove memberships and view the assignment analysis for each membership.';
  public LdsNotUnsubscribableHint =
    '#LDS#There is at least one membership you cannot unsubscribe. You can only unsubscribe memberships you have requested.';

  public get canDeleteSelected(): boolean {
    return this.selections.length > 0 && this.selections.every((item) => item.XOrigin.value === XOrigin.Direct);
  }

  public get canUnsubscribeSelected(): boolean {
    return this.selections.length > 0 && this.selections.every((item) => (item.UID_PersonWantsOrg?.value ?? '') !== '');
  }

  constructor(
    private readonly softwareService: SoftwareService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly confirmationService: ConfirmationService,
    private readonly snackBarService: SnackBarService,
    public dataSource: DataViewSource,
  ) {
    this.entitySchema = this.softwareService.membershipSchema;
    this.displayColumns = [
      this.entitySchema.Columns.UID_Person,
      this.entitySchema.Columns?.XOrigin,
      this.entitySchema.Columns.XDateInserted,
      this.entitySchema.Columns.ValidUntil,
      { ColumnName: 'badges', Type: ValType.String },
    ];
  }

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.uidSoftware && changes.uidSoftware.currentValue) {
      return this.getData();
    }
  }

  public onSelectionChanged(selection: readonly TypedEntity[]): void {
    this.selections = selection as PortalResourcesApplicationsMembership[];
  }

  public async showDetails(item: TypedEntity): Promise<void> {
    const uidPerson = item.GetEntity().GetColumn('UID_Person').GetValue();

    const objectKey = DbObjectKey.FromXml(item.GetEntity().GetColumn('XObjectKey').GetValue());

    const data: SourceDetectiveSidesheetData = {
      UID_Person: uidPerson,
      Type: SourceDetectiveType.MembershipOfSystemEntitlement,
      UID: objectKey.Keys.join(','),
      TableName: objectKey.TableName,
    };
    this.sideSheet.open(SourceDetectiveSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading View Assignment Analysis').toPromise(),
      subTitle: item.GetEntity().GetDisplay(),
      padding: '0px',
      width: calculateSidesheetWidth(),
      disableClose: false,
      testId: 'software-memberships-assingment-analysis',
      data,
    });
  }

  public async getData(): Promise<void> {
    this.dataSource.itemStatus = this.status;
    const dataViewInitParameters: DataViewInitParameters<TypedEntity> = {
      execute: (params: CollectionLoadParameters): Promise<TypedEntityCollectionData<TypedEntity>> =>
        this.softwareService.getMemberShips(this.uidSoftware, params),
      schema: this.entitySchema,
      columnsToDisplay: this.displayColumns,
      highlightEntity: (entity: TypedEntity) => {
        this.showDetails(entity);
      },
      selectionChange: (selection) => this.onSelectionChanged(selection),
    };
    this.dataSource.init(dataViewInitParameters);
  }

  public async deleteSelected(): Promise<void> {
    if (
      await this.confirmationService.confirm({
        Title: '#LDS#Heading Remove Memberships',
        Message:
          '#LDS#The removal of memberships may take some time. The displayed data may differ from the actual state. Are you sure you want to remove the selected memberships?',
        identifier: 'group-members-confirm-delete-memberships',
      })
    ) {
      const isBusy = this.busyService.beginBusy();
      try {
        await this.softwareService.deleteGroupMembers(
          this.uidSoftware,
          this.selections.map((i) => i.GetEntity().GetColumn('UID_Person').GetValue()),
        );
        this.dataSource.selection.clear();
        this.snackBarService.open({ key: '#LDS#The memberships have been successfully removed.' }, '#LDS#Close');
        await this.dataSource.updateState();
      } finally {
        isBusy.endBusy();
      }
    }
  }

  public onWarningDismissed(): void {
    this.showUnsubscribeWarning = false;
  }

  public async unsubscribeMembership(): Promise<void> {
    // if there is at least 1 item, that is not unsubscribable, show a warning instead
    const notSubscribable = this.selections.some((entity) => entity.GetEntity().GetColumn('IsRequestCancellable').GetValue() === false);
    if (notSubscribable) {
      this.showUnsubscribeWarning = true;
      this.dataSource.selection.clear();
      return;
    }
    if (
      await this.confirmationService.confirm({
        Title: '#LDS#Heading Unsubscribe Memberships',
        Message: '#LDS#Are you sure you want to unsubscribe the selected memberships?',
        identifier: 'group-members-confirm-unsubscribe-membership',
      })
    ) {
      const isBusy = this.busyService.beginBusy();
      try {
        await Promise.all(this.selections.map((entity) => this.softwareService.unsubscribeMembership(entity)));
        this.snackBarService.open({
          key: '#LDS#The memberships have been successfully unsubscribed. It may take some time for the changes to take effect. The displayed data may differ from the actual state.',
        });
      } finally {
        isBusy.endBusy();
        this.dataSource.selection.clear();
        await this.dataSource.updateState();
      }
    }
  }
}
