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
import { EUI_SIDESHEET_DATA, EuiLoadingService, EuiSidesheetRef } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalAttestationFilterMatchingobjects } from '@imx-modules/imx-api-att';
import { CollectionLoadParameters, DisplayColumns, EntitySchema, TypedEntityCollectionData, ValType } from '@imx-modules/imx-qbm-dbts';
import {
  ClassloggerService,
  ClientPropertyForTableColumns,
  ConfirmationService,
  DataViewInitParameters,
  DataViewSource,
  LdsReplacePipe,
  SnackBarService,
} from 'qbm';
import { PolicyService } from '../policy.service';
import { AttestationCasesComponentParameter } from './attestation-cases-component-parameter.interface';

@Component({
  templateUrl: './attestation-cases.component.html',
  styleUrls: ['./attestation-cases.component.scss'],
  providers: [DataViewSource],
})
export class AttestationCasesComponent implements OnInit {
  public readonly entitySchemaPolicy: EntitySchema;
  public DisplayColumns = DisplayColumns;
  public isAdmin: boolean;
  public deactivatedChecked = false;

  public selectedItems: (PortalAttestationFilterMatchingobjects | undefined)[] = [];
  public entitySchema = PortalAttestationFilterMatchingobjects.GetEntitySchema();

  private displayedColumns: ClientPropertyForTableColumns[];
  private threshold = -1;
  public hierarchical: boolean;
  public isLoading = false;

  constructor(
    public readonly sidesheetRef: EuiSidesheetRef,
    @Inject(EUI_SIDESHEET_DATA) public readonly data: AttestationCasesComponentParameter,
    private readonly policyService: PolicyService,
    private readonly busyServiceEui: EuiLoadingService,
    private readonly snackbar: SnackBarService,
    private readonly confirmationService: ConfirmationService,
    private readonly translate: TranslateService,
    private readonly ldsReplace: LdsReplacePipe,
    private readonly logger: ClassloggerService,
    public dataSource: DataViewSource<PortalAttestationFilterMatchingobjects>,
  ) {
    this.entitySchemaPolicy = policyService.AttestationMatchingObjectsSchema;
    this.displayedColumns = [this.entitySchemaPolicy.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]];

    if (data.canCreateRuns) {
      this.displayedColumns.push({
        ColumnName: 'runMethod',
        Type: ValType.String,
        untranslatedDisplay: '#LDS#Actions',
      });
    }
  }

  public get showWarning() {
    return this.threshold > 0 && this.threshold < (this.dataSource.collectionData().totalCount ?? 0);
  }

  public async ngOnInit(): Promise<void> {
    this.showBusyIndicator();
    try {
      this.threshold = await this.policyService.getCasesThreshold();
    } finally {
      this.busyServiceEui.hide();
    }

    return this.navigate();
  }

  public get hasSampleData(): boolean {
    return this.data.uidPickCategory != null && this.data.uidPickCategory !== '';
  }

  public onSelectionChanged(items: PortalAttestationFilterMatchingobjects[]): void {
    this.selectedItems = items;
  }

  public async createRun(data: (PortalAttestationFilterMatchingobjects | undefined)[]): Promise<void> {
    const count = data.length > 0 ? data.length : this.dataSource.collectionData().totalCount || 0;

    if (count <= this.threshold || (await this.confirmCreation())) {
      this.showBusyIndicator();

      try {
        await this.policyService.createAttestationRun(
          this.data.uidpolicy || '',
          data.map((elem) => elem?.Key.value ?? ''),
        );

        this.logger.trace(
          this,
          'attestation run created for',
          this.data.uidpolicy,
          data.map((elem) => elem?.Key.value ?? ''),
        );

        this.snackbar.open(
          {
            key: '#LDS#The attestation has been started successfully. It may take some time until the associated attestation cases are created.',
          },
          '#LDS#Close',
        );
      } finally {
        this.busyServiceEui.hide();
        this.sidesheetRef.close(true);
      }
    }
  }

  private async navigate(): Promise<void> {
    const dataViewInitParameters: DataViewInitParameters<PortalAttestationFilterMatchingobjects> = {
      execute: (params: CollectionLoadParameters): Promise<TypedEntityCollectionData<PortalAttestationFilterMatchingobjects>> =>
        this.policyService.getObjectsForFilter(
          this.data.uidobject,
          this.data.uidPickCategory,
          { Elements: this.data.filter, ConcatenationType: this.data.concat },
          params,
        ),
      schema: this.entitySchemaPolicy,
      columnsToDisplay: this.displayedColumns,
      selectionChange: (selection: PortalAttestationFilterMatchingobjects[]) => this.onSelectionChanged(selection),
      localSource: true,
    };
    this.dataSource.init(dataViewInitParameters);
  }

  private async confirmCreation(): Promise<boolean> {
    const message = this.ldsReplace.transform(
      await this.translate
        .get(
          '#LDS#You have selected more than {0} objects. Attestation of the selected objects may take some time and generate notifications to many approvers. Are you sure you want to start the attestation for the selected objects?',
        )
        .toPromise(),
      this.threshold,
    );
    return this.confirmationService.confirm({
      Title: await this.translate.get('#LDS#Heading Many Objects Affected').toPromise(),
      Message: message,
    });
  }

  private showBusyIndicator(): void {
    if (this.busyServiceEui.overlayRefs.length === 0) {
      this.busyServiceEui.show();
    }
  }
}
