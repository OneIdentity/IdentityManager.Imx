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

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { ValType } from '@imx-modules/imx-qbm-dbts';
import {
  BaseCdr,
  ColumnDependentReference,
  DataSourceToolbarFilter,
  DataSourceToolbarSelectedFilter,
  DataSourceToolbarSettings,
  EntityService,
  FilterFormState,
  FilterTypeIdentifier,
  FilterWizardService,
  FilterWizardSidesheetData,
} from 'qbm';
import { PersonService } from 'qer';

/**
 * Shows a dropdown with identities to filter the attestation history by an attestator.
 */
@Component({
  selector: 'imx-attestation-history-filter',
  templateUrl: './attestation-history-filter.component.html',
  styleUrls: ['./attestation-history-filter.component.scss'],
})
export class AttestationHistoryFilterComponent implements OnInit, OnDestroy {
  public identityCdr: ColumnDependentReference;

  private selectedUid: string | undefined;
  private dstFilterRef: DataSourceToolbarSelectedFilter;
  private filter: DataSourceToolbarFilter;

  private id: string | undefined;
  private settings: DataSourceToolbarSettings;
  private externalFilters: DataSourceToolbarSelectedFilter[] = [];

  private formState: FilterFormState;
  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly entityService: EntityService,
    private readonly filterService: FilterWizardService,
    private readonly translator: TranslateService,
    private readonly person: PersonService,
    @Inject(EUI_SIDESHEET_DATA) public data?: FilterWizardSidesheetData,
  ) {
    this.id = data?.id;
    this.settings = data?.settings ? Object.create(data.settings) : undefined;
    this.externalFilters = data?.externalFilters ?? [];
    this.formState = { canClearFilters: this.externalFilters.length > 0, dirty: false, filterIdentifier: FilterTypeIdentifier.Predefined };

    this.filter = {
      Name: 'uid_persondecision',
    };

    this.subscriptions.push(
      this.filterService.applyFiltersEvent.subscribe(() => {
        this.applyFilters();
      }),
    );

    this.subscriptions.push(
      this.filterService.clearFiltersEvent.subscribe(() => {
        this.clearFilters();
      }),
    );
  }

  public async ngOnInit(): Promise<void> {
    this.identityCdr = await this.createCdrPerson();
    this.filterService.formStatusChanged(this.formState);
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public updateSelectedEntity(): void {
    this.selectedUid = this.identityCdr.column.GetValue();

    this.formState.dirty = true;
    this.filterService.formStatusChanged(this.formState);
  }

  /**
   * @ignore Used internally.
   * Is called internally when the clear all filters menu option is clicked
   * Clears all selected filter values and updates and emits the new navigationState
   */
  private clearFilters(emit = true): void {
    this.selectedUid = undefined;
    this.identityCdr.column.PutValue(undefined);
    this.updateNavigateStateWithFilters(emit);
  }

  private applyFilters(): void {
    this.updateNavigateStateWithFilters();
  }

  /**
   * @ignore Used internally
   * Loops over the filters and adds any selected filters to the navigation state
   * as query parameters, and emits a navigationStateChanged event to let calling code know of the change
   *
   * If the datasource is local, will apply the filters here and emit a settingsChanged signal instead of a navigationStateChanged
   */
  private updateNavigateStateWithFilters(emit = true): void {
    if (this.filter.Name) {
      delete this.settings.navigationState[this.filter.Name];
      this.externalFilters.forEach((externalFilter, index) => {
        // remove the previous filter
        if (externalFilter.filter?.Name === this.filter.Name) this.externalFilters.splice(index, 1);
      });
    }

    if (this.selectedUid) {
      this.settings.navigationState[this.filter.Name || 'uid_persondecision'] = this.selectedUid;
      this.dstFilterRef = {
        selectedOption: { Value: this.selectedUid, Display: this.identityCdr.column.GetDisplayValue() },
        filter: this.filter,
        isCustom: true,
      };
      this.externalFilters.push(this.dstFilterRef);
    }

    this.settings.navigationState.StartIndex = 0;

    if (!emit) {
      return;
    }
    if (this.id) {
      this.filterService.updateNavigation(this.id, this.settings.navigationState, this.data?.selectedFilters ?? [], this.externalFilters);
    }
  }

  private createCdrPerson(): BaseCdr {
    const fkRelation = {
      ChildColumnName: 'UID_PersonRelated',
      ParentTableName: 'Person',
      ParentColumnName: 'UID_Person',
      IsMemberRelation: false,
    };

    const column = this.entityService.createLocalEntityColumn(
      {
        ColumnName: fkRelation.ChildColumnName,
        Type: ValType.String,
        FkRelation: fkRelation,
        MinLen: 0,
      },
      [this.person.createFkProviderItem(fkRelation)],
    );
    column.PutValue(this.data?.externalFilters?.find((filter) => filter.filter?.Name == this.filter.Name)?.filter?.CurrentValue);
    return new BaseCdr(column, this.translator.instant('#LDS#Attestor'));
  }
}
