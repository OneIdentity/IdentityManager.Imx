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

import * as TypeMoq from 'typemoq';

import {
  EntityColumnData,
  EntityData,
  IEntityColumn,
  IReadValue,
  IEntity
} from 'imx-qbm-dbts';

export function CreateIReadValue<T>(value: T, column: IEntityColumn = CreateIEntityColumn((value as unknown) as string)): IReadValue<T> {
  const readValueMock = TypeMoq.Mock.ofType<IReadValue<T>>();
  readValueMock.setup((readValue: IReadValue<T>) => readValue.value).returns(() => value);
  readValueMock.setup((readValue: IReadValue<T>) => readValue.Column).returns(() => column);
  return readValueMock.object;
}

export function CreateIEntityColumn(displayValue: string): IEntityColumn {
  const mock = TypeMoq.Mock.ofType<IEntityColumn>();
  mock.setup((item: IEntityColumn) => item.GetDisplayValue).returns(() => () => displayValue);
  return mock.object;
}

export function CreateIEntity(getColumn: (name: string) => IEntityColumn, typeName?: string, keys?: string[]): IEntity {
  const mock = TypeMoq.Mock.ofType<IEntity>();
  mock.setup((item: IEntity) => item.GetColumn).returns(() => (name: string) => getColumn(name));
  if (typeName) {
    mock.setup(item => item.TypeName).returns(() => typeName);
  }
  if (keys && keys.length > 0) {
    mock.setup(item => item.GetKeys()).returns(() => keys);
  }
  return mock.object;
}

export class BaseImxApiDtoMock {
  public static CreateEntityDataCollection(dataCollection: EntityData[]): EntityData[] {
    const result = dataCollection.map(data => {
      if (data === null) {
        return null;
      }

      const mock = TypeMoq.Mock.ofType<EntityData>();
      mock.setup(property => property.Display).returns(() => data.Display);
      mock.setup(property => property.LongDisplay).returns(() => data.LongDisplay);
      mock.setup(property => property.Keys).returns(() => data.Keys);
      mock.setup(property => property.Columns).returns(() => BaseImxApiDtoMock.CreateEntityDataColumnCollection(data.Columns));
      return mock.object;
    });
    return result;
  }

  private static CreateEntityDataColumnCollection(columns: { [key: string]: EntityColumnData }): { [key: string]: EntityColumnData } {
    const entityDataColumns: { [key: string]: EntityColumnData } = {};
    Object.keys(columns).forEach(key => {
      const mock = TypeMoq.Mock.ofType<EntityColumnData>();
      mock.setup(property => property.DisplayValue).returns(() => columns[key].DisplayValue);
      mock.setup(property => property.Value).returns(() => columns[key].Value);
      entityDataColumns[key] = mock.object;
    });
    return entityDataColumns;
  }
}

export class BaseImxApiDataMock {
  public static CreateEntityDataCollection<TEntityCollection>(createEntity: (i: number) => TEntityCollection, numOfEntries: number) {
    const dataCollection = [];
    for (let i = 1; i <= numOfEntries; i++) {
      dataCollection.push(createEntity(i));
    }
    return dataCollection;
  }
}
