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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { PortalPersonAll } from 'imx-api-qer';
import { ValType } from 'imx-qbm-dbts';
import { PersonService } from 'qer';

import { BaseCdr, ColumnDependentReference, DataSourceToolbarComponent, DataSourceToolbarSelectedFilter, EntityService } from 'qbm';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'imx-attestation-history-filter',
  templateUrl: './attestation-history-filter.component.html',
  styleUrls: ['./attestation-history-filter.component.scss'],
})
export class AttestationHistoryFilterComponent implements OnInit {
  @Input() public dst: DataSourceToolbarComponent;
  @Output() public selectedFiltersChanged = new EventEmitter<string>();

  public personData: PortalPersonAll[];
  public selectedUid: string;
  public dstFilterRef: DataSourceToolbarSelectedFilter;
  public identityCdr: ColumnDependentReference;

  private skipSelectionEmitMode = false;

  constructor(private entityService: EntityService,
    private translator: TranslateService,
    private person: PersonService) {
  }

  async ngOnInit(): Promise<void> {
    this.identityCdr = await this.createCdrPerson();
  }

  public updateSelectedEntity(): void {
    this.selectedUid = this.identityCdr.column.GetValue();

    if (this.dst) {
      // First clear any previosuly selected dst selectedFilter
      this.clearPersonFilterSelection(false);
      if (this.identityCdr.column.GetValue() && this.identityCdr.column.GetValue().length > 0) {
        this.dstFilterRef = {
          selectedOption: { Value: this.identityCdr.column.GetValue(), Display: this.identityCdr.column.GetDisplayValue() },
          filter: { Name: 'UID_Person' },
          isCustom: true,
        };
        this.dst.selectedFilters.push(this.dstFilterRef);
      }
    }
    if (!this.skipSelectionEmitMode) {
      // Trigger a new api call to reflect filter removal
      this.selectedFiltersChanged.emit(this.selectedUid);
    }
  }

  public async clearPersonFilterSelection(clearSelectControl?: boolean): Promise<void> {
    if (clearSelectControl) {
     this.identityCdr.column.PutValue(undefined);
    }
    this.clearDstSelectedFilter(this.dstFilterRef);
  }

  public onCustomFilterClearedExternally(filter: DataSourceToolbarSelectedFilter): void{
    this.selectedUid = undefined
    this.clearPersonFilterSelection(true);
    this.selectedFiltersChanged.emit();
  }

  private async createCdrPerson(): Promise<BaseCdr> {
    const fkRelation = {
      ChildColumnName: 'UID_PersonRelated',
      ParentTableName: 'Person',
      ParentColumnName: 'UID_Person',
      IsMemberRelation: false
    };

    const column = this.entityService.createLocalEntityColumn(
      {
        ColumnName: fkRelation.ChildColumnName,
        Type: ValType.String,
        FkRelation: fkRelation,
        MinLen: 0
      },
      [this.person.createFkProviderItem(fkRelation)]
    );

    const display = await this.translator.get('#LDS#Attestor').toPromise();
    const ret = new BaseCdr(column, display);

    return ret;
  }

  private clearDstSelectedFilter(selectedFilterRef: DataSourceToolbarSelectedFilter): void {
    if (this.dst && selectedFilterRef) {
      // Remove the 'isCustom' property to avoid an event being triggered in dst code
      selectedFilterRef.isCustom = undefined;
      // Then make call to remove selected filter
      this.dst.removeSelectedFilter(selectedFilterRef.filter, false, selectedFilterRef.selectedOption.Value, selectedFilterRef);
    }
  }
}
