import { IEntity, IForeignKeyInfo } from 'imx-qbm-dbts';


export function getKey(entity: IEntity, fkRelations: IForeignKeyInfo[]): string | undefined {
  if (fkRelations && fkRelations.length > 1) {
    const xObjectKeyColumn = entity.GetColumn('XObjectKey');
    return xObjectKeyColumn ? xObjectKeyColumn.GetValue() : undefined;
  }

    const parentColumn = entity.GetColumn(fkRelations[0].ColumnName);
    if (parentColumn) {
      return parentColumn.GetValue();
    }
  const keys = entity.GetKeys();
  return keys && keys.length ? keys[0] : undefined;
}
