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
 * Copyright 2022 One Identity LLC.
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

import { ParameterData, FkProviderItem, IEntityColumn, WriteExtTypedEntity } from "imx-qbm-dbts";
import { ReadWriteEntityColumn } from "imx-qbm-dbts/dist/ReadWriteEntityColumn";
import { ClassloggerService, EntityService } from "qbm";

export class ParameterContainer<TExtendedData> {

  constructor(private readonly entityService: EntityService,
    private readonly getFkProviderItems: (parameter: ParameterData) => FkProviderItem[],
    private readonly logger: ClassloggerService,
    private readonly typedEntity: WriteExtTypedEntity<TExtendedData>) {
  }

  private parameterObjects = new Map<string, ParameterData & { column: ReadWriteEntityColumn }>();

  add(uniqueId: string, parameter: ParameterData, extendedDataGenerator: (newValue: any) => TExtendedData): IEntityColumn {
    const column = <ReadWriteEntityColumn>this.entityService.createLocalEntityColumn(
      parameter.Property,
      this.getFkProviderItems(parameter),
      parameter.Value,
      async (oldValue, newValue) => {

        // a single value has changed -> update extendedData to send to server
        const extendedData = extendedDataGenerator(newValue);
        this.typedEntity.extendedData = extendedData;
      }
    );
    // save parameter for later use
    this.parameterObjects.set(uniqueId, {
      ...parameter,
      column: column
    });
    return column;
  }

  update(uniqueId: string, parameter: ParameterData) {
    const existingParameter = this.parameterObjects.get(uniqueId);
    if (existingParameter) {
      this.logger.trace(this, "updating parameter " + uniqueId);
      // assign new value and metadata
      Object.assign(existingParameter.Property, parameter.Property);
      existingParameter.column.apply(parameter.Value);
    }
    else {
      // TODO: add parameters not previously known
      this.logger.warn(this, "Not updating unknown parameter " + uniqueId);
    }
  }

}