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

import { EntityColumnData, EntityData, IEntity, IEntityColumn, IReadValue } from '@imx-modules/imx-qbm-dbts';

export function CreateIReadValue<T>(value: T, column: IEntityColumn = CreateIEntityColumn(value as unknown as string)): IReadValue<T> {
  return { value, Column: column } as IReadValue<T>;
}

export function CreateIEntityColumn(displayValue: string | undefined): IEntityColumn {
  return { GetDisplayValue: () => displayValue } as IEntityColumn;
}

export function CreateIEntity(getColumn: (name: string) => IEntityColumn, typeName?: string, keys?: string[]): IEntity {
  return { getColumn: (name: string) => getColumn(name), TypeName: typeName, GetKeys: () => keys } as unknown as IEntity;
}

export class BaseImxApiDtoMock {
  public static CreateEntityDataCollection(dataCollection: EntityData[]): EntityData[] {
    const result = dataCollection.map((data) => {
      return { ...data };
    });
    return result;
  }

  private static CreateEntityDataColumnCollection(columns: { [key: string]: EntityColumnData }): { [key: string]: EntityColumnData } {
    const entityDataColumns: { [key: string]: EntityColumnData } = {};
    Object.keys(columns).forEach((key) => {
      entityDataColumns[key] = { DisplayValue: columns[key].DisplayValue, Value: columns[key].Value };
    });
    return entityDataColumns;
  }
}

export class BaseImxApiDataMock {
  public static CreateEntityDataCollection<TEntityCollection>(createEntity: (i: number) => TEntityCollection, numOfEntries: number) {
    const dataCollection: TEntityCollection[] = [];
    for (let i = 1; i <= numOfEntries; i++) {
      dataCollection.push(createEntity(i));
    }
    return dataCollection;
  }
}
