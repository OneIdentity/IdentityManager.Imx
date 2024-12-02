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

import { EventEmitter } from '@angular/core';
import { IEntityColumn, IFkCandidateProvider, LocalEntityColumn, ParameterData, WriteExtTypedEntity } from '@imx-modules/imx-qbm-dbts';
import { ReadWriteEntityColumn } from '@imx-modules/imx-qbm-dbts/dist/ReadWriteEntityColumn';
import { ClassloggerService, ImxTranslationProviderService } from 'qbm';

export class ParameterContainer<TExtendedData> {
  constructor(
    private readonly translator: ImxTranslationProviderService,
    private readonly getFkProvider: (parameter: ParameterData) => IFkCandidateProvider,
    private readonly logger: ClassloggerService,
    private readonly typedEntity: WriteExtTypedEntity<TExtendedData>,
  ) {}

  public updateExtendedDataTriggered = new EventEmitter<string>();
  public exceptionOccured = new EventEmitter<string>();

  private parameterObjects = new Map<string, ParameterData & { column: ReadWriteEntityColumn }>();

  add(uniqueId: string, parameter: ParameterData, extendedDataGenerator: (newValue: any) => TExtendedData): IEntityColumn | undefined {
    const column =
      parameter.Property?.ColumnName == null
        ? undefined
        : new LocalEntityColumn(
            parameter.Property,
            this.translator,
            this.getFkProvider(parameter),
            parameter.Value,
            async (column, oldValue, newValue) => {
              this.updateExtendedDataTriggered.emit(parameter.Property?.ColumnName || '');
              // a single value has changed -> update extendedData to send to server
              const extendedData = extendedDataGenerator(newValue);
              await this.typedEntity.setExtendedData(extendedData);
            },
          );

    if (column == null) return undefined;
    // save parameter for later use
    this.parameterObjects.set(uniqueId, {
      ...parameter,
      column: column,
    });
    return column;
  }

  update(uniqueId: string, parameter: ParameterData) {
    const existingParameter = this.parameterObjects.get(uniqueId);
    if (existingParameter?.Property && parameter.Value) {
      this.logger.trace(this, 'updating parameter ' + uniqueId);
      // assign new value and metadata
      Object.assign(existingParameter.Property, parameter.Property);
      existingParameter.column.apply(parameter.Value);
    } else {
      // TODO: add parameters not previously known
      this.logger.warn(this, 'Not updating unknown parameter ' + uniqueId);
    }
  }
}
