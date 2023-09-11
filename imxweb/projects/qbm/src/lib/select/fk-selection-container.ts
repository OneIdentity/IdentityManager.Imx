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

import { ErrorHandler } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { EntityData, FilterType, CompareOperator, CollectionLoadParameters, EntityCollectionData } from 'imx-qbm-dbts';
import { FkContainer } from '../fk-container/fk-container';
import { SelectContentProvider } from './select-content-provider.interface';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { SettingsService } from '../settings/settings-service';

/**
 * A class for containing a foreign key, its candidates and the associated form control
 */
export class FkSelectionContainer {
  public label = '';
  public candidateCollection: EntityCollectionData;
  public selection: EntityData[] = [];

  public navigation: CollectionLoadParameters;
  public loading = false;

  constructor(
    public getControl: () => AbstractControl,
    private fkContainer: FkContainer,
    private readonly errorHandler: ErrorHandler,
    private readonly logger: ClassloggerService,
    private readonly filterColumn: string,
    private readonly settingsService: SettingsService,
    public placeholder?: string,
    public itemIcon?: string,
    public contentProvider: SelectContentProvider<EntityData> = {
      display: item => item.Display,
      key: item => item.Keys[0]
    }
  ) { 
    this.navigation = { StartIndex: 0, PageSize: this.settingsService.DefaultPageSize };
  }

  public async init(errorHandler: ErrorHandler): Promise<void> {
    await this.fkContainer.init(errorHandler, this.navigation);
    this.label = this.fkContainer.property.GetMetadata().GetDisplay();
    this.candidateCollection = this.fkContainer.candidateCollection;
  }

  public load(): void {
    this.selection = this.fkContainer.value ? [this.fkContainer.value] : [];
    this.getControl().setValue(this.selection);
    this.toggleControl(this.fkContainer.property.GetMetadata().CanEdit());
  }

  public save(): void {
    this.fkContainer.setKey(this.selection && this.selection.length > 0 ? this.selection[0] : undefined);
  }

  public async getData(startIndex: number): Promise<void> {
    this.navigation.StartIndex = startIndex;
    try {
      this.loading = true;
      this.logger.trace(this, `Load ${this.navigation.PageSize} new items of column
      ${this.fkContainer.property.Column.ColumnName} from position ${this.navigation.StartIndex}`);
      await this.init(this.errorHandler);
    } finally {
      this.loading = false;
    }
  }

  public async onAutocompleteValueChanged(keywords: string): Promise<void> {
    this.navigation.filter = keywords === ''
      ? null
      : [{
        ColumnName: this.filterColumn,
        Type: FilterType.Compare,
        CompareOp: CompareOperator.Like,
        Value1: `%${keywords}%`
      }];
    this.getData(0);
  }

  private toggleControl(enabled: boolean): void {
    const control = this.getControl();
    if (enabled) {
      control.enable();
    } else {
      control.disable();
    }
  }
}
