import { IEntity, IForeignKeyInfo } from 'imx-qbm-dbts';
import { CdrFactoryService } from '../cdr-factory.service';


export function getKey(entity: IEntity, fkRelations: IForeignKeyInfo[]): string | undefined {
  if (fkRelations && fkRelations.length > 1) {
    const xObjectKeyColumn = CdrFactoryService.tryGetColumn(entity, 'XObjectKey');
    return xObjectKeyColumn ? xObjectKeyColumn.GetValue() : undefined;
  }

    const parentColumn = CdrFactoryService.tryGetColumn(entity, fkRelations[0].ColumnName);
    if (parentColumn) {
      return parentColumn.GetValue();
    }
  const keys = entity.GetKeys();
  return keys && keys.length ? keys[0] : undefined;
}
