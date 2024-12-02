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

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EUI_SIDESHEET_DATA, EuiSidesheetRef, EuiSidesheetService } from '@elemental-ui/core';
import { PortalRespTeamResponsibilities, ResponsibilityData } from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  EntitySchema,
  ExtendedTypedEntityCollection,
  TypedEntity,
  TypedEntityBuilder,
  TypedEntityCollectionData,
  ValType,
} from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import { calculateSidesheetWidth, DataViewInitParameters, DataViewSource } from 'qbm';
import { TeamResponsibilitiesService } from '../team-responsibilities.service';
import { TeamResponsibilityAssignSidesheetComponent } from '../team-responsibility-assign-sidesheet/team-responsibility-assign-sidesheet.component';
import { TeamResponsibilityDialogComponent } from '../team-responsibility-dialog/team-responsibility-dialog.component';
class OtherIdentitiesTypedEntity extends TypedEntity {
  public static GetEntitySchema(): EntitySchema {
    return {
      Columns: {
        Display: { ColumnName: 'Display', Type: ValType.String },
        ExitDate: { ColumnName: 'ExitDate', Type: ValType.String },
        IsInactive: { ColumnName: 'IsInactive', Type: ValType.Bool },
      },
    };
  }
}
@Component({
  selector: 'imx-team-responsibility-sidesheet',
  templateUrl: './team-responsibility-sidesheet.component.html',
  styleUrl: './team-responsibility-sidesheet.component.scss',
  providers: [DataViewSource],
})
export class TeamResponsibilitySidesheetComponent implements OnInit {
  private readonly builder = new TypedEntityBuilder(OtherIdentitiesTypedEntity);
  public otherIdentities: TypedEntityCollectionData<OtherIdentitiesTypedEntity>;
  private needReload = false;
  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public data: { extendedData: ResponsibilityData | undefined; responsibility: PortalRespTeamResponsibilities },
    private readonly sidesheetService: EuiSidesheetService,
    private readonly dialogService: MatDialog,
    private readonly teamResponsibilitiesService: TeamResponsibilitiesService,
    private readonly translateService: TranslateService,
    public dataSource: DataViewSource<OtherIdentitiesTypedEntity>,
    private sidesheetRef: EuiSidesheetRef,
  ) {
    this.otherIdentities = this.builder.buildReadWriteEntities(
      {
        Entities:
          this.data.extendedData?.OtherIdentities?.map((identity) => ({
            Columns: {
              Display: { Value: identity.Display },
              ExitDate: { Value: identity.ExitDate },
              IsInactive: { Value: identity.IsInactive },
            },
          })) || [],
        TotalCount: this.data.extendedData?.OtherIdentities?.length || 0,
      },
      OtherIdentitiesTypedEntity.GetEntitySchema(),
    );

    this.sidesheetRef.closeClicked().subscribe(async () => {
      this.sidesheetRef.close(this.needReload);
    });
  }

  ngOnInit(): void {
    const dataViewInitParameters: DataViewInitParameters<OtherIdentitiesTypedEntity> = {
      execute: (
        params: CollectionLoadParameters,
        signal: AbortSignal,
      ): Promise<ExtendedTypedEntityCollection<OtherIdentitiesTypedEntity, undefined>> =>
        Promise.resolve({
          ...this.otherIdentities,
          Data: this.otherIdentities.Data.filter((identity) => {
            const display = identity.GetEntity().GetColumn('Display').GetDisplayValue();
            return (
              display.toLowerCase().includes(params.search?.toLowerCase() || '') &&
              (!!params.filter?.length
                ? params.filter.every((filter) => display.toLowerCase().includes(filter.Value1.toLowerCase()))
                : true)
            );
          }),
        }),
      schema: OtherIdentitiesTypedEntity.GetEntitySchema(),
      columnsToDisplay: [{ ColumnName: 'Display', Type: ValType.String }],
      localSource: true,
    };
    this.dataSource.init(dataViewInitParameters);
  }

  closeSidesheet(): void {
    this.sidesheetService.close();
  }

  public onReassignResponsibilities(): void {
    this.sidesheetService
      .open(TeamResponsibilityAssignSidesheetComponent, {
        title: this.translateService.instant('#LDS#Heading Reassign Responsibility'),
        subTitle: this.data.responsibility.GetEntity().GetDisplay(),
        icon: 'forward',
        padding: '0',
        width: calculateSidesheetWidth(600, 0.4),
        testId: 'team-responsibilities-assign-sidesheet',
        data: {
          responsibility: [this.data.responsibility],
          reassign: true,
          extendedData: [this.data.extendedData],
        },
      })
      .afterClosed()
      .subscribe((action) => {
        if (action) {
          this.needReload = true;
          this.sidesheetService.close(this.needReload);
        }
      });
  }

  public onAssignResponsibilities(): void {
    this.sidesheetService
      .open(TeamResponsibilityAssignSidesheetComponent, {
        title: this.translateService.instant(
          !this.isDirectResponsibility() ? '#LDS#Heading Assign Additional Identities' : '#LDS#Heading Assign Additional Identity',
        ),
        subTitle: this.data.responsibility.GetEntity().GetDisplay(),
        icon: 'useradd',
        padding: '0',
        width: calculateSidesheetWidth(600, 0.4),
        testId: 'team-responsibilities-assign-sidesheet',
        data: {
          responsibility: [this.data.responsibility],
          reassign: false,
          extendedData: [this.data.extendedData],
        },
      })
      .afterClosed()
      .subscribe((action) => {
        if (action) {
          this.needReload = true;
          this.sidesheetService.close(this.needReload);
        }
      });
  }

  public isActionNeeded(): boolean {
    return !!this.data?.responsibility.ExitDate.value || this.data?.responsibility.PersonIsInactive.value;
  }

  public async onDeleteResponsibility(): Promise<void> {
    this.dialogService
      .open(TeamResponsibilityDialogComponent, { data: [this.data.responsibility] })
      .afterClosed()
      .subscribe(async (result) => {
        if (result) {
          this.needReload = true;
          await this.teamResponsibilitiesService.removeResponsibilities([this.data.responsibility]);
          this.sidesheetService.close(this.needReload);
        }
      });
  }

  public isDirectResponsibility(): boolean {
    return !!this.data.responsibility.UID_SourceColumn.value;
  }

  public actionNeeded(entity: OtherIdentitiesTypedEntity): boolean {
    return entity.GetEntity().GetColumn('ExitDate').GetValue() || entity.GetEntity().GetColumn('IsInactive').GetValue();
  }
}
