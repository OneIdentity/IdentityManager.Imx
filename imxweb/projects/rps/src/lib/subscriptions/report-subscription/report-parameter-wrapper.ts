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

import { EntityWriteDataColumn, IFkCandidateProvider, IEntityColumn, ParameterData, ReadWriteExtTypedEntity } from 'imx-qbm-dbts';
import { ParameterContainer } from 'qer';
import { ClassloggerService, ImxTranslationProviderService } from 'qbm';
import { EventEmitter } from '@angular/core';

export class ReportParameterWrapper {
  public startWriteData = new EventEmitter<string>();
  public endWriteData = new EventEmitter<void>();
  public columns: IEntityColumn[];
  public container: ParameterContainer<ParameterData[][]>;

  constructor(
    private readonly translationService: ImxTranslationProviderService,
    private readonly logger: ClassloggerService,
    private parameters: ParameterData[],
    private getFkProviderItems: (parameter: ParameterData) => IFkCandidateProvider,
    private typedEntity: ReadWriteExtTypedEntity<ParameterData[][],EntityWriteDataColumn[][]>
  ) {
    this.container = new ParameterContainer(this.translationService, this.getFkProviderItems, this.logger, this.typedEntity);
    this.container.updateExtendedDataTriggered.subscribe((columnName) => {
      this.logger.debug(this, 'Start writing');
      this.startWriteData.emit(columnName);
    });

    this.columns = this.createInteractiveParameterColumns();
  }

  public unsubscribeEvents(): void {
    this.container.updateExtendedDataTriggered.unsubscribe();
  }

  /** Builds a set of entity columns for a simple array of parameters. */
  private createInteractiveParameterColumns(): IEntityColumn[] {
    const columns: IEntityColumn[] = [];

    if (this.typedEntity?.onChangeExtendedDataRead) {
      this.typedEntity?.onChangeExtendedDataRead(() => {
        // new parameters from server --> sync local entity
        const newParameters: ParameterData[] = this.typedEntity.extendedDataRead[0];

        newParameters.forEach((parameter) => {
          this.container.update(parameter.Property.ColumnName, parameter);
          // TODO: remove parameters not returned by the server
        });

        this.logger.debug(this, 'End writing');

        this.endWriteData.emit();
      });
    }

    this.parameters?.forEach((parameter) => {
      const extendedDataGenerator = (newValue) => [
        [
          {
            Name: parameter.Property.ColumnName,
            Value: newValue,
          },
        ],
      ];
      const column = this.container.add(parameter.Property.ColumnName, parameter, extendedDataGenerator);
      columns.push(column);
    });

    return columns;
  }
}
