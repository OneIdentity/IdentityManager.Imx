import { HistoryComparisonData } from 'imx-api-qer';
import { TypedEntity, EntitySchema, DisplayColumns, ValType, IReadValue } from 'imx-qbm-dbts';

export type ComparisonItem = HistoryComparisonData & { TypeDisplay?: string };
export class RollbackItem extends TypedEntity {

  public readonly CurrentValueDisplay: IReadValue<string> = this.GetEntityValue('CurrentValueDisplay');
  public readonly HasChanged: IReadValue<boolean> = this.GetEntityValue('HasChanged');
  public readonly ChangeType: IReadValue<string> = this.GetEntityValue('ChangeType');
  public readonly HistoryValueDisplay: IReadValue<string> = this.GetEntityValue('HistoryValueDisplay');
  public readonly Property: IReadValue<string> = this.GetEntityValue('Property');
  public readonly TableName: IReadValue<string> = this.GetEntityValue('TableName');
  public readonly Id: IReadValue<string> = this.GetEntityValue('Id');
  public readonly TypeDisplay: IReadValue<string> = this.GetEntityValue('TypeDisplay');
  
  public static GetEntitySchema(): EntitySchema {
    const columns = {
      CurrentValueDisplay: {
        Type: ValType.String,
        ColumnName: 'CurrentValueDisplay',
      },
      HasChanged: {
        Type: ValType.Bool,
        ColumnName: 'HasChanged',
      },
      ChangeType: {
        Type: ValType.String,
        ColumnName: 'ChangeType',
      },
      HistoryValueDisplay: {
        Type: ValType.String,
        ColumnName: 'HistoryValueDisplay',
      },
      Property: {
        Type: ValType.String,
        ColumnName: 'Property',
      },
      TableName: {
        Type: ValType.String,
        ColumnName: 'TableName',
      },
      Id: {
        Type: ValType.String,
        ColumnName: 'Id',
      },
      TypeDisplay: {
        Type: ValType.String,
        ColumnName: 'TypeDisplay',
      },
    };

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;

    return { Columns: columns };
  }
}
