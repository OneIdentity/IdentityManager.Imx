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

import {
  ApiClient,
  ApiRequestOptions,
  DataModel,
  DisplayColumns,
  DisplayPattern,
  EntityCollectionData,
  EntitySchema,
  EntityWriteDataSingle,
  FilterData,
  FilterTreeData,
  FkCandidateBuilder,
  FkProviderItem,
  InteractiveEntityData,
  InteractiveEntityWriteData,
  InteractiveTypedEntityBuilder,
  IReadValue,
  IWriteValue,
  LimitedValueData,
  MethodDefinition,
  MethodDescriptor,
  MethodSchemaDto,
  StaticSchema,
  TimeZoneInfo,
  TypedEntity,
  TypedEntityBuilder,
  ValType,
} from '@imx-modules/imx-qbm-dbts';

export interface AssignedResourceAccess {
  Display?: string;
  TypeDisplay?: string;
  TrusteeType: number;
  Permissions?: string[];
}
export interface AssignedResourceAccessData {
  Trustees?: AssignedResourceAccess[];
}
export interface ChangeRequestInput {
  ChangeRequestType: ChangeRequestType;
  Reason?: string;
}
export enum ChangeRequestType {
  Change = 0,
  RejectOwnership = 1,
}
export interface ChartData {
  ObjectKey?: string;
  Name?: string;
  ObjectDisplay?: string;
  Points?: ChartDataPoint[];
}
export interface ChartDataPoint {
  Percentage?: number;
  Value: number;
  ValueZ: number;
  Date: Date;
}
export enum ChartDisplayType {
  Auto = 0,
  Table = 1,
}
export interface ChartDto {
  NegateThresholds: boolean;
  HistoryLength: number;
  AggregateFunction: StatisticAggregateFunction;
  AggregateFunctionTotal: StatisticAggregateFunction;
  ErrorThreshold: number;
  WarningThreshold: number;
  TimeScaleUnit: StatisticTimeScaleUnit;
  Unit?: string;
  Name?: string;
  Display?: string;
  Description?: string;
  Data?: ChartData[];
}
export interface ChartInfoDto {
  Id?: string;
  Area?: string;
  Title?: string;
  HasListReport: boolean;
  Description?: string;
  HistoryLength: number;
  DisplayType: ChartDisplayType;
}
export interface DgeConfig {
  DugEditFields?: string[];
}
export interface DgeConfigData {
  IsOwner: boolean;
  ActivityAggregationIntervalDays: number;
  Config?: DgeConfig;
}
/** DTO for exception data. */
export interface ExceptionData {
  /** Gets or sets the exception message. */
  Message?: string;
  /** Gets or sets the error number for ViException-typed exceptions. */
  Number: number;
}
export interface FileShareRequestData {
  Groups?: GroupData[];
}
export interface GroupData {
  Name?: string;
  Uid?: string;
  Description?: string;
  Permissions?: string;
  IsSelfService: boolean;
  Pattern?: string;
  Groups?: GroupData[];
}
export interface NamePatternResolverData {
  Display?: string;
  Description?: string;
}
export interface PersonalStatsData {
  Charts?: ChartInfoDto[];
  Data?: ChartDto[];
}
export interface PwoCandidateGroupData {
  Operations?: ShopCandidateData[];
}
export interface ResourceAccessData {
  Trustees?: ResourceAccessTrusteeData[];
}
export interface ResourceAccessExpansionData {
  Identities?: ResourceAccessExpansionPerson[];
}
export interface ResourceAccessExpansionPerson {
  UidPerson?: string;
  Display?: string;
}
export interface ResourceAccessMembersData {
  Members?: ResourceAccessMembersData[];
  IsCircularNesting: boolean;
  Display?: string;
  TypeDisplay?: string;
}
export interface ResourceAccessTrusteeData {
  Display?: string;
  TypeDisplay?: string;
  TrusteeType: number;
  Permissions?: string[];
  Members?: ResourceAccessMembersData[];
}
export interface ResourceActivityData {
  UidQamDug?: string;
  Display?: string;
  LongDisplay?: string;
  CountActivities: number;
}
export interface ResourceReportData {
  ReportDisplayName?: string;
  Description?: string;
  UidReport?: string;
  PresetParameters?: { [key: string]: string };
}
export interface ServerSelectionResultData {
  ResultServer?: string;
}
export interface ServerSelectionScriptData {
  ScriptName?: string;
  Description?: string;
}
export interface ShopCandidateData {
  UidOrg?: string;
  FullPath?: string;
  Name?: string;
  Description?: string;
  Suitability: number;
  PersonHasGroup: boolean;
}
export enum StatisticAggregateFunction {
  None = 0,
  Sum = 1,
  Average = 2,
}
export enum StatisticTimeScaleUnit {
  Undefined = 0,
  Hour = 1,
  Day = 2,
  Week = 3,
  Month = 4,
  Quarter = 5,
  Year = 6,
}
export interface TreeNode {
  UidQamDug?: string;
  Display?: string;
  IsTarget: boolean;
  Nodes?: TreeNode[];
}
export interface TrusteeAccessData {
  Trustees?: TrusteeData[];
}
export interface TrusteeAceData {
  Path?: string;
  Permissions?: string[];
}
export interface TrusteeActivityData {
  UidTrustee?: string;
  Display?: string;
  LongDisplay?: string;
  CountActivities: number;
}
export interface TrusteeData {
  Display?: string;
  TrusteeType: number;
  UidQamTrustee?: string;
  XObjectKey?: string;
  Paths?: TrusteeAceData[];
  Children?: TrusteeData[];
}

import { IEntity } from '@imx-modules/imx-qbm-dbts';

export class TypedClient {
  public readonly PortalCandidatesAerole: PortalCandidatesAeroleWrapper;
  public readonly PortalCandidatesDepartment: PortalCandidatesDepartmentWrapper;
  public readonly PortalCandidatesLocality: PortalCandidatesLocalityWrapper;
  public readonly PortalCandidatesOrg: PortalCandidatesOrgWrapper;
  public readonly PortalCandidatesPerson: PortalCandidatesPersonWrapper;
  public readonly PortalCandidatesProfitcenter: PortalCandidatesProfitcenterWrapper;
  public readonly PortalCandidatesQamclassificationlevel: PortalCandidatesQamclassificationlevelWrapper;
  public readonly PortalCandidatesQamhelperheadpoi: PortalCandidatesQamhelperheadpoiWrapper;
  public readonly PortalDgeClassificationlevels: PortalDgeClassificationlevelsWrapper;
  public readonly PortalDgeClassificationSummary: PortalDgeClassificationSummaryWrapper;
  public readonly PortalDgeNodes: PortalDgeNodesWrapper;
  public readonly PortalDgeResources: PortalDgeResourcesWrapper;
  public readonly PortalDgeResourcesAccessanalysis: PortalDgeResourcesAccessanalysisWrapper;
  public readonly PortalDgeResourcesActivity: PortalDgeResourcesActivityWrapper;
  public readonly PortalDgeResourcesbyid: PortalDgeResourcesbyidWrapper;
  public readonly PortalDgeResourcesInteractivebyid: PortalDgeResourcesInteractivebyidWrapper;
  public readonly PortalDgeResourcesPerceivedowners: PortalDgeResourcesPerceivedownersWrapper;
  public readonly PortalDgeTrusteesIdentity: PortalDgeTrusteesIdentityWrapper;
  constructor(client: V2Client, translationProvider?) {
    this.PortalCandidatesAerole = new PortalCandidatesAeroleWrapper(client, translationProvider);
    this.PortalCandidatesDepartment = new PortalCandidatesDepartmentWrapper(client, translationProvider);
    this.PortalCandidatesLocality = new PortalCandidatesLocalityWrapper(client, translationProvider);
    this.PortalCandidatesOrg = new PortalCandidatesOrgWrapper(client, translationProvider);
    this.PortalCandidatesPerson = new PortalCandidatesPersonWrapper(client, translationProvider);
    this.PortalCandidatesProfitcenter = new PortalCandidatesProfitcenterWrapper(client, translationProvider);
    this.PortalCandidatesQamclassificationlevel = new PortalCandidatesQamclassificationlevelWrapper(client, translationProvider);
    this.PortalCandidatesQamhelperheadpoi = new PortalCandidatesQamhelperheadpoiWrapper(client, translationProvider);
    this.PortalDgeClassificationlevels = new PortalDgeClassificationlevelsWrapper(client, translationProvider);
    this.PortalDgeClassificationSummary = new PortalDgeClassificationSummaryWrapper(client, translationProvider);
    this.PortalDgeNodes = new PortalDgeNodesWrapper(client, translationProvider);
    this.PortalDgeResources = new PortalDgeResourcesWrapper(client, translationProvider);
    this.PortalDgeResourcesAccessanalysis = new PortalDgeResourcesAccessanalysisWrapper(client, translationProvider);
    this.PortalDgeResourcesActivity = new PortalDgeResourcesActivityWrapper(client, translationProvider);
    this.PortalDgeResourcesbyid = new PortalDgeResourcesbyidWrapper(client, translationProvider);
    this.PortalDgeResourcesInteractivebyid = new PortalDgeResourcesInteractivebyidWrapper(client, translationProvider);
    this.PortalDgeResourcesPerceivedowners = new PortalDgeResourcesPerceivedownersWrapper(client, translationProvider);
    this.PortalDgeTrusteesIdentity = new PortalDgeTrusteesIdentityWrapper(client, translationProvider);
  }
}
export class PortalCandidatesAerole extends TypedEntity {
  readonly XObjectKey: IReadValue<string> = this.GetEntityValue('XObjectKey');
  readonly UID_AERole: IReadValue<string> = this.GetEntityValue('UID_AERole');
  /** Returns the static compile time schema for this type. */
  static GetEntitySchema(): StaticSchema<'XObjectKey' | 'UID_AERole'> {
    const columns = {
      XObjectKey: {
        ColumnName: 'XObjectKey',
        Type: ValType.String,
        IsReadOnly: true,
      },
      UID_AERole: {
        ColumnName: 'UID_AERole',
        Type: ValType.String,
        IsReadOnly: true,
      },
    };

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
    columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

    return { TypeName: 'AERole', Columns: columns };
  }
}

/** @deprecated Use the PortalCandidatesAerole type. */
export class PortalCandidatesAeroleInteractive extends PortalCandidatesAerole {}

export class PortalCandidatesDepartment extends TypedEntity {
  readonly XObjectKey: IReadValue<string> = this.GetEntityValue('XObjectKey');
  readonly UID_Department: IReadValue<string> = this.GetEntityValue('UID_Department');
  /** Returns the static compile time schema for this type. */
  static GetEntitySchema(): StaticSchema<'XObjectKey' | 'UID_Department'> {
    const columns = {
      XObjectKey: {
        ColumnName: 'XObjectKey',
        Type: ValType.String,
        IsReadOnly: true,
      },
      UID_Department: {
        ColumnName: 'UID_Department',
        Type: ValType.String,
        IsReadOnly: true,
      },
    };

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
    columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

    return { TypeName: 'Department', Columns: columns };
  }
}

/** @deprecated Use the PortalCandidatesDepartment type. */
export class PortalCandidatesDepartmentInteractive extends PortalCandidatesDepartment {}

export class PortalCandidatesLocality extends TypedEntity {
  readonly XObjectKey: IReadValue<string> = this.GetEntityValue('XObjectKey');
  readonly UID_Locality: IReadValue<string> = this.GetEntityValue('UID_Locality');
  /** Returns the static compile time schema for this type. */
  static GetEntitySchema(): StaticSchema<'XObjectKey' | 'UID_Locality'> {
    const columns = {
      XObjectKey: {
        ColumnName: 'XObjectKey',
        Type: ValType.String,
        IsReadOnly: true,
      },
      UID_Locality: {
        ColumnName: 'UID_Locality',
        Type: ValType.String,
        IsReadOnly: true,
      },
    };

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
    columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

    return { TypeName: 'Locality', Columns: columns };
  }
}

/** @deprecated Use the PortalCandidatesLocality type. */
export class PortalCandidatesLocalityInteractive extends PortalCandidatesLocality {}

export class PortalCandidatesOrg extends TypedEntity {
  readonly XObjectKey: IReadValue<string> = this.GetEntityValue('XObjectKey');
  readonly UID_Org: IReadValue<string> = this.GetEntityValue('UID_Org');
  /** Returns the static compile time schema for this type. */
  static GetEntitySchema(): StaticSchema<'XObjectKey' | 'UID_Org'> {
    const columns = {
      XObjectKey: {
        ColumnName: 'XObjectKey',
        Type: ValType.String,
        IsReadOnly: true,
      },
      UID_Org: {
        ColumnName: 'UID_Org',
        Type: ValType.String,
        IsReadOnly: true,
      },
    };

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
    columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

    return { TypeName: 'Org', Columns: columns };
  }
}

/** @deprecated Use the PortalCandidatesOrg type. */
export class PortalCandidatesOrgInteractive extends PortalCandidatesOrg {}

export class PortalCandidatesPerson extends TypedEntity {
  readonly XObjectKey: IReadValue<string> = this.GetEntityValue('XObjectKey');
  readonly UID_Person: IReadValue<string> = this.GetEntityValue('UID_Person');
  readonly DefaultEmailAddress: IReadValue<string> = this.GetEntityValue('DefaultEmailAddress');
  /** Returns the static compile time schema for this type. */
  static GetEntitySchema(): StaticSchema<'XObjectKey' | 'UID_Person' | 'DefaultEmailAddress'> {
    const columns = {
      XObjectKey: {
        ColumnName: 'XObjectKey',
        Type: ValType.String,
        IsReadOnly: true,
      },
      UID_Person: {
        ColumnName: 'UID_Person',
        Type: ValType.String,
        IsReadOnly: true,
      },
      DefaultEmailAddress: {
        ColumnName: 'DefaultEmailAddress',
        Type: ValType.String,
        IsReadOnly: true,
      },
    };

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
    columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

    return { TypeName: 'Person', Columns: columns };
  }
}

/** @deprecated Use the PortalCandidatesPerson type. */
export class PortalCandidatesPersonInteractive extends PortalCandidatesPerson {}

export class PortalCandidatesProfitcenter extends TypedEntity {
  readonly XObjectKey: IReadValue<string> = this.GetEntityValue('XObjectKey');
  readonly UID_ProfitCenter: IReadValue<string> = this.GetEntityValue('UID_ProfitCenter');
  /** Returns the static compile time schema for this type. */
  static GetEntitySchema(): StaticSchema<'XObjectKey' | 'UID_ProfitCenter'> {
    const columns = {
      XObjectKey: {
        ColumnName: 'XObjectKey',
        Type: ValType.String,
        IsReadOnly: true,
      },
      UID_ProfitCenter: {
        ColumnName: 'UID_ProfitCenter',
        Type: ValType.String,
        IsReadOnly: true,
      },
    };

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
    columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

    return { TypeName: 'ProfitCenter', Columns: columns };
  }
}

/** @deprecated Use the PortalCandidatesProfitcenter type. */
export class PortalCandidatesProfitcenterInteractive extends PortalCandidatesProfitcenter {}

export class PortalCandidatesQamclassificationlevel extends TypedEntity {
  readonly XObjectKey: IReadValue<string> = this.GetEntityValue('XObjectKey');
  readonly UID_QAMClassificationLevel: IReadValue<string> = this.GetEntityValue('UID_QAMClassificationLevel');
  /** Returns the static compile time schema for this type. */
  static GetEntitySchema(): StaticSchema<'XObjectKey' | 'UID_QAMClassificationLevel'> {
    const columns = {
      XObjectKey: {
        ColumnName: 'XObjectKey',
        Type: ValType.String,
        IsReadOnly: true,
      },
      UID_QAMClassificationLevel: {
        ColumnName: 'UID_QAMClassificationLevel',
        Type: ValType.String,
        IsReadOnly: true,
      },
    };

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
    columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

    return { TypeName: 'QAMClassificationLevel', Columns: columns };
  }
}

/** @deprecated Use the PortalCandidatesQamclassificationlevel type. */
export class PortalCandidatesQamclassificationlevelInteractive extends PortalCandidatesQamclassificationlevel {}

export class PortalCandidatesQamhelperheadpoi extends TypedEntity {
  readonly XObjectKey: IReadValue<string> = this.GetEntityValue('XObjectKey');
  readonly UID_PersonHead: IReadValue<string> = this.GetEntityValue('UID_PersonHead');
  readonly UID_QAMDuG: IReadValue<string> = this.GetEntityValue('UID_QAMDuG');
  /** Returns the static compile time schema for this type. */
  static GetEntitySchema(): StaticSchema<'XObjectKey' | 'UID_PersonHead' | 'UID_QAMDuG'> {
    const columns = {
      XObjectKey: {
        ColumnName: 'XObjectKey',
        Type: ValType.String,
        IsReadOnly: true,
      },
      UID_PersonHead: {
        ColumnName: 'UID_PersonHead',
        Type: ValType.String,
        IsReadOnly: true,
      },
      UID_QAMDuG: {
        ColumnName: 'UID_QAMDuG',
        Type: ValType.String,
        IsReadOnly: true,
      },
    };

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
    columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

    return { TypeName: 'QAMHelperHeadPoI', Columns: columns };
  }
}

/** @deprecated Use the PortalCandidatesQamhelperheadpoi type. */
export class PortalCandidatesQamhelperheadpoiInteractive extends PortalCandidatesQamhelperheadpoi {}

export class PortalDgeClassificationlevels extends TypedEntity {
  /** Returns the static compile time schema for this type. */
  static GetEntitySchema(): StaticSchema<never> {
    const columns = {};

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
    columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

    return { TypeName: 'QAMClassificationLevel', Columns: columns };
  }
}

/** @deprecated Use the PortalDgeClassificationlevels type. */
export class PortalDgeClassificationlevelsInteractive extends PortalDgeClassificationlevels {}

export class PortalDgeClassificationSummary extends TypedEntity {
  readonly Ident_QAMResourceType: IReadValue<string> = this.GetEntityValue('Ident_QAMResourceType');
  readonly CountResourcesNotOwned: IReadValue<number> = this.GetEntityValue('CountResourcesNotOwned');
  readonly CountResourcesOwned: IReadValue<number> = this.GetEntityValue('CountResourcesOwned');
  readonly PercentResourcesNotOwned: IReadValue<number> = this.GetEntityValue('PercentResourcesNotOwned');
  readonly CountResourceOwners: IReadValue<number> = this.GetEntityValue('CountResourceOwners');
  /** Returns the static compile time schema for this type. */
  static GetEntitySchema(): StaticSchema<
    'Ident_QAMResourceType' | 'CountResourcesNotOwned' | 'CountResourcesOwned' | 'PercentResourcesNotOwned' | 'CountResourceOwners'
  > {
    const columns = {
      Ident_QAMResourceType: {
        ColumnName: 'Ident_QAMResourceType',
        Type: ValType.String,
        IsReadOnly: true,
      },
      CountResourcesNotOwned: {
        ColumnName: 'CountResourcesNotOwned',
        Type: ValType.Int,
        IsReadOnly: true,
      },
      CountResourcesOwned: {
        ColumnName: 'CountResourcesOwned',
        Type: ValType.Int,
        IsReadOnly: true,
      },
      PercentResourcesNotOwned: {
        ColumnName: 'PercentResourcesNotOwned',
        Type: ValType.Int,
        IsReadOnly: true,
      },
      CountResourceOwners: {
        ColumnName: 'CountResourceOwners',
        Type: ValType.Int,
        IsReadOnly: true,
      },
    };

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
    columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

    return { TypeName: '', Columns: columns };
  }
}

/** @deprecated Use the PortalDgeClassificationSummary type. */
export class PortalDgeClassificationSummaryInteractive extends PortalDgeClassificationSummary {}

export class PortalDgeNodes extends TypedEntity {
  /** Returns the static compile time schema for this type. */
  static GetEntitySchema(): StaticSchema<never> {
    const columns = {};

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
    columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

    return { TypeName: 'QAMNode', Columns: columns };
  }
}

/** @deprecated Use the PortalDgeNodes type. */
export class PortalDgeNodesInteractive extends PortalDgeNodes {}

export class PortalDgeResources extends TypedEntity {
  readonly UID_QAMNode: IReadValue<string> = this.GetEntityValue('UID_QAMNode');
  readonly UID_QAMResourceType: IReadValue<string> = this.GetEntityValue('UID_QAMResourceType');
  readonly UID_PersonResponsible: IReadValue<string> = this.GetEntityValue('UID_PersonResponsible');
  readonly UID_AERoleOwner: IReadValue<string> = this.GetEntityValue('UID_AERoleOwner');
  readonly IsSecurityInformationIndexed: IReadValue<boolean> = this.GetEntityValue('IsSecurityInformationIndexed');
  readonly DisplayName: IReadValue<string> = this.GetEntityValue('DisplayName');
  readonly FullPath: IReadValue<string> = this.GetEntityValue('FullPath');
  readonly DisplayPath: IReadValue<string> = this.GetEntityValue('DisplayPath');
  readonly RiskIndexCalculated: IReadValue<number> = this.GetEntityValue('RiskIndexCalculated');
  readonly RequiresOwnership: IReadValue<boolean> = this.GetEntityValue('RequiresOwnership');
  /** Returns the static compile time schema for this type. */
  static GetEntitySchema(): StaticSchema<
    | 'UID_QAMNode'
    | 'UID_QAMResourceType'
    | 'UID_PersonResponsible'
    | 'UID_AERoleOwner'
    | 'IsSecurityInformationIndexed'
    | 'DisplayName'
    | 'FullPath'
    | 'DisplayPath'
    | 'RiskIndexCalculated'
    | 'RequiresOwnership'
  > {
    const columns = {
      UID_QAMNode: {
        ColumnName: 'UID_QAMNode',
        Type: ValType.String,
        IsReadOnly: true,
      },
      UID_QAMResourceType: {
        ColumnName: 'UID_QAMResourceType',
        Type: ValType.String,
        IsReadOnly: true,
      },
      UID_PersonResponsible: {
        ColumnName: 'UID_PersonResponsible',
        Type: ValType.String,
        IsReadOnly: true,
      },
      UID_AERoleOwner: {
        ColumnName: 'UID_AERoleOwner',
        Type: ValType.String,
        IsReadOnly: true,
      },
      IsSecurityInformationIndexed: {
        ColumnName: 'IsSecurityInformationIndexed',
        Type: ValType.Bool,
        IsReadOnly: true,
      },
      DisplayName: {
        ColumnName: 'DisplayName',
        Type: ValType.String,
        IsReadOnly: true,
      },
      FullPath: {
        ColumnName: 'FullPath',
        Type: ValType.Text,
        IsReadOnly: true,
      },
      DisplayPath: {
        ColumnName: 'DisplayPath',
        Type: ValType.Text,
        IsReadOnly: true,
      },
      RiskIndexCalculated: {
        ColumnName: 'RiskIndexCalculated',
        Type: ValType.Double,
        IsReadOnly: true,
      },
      RequiresOwnership: {
        ColumnName: 'RequiresOwnership',
        Type: ValType.Bool,
        IsReadOnly: true,
      },
    };

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
    columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

    return { TypeName: 'QAMDuG', Columns: columns };
  }
}

/** @deprecated Use the PortalDgeResources type. */
export class PortalDgeResourcesInteractive extends PortalDgeResources {}

export class PortalDgeResourcesAccessanalysis extends TypedEntity {
  readonly TrusteeType: IReadValue<string> = this.GetEntityValue('TrusteeType');
  readonly Total: IReadValue<string> = this.GetEntityValue('Total');
  readonly TrusteeTypeDisplay: IReadValue<string> = this.GetEntityValue('TrusteeTypeDisplay');
  /** Returns the static compile time schema for this type. */
  static GetEntitySchema(): StaticSchema<'TrusteeType' | 'Total' | 'TrusteeTypeDisplay'> {
    const columns = {
      TrusteeType: {
        ColumnName: 'TrusteeType',
        Type: ValType.String,
        IsReadOnly: true,
      },
      Total: {
        ColumnName: 'Total',
        Type: ValType.String,
        IsReadOnly: true,
      },
      TrusteeTypeDisplay: {
        ColumnName: 'TrusteeTypeDisplay',
        Type: ValType.String,
        IsReadOnly: true,
      },
    };

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
    columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

    return { TypeName: '', Columns: columns };
  }
}

/** @deprecated Use the PortalDgeResourcesAccessanalysis type. */
export class PortalDgeResourcesAccessanalysisInteractive extends PortalDgeResourcesAccessanalysis {}

export class PortalDgeResourcesActivity extends TypedEntity {
  readonly Activities: IReadValue<number> = this.GetEntityValue('Activities');
  readonly Operation: IReadValue<string> = this.GetEntityValue('Operation');
  readonly Resources: IReadValue<number> = this.GetEntityValue('Resources');
  readonly UID_QAMDuG: IReadValue<string> = this.GetEntityValue('UID_QAMDuG');
  readonly UID_QAMPoIActivity: IReadValue<string> = this.GetEntityValue('UID_QAMPoIActivity');
  readonly UID_QAMTrustee: IReadValue<string> = this.GetEntityValue('UID_QAMTrustee');
  /** Returns the static compile time schema for this type. */
  static GetEntitySchema(): StaticSchema<
    'Activities' | 'Operation' | 'Resources' | 'UID_QAMDuG' | 'UID_QAMPoIActivity' | 'UID_QAMTrustee'
  > {
    const columns = {
      Activities: {
        ColumnName: 'Activities',
        Type: ValType.Int,
        IsReadOnly: true,
      },
      Operation: {
        ColumnName: 'Operation',
        Type: ValType.String,
        IsReadOnly: true,
      },
      Resources: {
        ColumnName: 'Resources',
        Type: ValType.Int,
        IsReadOnly: true,
      },
      UID_QAMDuG: {
        ColumnName: 'UID_QAMDuG',
        Type: ValType.String,
        IsReadOnly: true,
      },
      UID_QAMPoIActivity: {
        ColumnName: 'UID_QAMPoIActivity',
        Type: ValType.String,
        IsReadOnly: true,
      },
      UID_QAMTrustee: {
        ColumnName: 'UID_QAMTrustee',
        Type: ValType.String,
        IsReadOnly: true,
      },
    };

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
    columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

    return { TypeName: 'QAMPoIActivity', Columns: columns };
  }
}

/** @deprecated Use the PortalDgeResourcesActivity type. */
export class PortalDgeResourcesActivityInteractive extends PortalDgeResourcesActivity {}

export class PortalDgeResourcesbyid extends TypedEntity {
  readonly UID_QAMDuG: IReadValue<string> = this.GetEntityValue('UID_QAMDuG');
  readonly UID_QAMNode: IReadValue<string> = this.GetEntityValue('UID_QAMNode');
  readonly UID_QAMResourceType: IReadValue<string> = this.GetEntityValue('UID_QAMResourceType');
  readonly UID_PersonResponsible: IWriteValue<string> = this.GetEntityValue('UID_PersonResponsible');
  readonly UID_AERoleOwner: IReadValue<string> = this.GetEntityValue('UID_AERoleOwner');
  readonly IsSecurityInformationIndexed: IReadValue<boolean> = this.GetEntityValue('IsSecurityInformationIndexed');
  readonly UID_BackingFolder: IReadValue<string> = this.GetEntityValue('UID_BackingFolder');
  readonly UID_QAMDuGParent: IReadValue<string> = this.GetEntityValue('UID_QAMDuGParent');
  readonly DisplayName: IReadValue<string> = this.GetEntityValue('DisplayName');
  readonly FullPath: IReadValue<string> = this.GetEntityValue('FullPath');
  readonly DisplayPath: IReadValue<string> = this.GetEntityValue('DisplayPath');
  readonly RiskIndexCalculated: IReadValue<number> = this.GetEntityValue('RiskIndexCalculated');
  readonly RequiresOwnership: IReadValue<boolean> = this.GetEntityValue('RequiresOwnership');
  readonly UID_QAMClassificationLevelMan: IWriteValue<string> = this.GetEntityValue('UID_QAMClassificationLevelMan');
  readonly IsSecurityInheritanceBlocked: IReadValue<boolean> = this.GetEntityValue('IsSecurityInheritanceBlocked');
  readonly InProfitCenter: IWriteValue<string> = this.GetEntityValue('InProfitCenter');
  readonly InDepartment: IWriteValue<string> = this.GetEntityValue('InDepartment');
  readonly InAERole: IWriteValue<string> = this.GetEntityValue('InAERole');
  readonly InLocality: IWriteValue<string> = this.GetEntityValue('InLocality');
  readonly InOrg: IWriteValue<string> = this.GetEntityValue('InOrg');
  /** Returns the static compile time schema for this type. */
  static GetEntitySchema(): StaticSchema<
    | 'UID_QAMDuG'
    | 'UID_QAMNode'
    | 'UID_QAMResourceType'
    | 'UID_PersonResponsible'
    | 'UID_AERoleOwner'
    | 'IsSecurityInformationIndexed'
    | 'UID_BackingFolder'
    | 'UID_QAMDuGParent'
    | 'DisplayName'
    | 'FullPath'
    | 'DisplayPath'
    | 'RiskIndexCalculated'
    | 'RequiresOwnership'
    | 'UID_QAMClassificationLevelMan'
    | 'IsSecurityInheritanceBlocked'
    | 'InProfitCenter'
    | 'InDepartment'
    | 'InAERole'
    | 'InLocality'
    | 'InOrg'
  > {
    const columns = {
      UID_QAMDuG: {
        ColumnName: 'UID_QAMDuG',
        Type: ValType.String,
        IsReadOnly: true,
      },
      UID_QAMNode: {
        ColumnName: 'UID_QAMNode',
        Type: ValType.String,
        IsReadOnly: true,
      },
      UID_QAMResourceType: {
        ColumnName: 'UID_QAMResourceType',
        Type: ValType.String,
        IsReadOnly: true,
      },
      UID_PersonResponsible: {
        ColumnName: 'UID_PersonResponsible',
        Type: ValType.String,
        IsReadOnly: false,
      },
      UID_AERoleOwner: {
        ColumnName: 'UID_AERoleOwner',
        Type: ValType.String,
        IsReadOnly: true,
      },
      IsSecurityInformationIndexed: {
        ColumnName: 'IsSecurityInformationIndexed',
        Type: ValType.Bool,
        IsReadOnly: true,
      },
      UID_BackingFolder: {
        ColumnName: 'UID_BackingFolder',
        Type: ValType.String,
        IsReadOnly: true,
      },
      UID_QAMDuGParent: {
        ColumnName: 'UID_QAMDuGParent',
        Type: ValType.String,
        IsReadOnly: true,
      },
      DisplayName: {
        ColumnName: 'DisplayName',
        Type: ValType.String,
        IsReadOnly: true,
      },
      FullPath: {
        ColumnName: 'FullPath',
        Type: ValType.Text,
        IsReadOnly: true,
      },
      DisplayPath: {
        ColumnName: 'DisplayPath',
        Type: ValType.Text,
        IsReadOnly: true,
      },
      RiskIndexCalculated: {
        ColumnName: 'RiskIndexCalculated',
        Type: ValType.Double,
        IsReadOnly: true,
      },
      RequiresOwnership: {
        ColumnName: 'RequiresOwnership',
        Type: ValType.Bool,
        IsReadOnly: true,
      },
      UID_QAMClassificationLevelMan: {
        ColumnName: 'UID_QAMClassificationLevelMan',
        Type: ValType.String,
        IsReadOnly: false,
      },
      IsSecurityInheritanceBlocked: {
        ColumnName: 'IsSecurityInheritanceBlocked',
        Type: ValType.Bool,
        IsReadOnly: true,
      },
      InProfitCenter: {
        ColumnName: 'InProfitCenter',
        Type: ValType.String,
        IsReadOnly: false,
      },
      InDepartment: {
        ColumnName: 'InDepartment',
        Type: ValType.String,
        IsReadOnly: false,
      },
      InAERole: {
        ColumnName: 'InAERole',
        Type: ValType.String,
        IsReadOnly: false,
      },
      InLocality: {
        ColumnName: 'InLocality',
        Type: ValType.String,
        IsReadOnly: false,
      },
      InOrg: {
        ColumnName: 'InOrg',
        Type: ValType.String,
        IsReadOnly: false,
      },
    };

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
    columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

    return { TypeName: 'QAMDuG', Columns: columns };
  }
}

/** @deprecated Use the PortalDgeResourcesbyid type. */
export class PortalDgeResourcesbyidInteractive extends PortalDgeResourcesbyid {}

export class PortalDgeResourcesPerceivedowners extends TypedEntity {
  readonly UID_PersonPerceivedOwner: IReadValue<string> = this.GetEntityValue('UID_PersonPerceivedOwner');
  /** Returns the static compile time schema for this type. */
  static GetEntitySchema(): StaticSchema<'UID_PersonPerceivedOwner'> {
    const columns = {
      UID_PersonPerceivedOwner: {
        ColumnName: 'UID_PersonPerceivedOwner',
        Type: ValType.String,
        IsReadOnly: true,
      },
    };

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
    columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

    return { TypeName: 'QAMPoIPerceivedOwner', Columns: columns };
  }
}

/** @deprecated Use the PortalDgeResourcesPerceivedowners type. */
export class PortalDgeResourcesPerceivedownersInteractive extends PortalDgeResourcesPerceivedowners {}

export class PortalDgeTrusteesIdentity extends TypedEntity {
  readonly ObjectKeyGroup: IReadValue<string> = this.GetEntityValue('ObjectKeyGroup');
  readonly UID_QAMTrustee: IReadValue<string> = this.GetEntityValue('UID_QAMTrustee');
  /** Returns the static compile time schema for this type. */
  static GetEntitySchema(): StaticSchema<'ObjectKeyGroup' | 'UID_QAMTrustee'> {
    const columns = {
      ObjectKeyGroup: {
        ColumnName: 'ObjectKeyGroup',
        Type: ValType.String,
        IsReadOnly: true,
      },
      UID_QAMTrustee: {
        ColumnName: 'UID_QAMTrustee',
        Type: ValType.String,
        IsReadOnly: true,
      },
    };

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
    columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

    return { TypeName: '', Columns: columns };
  }
}

/** @deprecated Use the PortalDgeTrusteesIdentity type. */
export class PortalDgeTrusteesIdentityInteractive extends PortalDgeTrusteesIdentity {}

export class PortalCandidatesAeroleWrapper {
  private builder: TypedEntityBuilder<PortalCandidatesAerole>;

  constructor(
    private readonly client: V2Client,
    private readonly translationProvider,
  ) {}

  private commitMethod;
  private deleteMethod;

  /** Returns the runtime schema for this method. */
  public GetSchema(): EntitySchema {
    return this.client.getSchema('portal/candidates/AERole');
  }

  private buildBuilderIfNeeded(): void {
    if (!this.builder) {
      const fkProviderItems = this.client.getFkProviderItems('portal/candidates/AERole');
      this.builder = new TypedEntityBuilder(
        PortalCandidatesAerole,
        fkProviderItems,
        this.commitMethod,
        this.translationProvider,
        this.deleteMethod,
      );
    }
  }

  async Get(parametersOptional: portal_candidates_AERole_get_args = {}, requestOpts: ApiRequestOptions = {}) {
    const data = await this.client.portal_candidates_AERole_get(parametersOptional, requestOpts);

    this.buildBuilderIfNeeded();

    return this.builder.buildReadWriteEntities(data, this.GetSchema());
  }
}

export class PortalCandidatesDepartmentWrapper {
  private builder: TypedEntityBuilder<PortalCandidatesDepartment>;

  constructor(
    private readonly client: V2Client,
    private readonly translationProvider,
  ) {}

  private commitMethod;
  private deleteMethod;

  /** Returns the runtime schema for this method. */
  public GetSchema(): EntitySchema {
    return this.client.getSchema('portal/candidates/Department');
  }

  private buildBuilderIfNeeded(): void {
    if (!this.builder) {
      const fkProviderItems = this.client.getFkProviderItems('portal/candidates/Department');
      this.builder = new TypedEntityBuilder(
        PortalCandidatesDepartment,
        fkProviderItems,
        this.commitMethod,
        this.translationProvider,
        this.deleteMethod,
      );
    }
  }

  async Get(parametersOptional: portal_candidates_Department_get_args = {}, requestOpts: ApiRequestOptions = {}) {
    const data = await this.client.portal_candidates_Department_get(parametersOptional, requestOpts);

    this.buildBuilderIfNeeded();

    return this.builder.buildReadWriteEntities(data, this.GetSchema());
  }
}

export class PortalCandidatesLocalityWrapper {
  private builder: TypedEntityBuilder<PortalCandidatesLocality>;

  constructor(
    private readonly client: V2Client,
    private readonly translationProvider,
  ) {}

  private commitMethod;
  private deleteMethod;

  /** Returns the runtime schema for this method. */
  public GetSchema(): EntitySchema {
    return this.client.getSchema('portal/candidates/Locality');
  }

  private buildBuilderIfNeeded(): void {
    if (!this.builder) {
      const fkProviderItems = this.client.getFkProviderItems('portal/candidates/Locality');
      this.builder = new TypedEntityBuilder(
        PortalCandidatesLocality,
        fkProviderItems,
        this.commitMethod,
        this.translationProvider,
        this.deleteMethod,
      );
    }
  }

  async Get(parametersOptional: portal_candidates_Locality_get_args = {}, requestOpts: ApiRequestOptions = {}) {
    const data = await this.client.portal_candidates_Locality_get(parametersOptional, requestOpts);

    this.buildBuilderIfNeeded();

    return this.builder.buildReadWriteEntities(data, this.GetSchema());
  }
}

export class PortalCandidatesOrgWrapper {
  private builder: TypedEntityBuilder<PortalCandidatesOrg>;

  constructor(
    private readonly client: V2Client,
    private readonly translationProvider,
  ) {}

  private commitMethod;
  private deleteMethod;

  /** Returns the runtime schema for this method. */
  public GetSchema(): EntitySchema {
    return this.client.getSchema('portal/candidates/Org');
  }

  private buildBuilderIfNeeded(): void {
    if (!this.builder) {
      const fkProviderItems = this.client.getFkProviderItems('portal/candidates/Org');
      this.builder = new TypedEntityBuilder(
        PortalCandidatesOrg,
        fkProviderItems,
        this.commitMethod,
        this.translationProvider,
        this.deleteMethod,
      );
    }
  }

  async Get(parametersOptional: portal_candidates_Org_get_args = {}, requestOpts: ApiRequestOptions = {}) {
    const data = await this.client.portal_candidates_Org_get(parametersOptional, requestOpts);

    this.buildBuilderIfNeeded();

    return this.builder.buildReadWriteEntities(data, this.GetSchema());
  }
}

export class PortalCandidatesPersonWrapper {
  private builder: TypedEntityBuilder<PortalCandidatesPerson>;

  constructor(
    private readonly client: V2Client,
    private readonly translationProvider,
  ) {}

  private commitMethod;
  private deleteMethod;

  /** Returns the runtime schema for this method. */
  public GetSchema(): EntitySchema {
    return this.client.getSchema('portal/candidates/Person');
  }

  private buildBuilderIfNeeded(): void {
    if (!this.builder) {
      const fkProviderItems = this.client.getFkProviderItems('portal/candidates/Person');
      this.builder = new TypedEntityBuilder(
        PortalCandidatesPerson,
        fkProviderItems,
        this.commitMethod,
        this.translationProvider,
        this.deleteMethod,
      );
    }
  }

  async Get(parametersOptional: portal_candidates_Person_get_args = {}, requestOpts: ApiRequestOptions = {}) {
    const data = await this.client.portal_candidates_Person_get(parametersOptional, requestOpts);

    this.buildBuilderIfNeeded();

    return this.builder.buildReadWriteEntities(data, this.GetSchema());
  }
}

export class PortalCandidatesProfitcenterWrapper {
  private builder: TypedEntityBuilder<PortalCandidatesProfitcenter>;

  constructor(
    private readonly client: V2Client,
    private readonly translationProvider,
  ) {}

  private commitMethod;
  private deleteMethod;

  /** Returns the runtime schema for this method. */
  public GetSchema(): EntitySchema {
    return this.client.getSchema('portal/candidates/ProfitCenter');
  }

  private buildBuilderIfNeeded(): void {
    if (!this.builder) {
      const fkProviderItems = this.client.getFkProviderItems('portal/candidates/ProfitCenter');
      this.builder = new TypedEntityBuilder(
        PortalCandidatesProfitcenter,
        fkProviderItems,
        this.commitMethod,
        this.translationProvider,
        this.deleteMethod,
      );
    }
  }

  async Get(parametersOptional: portal_candidates_ProfitCenter_get_args = {}, requestOpts: ApiRequestOptions = {}) {
    const data = await this.client.portal_candidates_ProfitCenter_get(parametersOptional, requestOpts);

    this.buildBuilderIfNeeded();

    return this.builder.buildReadWriteEntities(data, this.GetSchema());
  }
}

export class PortalCandidatesQamclassificationlevelWrapper {
  private builder: TypedEntityBuilder<PortalCandidatesQamclassificationlevel>;

  constructor(
    private readonly client: V2Client,
    private readonly translationProvider,
  ) {}

  private commitMethod;
  private deleteMethod;

  /** Returns the runtime schema for this method. */
  public GetSchema(): EntitySchema {
    return this.client.getSchema('portal/candidates/QAMClassificationLevel');
  }

  private buildBuilderIfNeeded(): void {
    if (!this.builder) {
      const fkProviderItems = this.client.getFkProviderItems('portal/candidates/QAMClassificationLevel');
      this.builder = new TypedEntityBuilder(
        PortalCandidatesQamclassificationlevel,
        fkProviderItems,
        this.commitMethod,
        this.translationProvider,
        this.deleteMethod,
      );
    }
  }

  async Get(parametersOptional: portal_candidates_QAMClassificationLevel_get_args = {}, requestOpts: ApiRequestOptions = {}) {
    const data = await this.client.portal_candidates_QAMClassificationLevel_get(parametersOptional, requestOpts);

    this.buildBuilderIfNeeded();

    return this.builder.buildReadWriteEntities(data, this.GetSchema());
  }
}

export class PortalCandidatesQamhelperheadpoiWrapper {
  private builder: TypedEntityBuilder<PortalCandidatesQamhelperheadpoi>;

  constructor(
    private readonly client: V2Client,
    private readonly translationProvider,
  ) {}

  private commitMethod;
  private deleteMethod;

  /** Returns the runtime schema for this method. */
  public GetSchema(): EntitySchema {
    return this.client.getSchema('portal/candidates/QAMHelperHeadPoI');
  }

  private buildBuilderIfNeeded(): void {
    if (!this.builder) {
      const fkProviderItems = this.client.getFkProviderItems('portal/candidates/QAMHelperHeadPoI');
      this.builder = new TypedEntityBuilder(
        PortalCandidatesQamhelperheadpoi,
        fkProviderItems,
        this.commitMethod,
        this.translationProvider,
        this.deleteMethod,
      );
    }
  }

  async Get(parametersOptional: portal_candidates_QAMHelperHeadPoI_get_args = {}, requestOpts: ApiRequestOptions = {}) {
    const data = await this.client.portal_candidates_QAMHelperHeadPoI_get(parametersOptional, requestOpts);

    this.buildBuilderIfNeeded();

    return this.builder.buildReadWriteEntities(data, this.GetSchema());
  }
}

export class PortalDgeClassificationlevelsWrapper {
  private builder: TypedEntityBuilder<PortalDgeClassificationlevels>;

  constructor(
    private readonly client: V2Client,
    private readonly translationProvider,
  ) {}

  private commitMethod;
  private deleteMethod;

  /** Returns the runtime schema for this method. */
  public GetSchema(): EntitySchema {
    return this.client.getSchema('portal/dge/classificationlevels');
  }

  private buildBuilderIfNeeded(): void {
    if (!this.builder) {
      const fkProviderItems = this.client.getFkProviderItems('portal/dge/classificationlevels');
      this.builder = new TypedEntityBuilder(
        PortalDgeClassificationlevels,
        fkProviderItems,
        this.commitMethod,
        this.translationProvider,
        this.deleteMethod,
      );
    }
  }

  async Get(parametersOptional: portal_dge_classificationlevels_get_args = {}, requestOpts: ApiRequestOptions = {}) {
    const data = await this.client.portal_dge_classificationlevels_get(parametersOptional, requestOpts);

    this.buildBuilderIfNeeded();

    return this.builder.buildReadWriteEntities(data, this.GetSchema());
  }
}

export class PortalDgeClassificationSummaryWrapper {
  private builder: TypedEntityBuilder<PortalDgeClassificationSummary>;

  constructor(
    private readonly client: V2Client,
    private readonly translationProvider,
  ) {}

  private commitMethod;
  private deleteMethod;

  /** Returns the runtime schema for this method. */
  public GetSchema(): EntitySchema {
    return this.client.getSchema('portal/dge/classification/summary');
  }

  private buildBuilderIfNeeded(): void {
    if (!this.builder) {
      const fkProviderItems = this.client.getFkProviderItems('portal/dge/classification/summary');
      this.builder = new TypedEntityBuilder(
        PortalDgeClassificationSummary,
        fkProviderItems,
        this.commitMethod,
        this.translationProvider,
        this.deleteMethod,
      );
    }
  }

  async Get(parametersOptional: {} = {}, requestOpts: ApiRequestOptions = {}) {
    const data = await this.client.portal_dge_classification_summary_get(parametersOptional, requestOpts);

    this.buildBuilderIfNeeded();

    return this.builder.buildReadWriteEntities(data, this.GetSchema());
  }
}

export class PortalDgeNodesWrapper {
  private builder: TypedEntityBuilder<PortalDgeNodes>;

  constructor(
    private readonly client: V2Client,
    private readonly translationProvider,
  ) {}

  private commitMethod;
  private deleteMethod;

  /** Returns the runtime schema for this method. */
  public GetSchema(): EntitySchema {
    return this.client.getSchema('portal/dge/nodes');
  }

  private buildBuilderIfNeeded(): void {
    if (!this.builder) {
      const fkProviderItems = this.client.getFkProviderItems('portal/dge/nodes');
      this.builder = new TypedEntityBuilder(
        PortalDgeNodes,
        fkProviderItems,
        this.commitMethod,
        this.translationProvider,
        this.deleteMethod,
      );
    }
  }

  async Get(parametersOptional: portal_dge_nodes_get_args = {}, requestOpts: ApiRequestOptions = {}) {
    const data = await this.client.portal_dge_nodes_get(parametersOptional, requestOpts);

    this.buildBuilderIfNeeded();

    return this.builder.buildReadWriteEntities(data, this.GetSchema());
  }
}

export class PortalDgeResourcesWrapper {
  private builder: TypedEntityBuilder<PortalDgeResources>;

  constructor(
    private readonly client: V2Client,
    private readonly translationProvider,
  ) {}

  private commitMethod;
  private deleteMethod;

  /** Returns the runtime schema for this method. */
  public GetSchema(): EntitySchema {
    return this.client.getSchema('portal/dge/resources');
  }

  private buildBuilderIfNeeded(): void {
    if (!this.builder) {
      const fkProviderItems = this.client.getFkProviderItems('portal/dge/resources');
      this.builder = new TypedEntityBuilder(
        PortalDgeResources,
        fkProviderItems,
        this.commitMethod,
        this.translationProvider,
        this.deleteMethod,
      );
    }
  }

  async Get(parametersOptional: portal_dge_resources_get_args = {}, requestOpts: ApiRequestOptions = {}) {
    const data = await this.client.portal_dge_resources_get(parametersOptional, requestOpts);

    this.buildBuilderIfNeeded();

    return this.builder.buildReadWriteEntities(data, this.GetSchema());
  }
}

export class PortalDgeResourcesAccessanalysisWrapper {
  private builder: TypedEntityBuilder<PortalDgeResourcesAccessanalysis>;

  constructor(
    private readonly client: V2Client,
    private readonly translationProvider,
  ) {}

  private commitMethod;
  private deleteMethod;

  /** Returns the runtime schema for this method. */
  public GetSchema(): EntitySchema {
    return this.client.getSchema('portal/dge/resources/{uiddug}/accessanalysis');
  }

  private buildBuilderIfNeeded(): void {
    if (!this.builder) {
      const fkProviderItems = this.client.getFkProviderItems('portal/dge/resources/{uiddug}/accessanalysis');
      this.builder = new TypedEntityBuilder(
        PortalDgeResourcesAccessanalysis,
        fkProviderItems,
        this.commitMethod,
        this.translationProvider,
        this.deleteMethod,
      );
    }
  }

  async Get(uiddug: string, parametersOptional: {} = {}, requestOpts: ApiRequestOptions = {}) {
    const data = await this.client.portal_dge_resources_accessanalysis_get(uiddug, parametersOptional, requestOpts);

    this.buildBuilderIfNeeded();

    return this.builder.buildReadWriteEntities(data, this.GetSchema());
  }
}

export class PortalDgeResourcesActivityWrapper {
  private builder: TypedEntityBuilder<PortalDgeResourcesActivity>;

  constructor(
    private readonly client: V2Client,
    private readonly translationProvider,
  ) {}

  private commitMethod;
  private deleteMethod;

  /** Returns the runtime schema for this method. */
  public GetSchema(): EntitySchema {
    return this.client.getSchema('portal/dge/resources/{uiddug}/activity');
  }

  private buildBuilderIfNeeded(): void {
    if (!this.builder) {
      const fkProviderItems = this.client.getFkProviderItems('portal/dge/resources/{uiddug}/activity');
      this.builder = new TypedEntityBuilder(
        PortalDgeResourcesActivity,
        fkProviderItems,
        this.commitMethod,
        this.translationProvider,
        this.deleteMethod,
      );
    }
  }

  async Get(uiddug: string, parametersOptional: portal_dge_resources_activity_get_args = {}, requestOpts: ApiRequestOptions = {}) {
    const data = await this.client.portal_dge_resources_activity_get(uiddug, parametersOptional, requestOpts);

    this.buildBuilderIfNeeded();

    return this.builder.buildReadWriteEntities(data, this.GetSchema());
  }
}

export class PortalDgeResourcesbyidWrapper {
  private builder: TypedEntityBuilder<PortalDgeResourcesbyid>;

  constructor(
    private readonly client: V2Client,
    private readonly translationProvider,
  ) {}

  private commitMethod;
  private deleteMethod;

  /** Returns the runtime schema for this method. */
  public GetSchema(): EntitySchema {
    return this.client.getSchema('portal/dge/resources/{UID_QAMDuG}');
  }

  private buildBuilderIfNeeded(): void {
    if (!this.builder) {
      const fkProviderItems = this.client.getFkProviderItems('portal/dge/resources/{UID_QAMDuG}');
      this.builder = new TypedEntityBuilder(
        PortalDgeResourcesbyid,
        fkProviderItems,
        this.commitMethod,
        this.translationProvider,
        this.deleteMethod,
      );
    }
  }

  async Get_byid(UID_QAMDuG: string, parametersOptional: portal_dge_resources_byid_get_args = {}, requestOpts: ApiRequestOptions = {}) {
    const data = await this.client.portal_dge_resources_byid_get(UID_QAMDuG, parametersOptional, requestOpts);

    this.buildBuilderIfNeeded();

    return this.builder.buildReadWriteEntities(data, this.GetSchema());
  }
}

export class PortalDgeResourcesInteractivebyidWrapper {
  private builder: InteractiveTypedEntityBuilder<PortalDgeResourcesbyid>;

  constructor(
    private readonly client: V2Client,
    private readonly translationProvider,
  ) {
    this.commitMethod = (entity: IEntity, writeData) => {
      return this.client.portal_dge_resources_interactive_byid_put(entity.GetColumn('UID_QAMDuG').GetValue(), writeData);
    };
  }

  private commitMethod;
  private deleteMethod;

  /** Returns the runtime schema for this method. */
  public GetSchema(): EntitySchema {
    return this.client.getSchema('portal/dge/resources/{UID_QAMDuG}/interactive');
  }

  private buildBuilderIfNeeded(): void {
    if (!this.builder) {
      const fkProviderItems = this.client.getFkProviderItems('portal/dge/resources/{UID_QAMDuG}/interactive');
      this.builder = new InteractiveTypedEntityBuilder(
        PortalDgeResourcesbyid,
        fkProviderItems,
        this.commitMethod,
        this.translationProvider,
        this.deleteMethod,
      );
    }
  }

  async Put_byid(
    UID_QAMDuG: string,
    inputParameterName: PortalDgeResourcesbyid,
    parametersOptional: {} = {},
    requestOpts: ApiRequestOptions = {},
  ) {
    const data = await this.client.portal_dge_resources_interactive_byid_put(
      UID_QAMDuG,
      inputParameterName.InteractiveEntityWriteData,
      parametersOptional,
      requestOpts,
    );

    this.buildBuilderIfNeeded();

    return this.builder.buildReadWriteEntities(data, this.GetSchema());
  }

  async Get_byid(UID_QAMDuG: string, parametersOptional: {} = {}, requestOpts: ApiRequestOptions = {}) {
    const data = await this.client.portal_dge_resources_interactive_byid_get(UID_QAMDuG, parametersOptional, requestOpts);

    this.buildBuilderIfNeeded();

    return this.builder.buildReadWriteEntities(data, this.GetSchema());
  }
}

export class PortalDgeResourcesPerceivedownersWrapper {
  private builder: TypedEntityBuilder<PortalDgeResourcesPerceivedowners>;

  constructor(
    private readonly client: V2Client,
    private readonly translationProvider,
  ) {}

  private commitMethod;
  private deleteMethod;

  /** Returns the runtime schema for this method. */
  public GetSchema(): EntitySchema {
    return this.client.getSchema('portal/dge/resources/{uiddug}/perceivedowners');
  }

  private buildBuilderIfNeeded(): void {
    if (!this.builder) {
      const fkProviderItems = this.client.getFkProviderItems('portal/dge/resources/{uiddug}/perceivedowners');
      this.builder = new TypedEntityBuilder(
        PortalDgeResourcesPerceivedowners,
        fkProviderItems,
        this.commitMethod,
        this.translationProvider,
        this.deleteMethod,
      );
    }
  }

  async Get(uiddug: string, parametersOptional: portal_dge_resources_perceivedowners_get_args = {}, requestOpts: ApiRequestOptions = {}) {
    const data = await this.client.portal_dge_resources_perceivedowners_get(uiddug, parametersOptional, requestOpts);

    this.buildBuilderIfNeeded();

    return this.builder.buildReadWriteEntities(data, this.GetSchema());
  }
}

export class PortalDgeTrusteesIdentityWrapper {
  private builder: TypedEntityBuilder<PortalDgeTrusteesIdentity>;

  constructor(
    private readonly client: V2Client,
    private readonly translationProvider,
  ) {}

  private commitMethod;
  private deleteMethod;

  /** Returns the runtime schema for this method. */
  public GetSchema(): EntitySchema {
    return this.client.getSchema('portal/dge/trustees/identity/{uid_person}');
  }

  private buildBuilderIfNeeded(): void {
    if (!this.builder) {
      const fkProviderItems = this.client.getFkProviderItems('portal/dge/trustees/identity/{uid_person}');
      this.builder = new TypedEntityBuilder(
        PortalDgeTrusteesIdentity,
        fkProviderItems,
        this.commitMethod,
        this.translationProvider,
        this.deleteMethod,
      );
    }
  }

  async Get(uid_person: string, parametersOptional: {} = {}, requestOpts: ApiRequestOptions = {}) {
    const data = await this.client.portal_dge_trustees_identity_get(uid_person, parametersOptional, requestOpts);

    this.buildBuilderIfNeeded();

    return this.builder.buildReadWriteEntities(data, this.GetSchema());
  }
}

/** @deprecated Use the V2ApiClientMethodFactory class for a stable method interface. */
export class ApiClientMethodFactory {
  portal_candidates_AERole_get(
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
    ParentKey: string,
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/candidates/AERole',
      parameters: [
        {
          name: 'OrderBy',
          value: OrderBy,
          in: 'query',
        },
        {
          name: 'StartIndex',
          value: StartIndex,
          in: 'query',
        },
        {
          name: 'PageSize',
          value: PageSize,
          in: 'query',
        },
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'withProperties',
          value: withProperties,
          in: 'query',
        },
        {
          name: 'search',
          value: search,
          in: 'query',
        },
        {
          name: 'ParentKey',
          value: ParentKey,
          in: 'query',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_AERole_filtertree_post(
    filter: FilterData[],
    parentkey: string,
    inputParameterName: EntityWriteDataSingle,
  ): MethodDescriptor<FilterTreeData> {
    return {
      path: '/portal/candidates/AERole/filtertree',
      parameters: [
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'parentkey',
          value: parentkey,
          in: 'query',
        },
        {
          name: 'inputParameterName',
          value: inputParameterName,
          required: true,
          in: 'body',
        },
      ],
      method: 'POST',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_Department_get(
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
    ParentKey: string,
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/candidates/Department',
      parameters: [
        {
          name: 'OrderBy',
          value: OrderBy,
          in: 'query',
        },
        {
          name: 'StartIndex',
          value: StartIndex,
          in: 'query',
        },
        {
          name: 'PageSize',
          value: PageSize,
          in: 'query',
        },
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'withProperties',
          value: withProperties,
          in: 'query',
        },
        {
          name: 'search',
          value: search,
          in: 'query',
        },
        {
          name: 'ParentKey',
          value: ParentKey,
          in: 'query',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_Department_filtertree_post(
    filter: FilterData[],
    parentkey: string,
    inputParameterName: EntityWriteDataSingle,
  ): MethodDescriptor<FilterTreeData> {
    return {
      path: '/portal/candidates/Department/filtertree',
      parameters: [
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'parentkey',
          value: parentkey,
          in: 'query',
        },
        {
          name: 'inputParameterName',
          value: inputParameterName,
          required: true,
          in: 'body',
        },
      ],
      method: 'POST',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_Locality_get(
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
    ParentKey: string,
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/candidates/Locality',
      parameters: [
        {
          name: 'OrderBy',
          value: OrderBy,
          in: 'query',
        },
        {
          name: 'StartIndex',
          value: StartIndex,
          in: 'query',
        },
        {
          name: 'PageSize',
          value: PageSize,
          in: 'query',
        },
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'withProperties',
          value: withProperties,
          in: 'query',
        },
        {
          name: 'search',
          value: search,
          in: 'query',
        },
        {
          name: 'ParentKey',
          value: ParentKey,
          in: 'query',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_Locality_filtertree_post(
    filter: FilterData[],
    parentkey: string,
    inputParameterName: EntityWriteDataSingle,
  ): MethodDescriptor<FilterTreeData> {
    return {
      path: '/portal/candidates/Locality/filtertree',
      parameters: [
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'parentkey',
          value: parentkey,
          in: 'query',
        },
        {
          name: 'inputParameterName',
          value: inputParameterName,
          required: true,
          in: 'body',
        },
      ],
      method: 'POST',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_Org_get(
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
    ParentKey: string,
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/candidates/Org',
      parameters: [
        {
          name: 'OrderBy',
          value: OrderBy,
          in: 'query',
        },
        {
          name: 'StartIndex',
          value: StartIndex,
          in: 'query',
        },
        {
          name: 'PageSize',
          value: PageSize,
          in: 'query',
        },
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'withProperties',
          value: withProperties,
          in: 'query',
        },
        {
          name: 'search',
          value: search,
          in: 'query',
        },
        {
          name: 'ParentKey',
          value: ParentKey,
          in: 'query',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_Org_filtertree_post(
    filter: FilterData[],
    parentkey: string,
    inputParameterName: EntityWriteDataSingle,
  ): MethodDescriptor<FilterTreeData> {
    return {
      path: '/portal/candidates/Org/filtertree',
      parameters: [
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'parentkey',
          value: parentkey,
          in: 'query',
        },
        {
          name: 'inputParameterName',
          value: inputParameterName,
          required: true,
          in: 'body',
        },
      ],
      method: 'POST',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_Person_get(
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/candidates/Person',
      parameters: [
        {
          name: 'OrderBy',
          value: OrderBy,
          in: 'query',
        },
        {
          name: 'StartIndex',
          value: StartIndex,
          in: 'query',
        },
        {
          name: 'PageSize',
          value: PageSize,
          in: 'query',
        },
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'withProperties',
          value: withProperties,
          in: 'query',
        },
        {
          name: 'search',
          value: search,
          in: 'query',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_Person_filtertree_post(
    filter: FilterData[],
    parentkey: string,
    inputParameterName: EntityWriteDataSingle,
  ): MethodDescriptor<FilterTreeData> {
    return {
      path: '/portal/candidates/Person/filtertree',
      parameters: [
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'parentkey',
          value: parentkey,
          in: 'query',
        },
        {
          name: 'inputParameterName',
          value: inputParameterName,
          required: true,
          in: 'body',
        },
      ],
      method: 'POST',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_ProfitCenter_get(
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
    ParentKey: string,
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/candidates/ProfitCenter',
      parameters: [
        {
          name: 'OrderBy',
          value: OrderBy,
          in: 'query',
        },
        {
          name: 'StartIndex',
          value: StartIndex,
          in: 'query',
        },
        {
          name: 'PageSize',
          value: PageSize,
          in: 'query',
        },
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'withProperties',
          value: withProperties,
          in: 'query',
        },
        {
          name: 'search',
          value: search,
          in: 'query',
        },
        {
          name: 'ParentKey',
          value: ParentKey,
          in: 'query',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_ProfitCenter_filtertree_post(
    filter: FilterData[],
    parentkey: string,
    inputParameterName: EntityWriteDataSingle,
  ): MethodDescriptor<FilterTreeData> {
    return {
      path: '/portal/candidates/ProfitCenter/filtertree',
      parameters: [
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'parentkey',
          value: parentkey,
          in: 'query',
        },
        {
          name: 'inputParameterName',
          value: inputParameterName,
          required: true,
          in: 'body',
        },
      ],
      method: 'POST',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_QAMClassificationLevel_get(
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/candidates/QAMClassificationLevel',
      parameters: [
        {
          name: 'OrderBy',
          value: OrderBy,
          in: 'query',
        },
        {
          name: 'StartIndex',
          value: StartIndex,
          in: 'query',
        },
        {
          name: 'PageSize',
          value: PageSize,
          in: 'query',
        },
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'withProperties',
          value: withProperties,
          in: 'query',
        },
        {
          name: 'search',
          value: search,
          in: 'query',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_QAMClassificationLevel_datamodel_get(filter: FilterData[]): MethodDescriptor<DataModel> {
    return {
      path: '/portal/candidates/QAMClassificationLevel/datamodel',
      parameters: [
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_QAMClassificationLevel_filtertree_post(
    filter: FilterData[],
    parentkey: string,
    inputParameterName: EntityWriteDataSingle,
  ): MethodDescriptor<FilterTreeData> {
    return {
      path: '/portal/candidates/QAMClassificationLevel/filtertree',
      parameters: [
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'parentkey',
          value: parentkey,
          in: 'query',
        },
        {
          name: 'inputParameterName',
          value: inputParameterName,
          required: true,
          in: 'body',
        },
      ],
      method: 'POST',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_QAMHelperHeadPoI_get(
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/candidates/QAMHelperHeadPoI',
      parameters: [
        {
          name: 'OrderBy',
          value: OrderBy,
          in: 'query',
        },
        {
          name: 'StartIndex',
          value: StartIndex,
          in: 'query',
        },
        {
          name: 'PageSize',
          value: PageSize,
          in: 'query',
        },
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'withProperties',
          value: withProperties,
          in: 'query',
        },
        {
          name: 'search',
          value: search,
          in: 'query',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_QAMHelperHeadPoI_datamodel_get(filter: FilterData[]): MethodDescriptor<DataModel> {
    return {
      path: '/portal/candidates/QAMHelperHeadPoI/datamodel',
      parameters: [
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_QAMHelperHeadPoI_filtertree_post(
    filter: FilterData[],
    parentkey: string,
    inputParameterName: EntityWriteDataSingle,
  ): MethodDescriptor<FilterTreeData> {
    return {
      path: '/portal/candidates/QAMHelperHeadPoI/filtertree',
      parameters: [
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'parentkey',
          value: parentkey,
          in: 'query',
        },
        {
          name: 'inputParameterName',
          value: inputParameterName,
          required: true,
          in: 'body',
        },
      ],
      method: 'POST',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_access_get(tablename: string, uid: string): MethodDescriptor<TrusteeAccessData> {
    return {
      path: '/portal/dge/access/{tablename}/{uid}',
      parameters: [
        {
          name: 'tablename',
          value: tablename,
          required: true,
          in: 'path',
        },
        {
          name: 'uid',
          value: uid,
          required: true,
          in: 'path',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_access_candidate_get(uidpwo: string): MethodDescriptor<PwoCandidateGroupData> {
    return {
      path: '/portal/dge/access/candidate/{uidpwo}',
      parameters: [
        {
          name: 'uidpwo',
          value: uidpwo,
          required: true,
          in: 'path',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_access_identity_get(uid_person: string): MethodDescriptor<TrusteeAccessData> {
    return {
      path: '/portal/dge/access/identity/{uid_person}',
      parameters: [
        {
          name: 'uid_person',
          value: uid_person,
          required: true,
          in: 'path',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_access_trustee_get(uid_qamtrustee: string): MethodDescriptor<TrusteeAccessData> {
    return {
      path: '/portal/dge/access/trustee/{uid_qamtrustee}',
      parameters: [
        {
          name: 'uid_qamtrustee',
          value: uid_qamtrustee,
          required: true,
          in: 'path',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_classification_summary_get(): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/dge/classification/summary',
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_classificationlevels_get(
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/dge/classificationlevels',
      parameters: [
        {
          name: 'OrderBy',
          value: OrderBy,
          in: 'query',
        },
        {
          name: 'StartIndex',
          value: StartIndex,
          in: 'query',
        },
        {
          name: 'PageSize',
          value: PageSize,
          in: 'query',
        },
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'withProperties',
          value: withProperties,
          in: 'query',
        },
        {
          name: 'search',
          value: search,
          in: 'query',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_filesharerequest_get(uidpwo: string): MethodDescriptor<FileShareRequestData> {
    return {
      path: '/portal/dge/filesharerequest/{uidpwo}',
      parameters: [
        {
          name: 'uidpwo',
          value: uidpwo,
          required: true,
          in: 'path',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_filesharerequest_serverselection_get(uidpwo: string, name: string): MethodDescriptor<ServerSelectionResultData> {
    return {
      path: '/portal/dge/filesharerequest/{uidpwo}/serverselection/{name}',
      parameters: [
        {
          name: 'uidpwo',
          value: uidpwo,
          required: true,
          in: 'path',
        },
        {
          name: 'name',
          value: name,
          required: true,
          in: 'path',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_mostactiveresources_get(): MethodDescriptor<ResourceActivityData[]> {
    return {
      path: '/portal/dge/mostactiveresources',
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_mostactivetrustees_get(): MethodDescriptor<TrusteeActivityData[]> {
    return {
      path: '/portal/dge/mostactivetrustees',
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_namepatternresolvers_get(): MethodDescriptor<NamePatternResolverData[]> {
    return {
      path: '/portal/dge/namepatternresolvers',
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_nodes_get(
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/dge/nodes',
      parameters: [
        {
          name: 'OrderBy',
          value: OrderBy,
          in: 'query',
        },
        {
          name: 'StartIndex',
          value: StartIndex,
          in: 'query',
        },
        {
          name: 'PageSize',
          value: PageSize,
          in: 'query',
        },
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'withProperties',
          value: withProperties,
          in: 'query',
        },
        {
          name: 'search',
          value: search,
          in: 'query',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_personalstats_get(): MethodDescriptor<PersonalStatsData> {
    return {
      path: '/portal/dge/personalstats',
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_get(
    uiddugshare: string,
    withblockedinheritance: boolean,
    withindexedsecurity: boolean,
    withactivity: boolean,
    foraccproduct: string,
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
    ParentKey: string,
    owned: string,
    withpolicyviolations: string,
    withoutowner: string,
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/dge/resources',
      parameters: [
        {
          name: 'uiddugshare',
          value: uiddugshare,
          in: 'query',
        },
        {
          name: 'withblockedinheritance',
          value: withblockedinheritance,
          in: 'query',
        },
        {
          name: 'withindexedsecurity',
          value: withindexedsecurity,
          in: 'query',
        },
        {
          name: 'withactivity',
          value: withactivity,
          in: 'query',
        },
        {
          name: 'foraccproduct',
          value: foraccproduct,
          in: 'query',
        },
        {
          name: 'OrderBy',
          value: OrderBy,
          in: 'query',
        },
        {
          name: 'StartIndex',
          value: StartIndex,
          in: 'query',
        },
        {
          name: 'PageSize',
          value: PageSize,
          in: 'query',
        },
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'withProperties',
          value: withProperties,
          in: 'query',
        },
        {
          name: 'search',
          value: search,
          in: 'query',
        },
        {
          name: 'ParentKey',
          value: ParentKey,
          in: 'query',
        },
        {
          name: 'owned',
          value: owned,
          in: 'query',
        },
        {
          name: 'withpolicyviolations',
          value: withpolicyviolations,
          in: 'query',
        },
        {
          name: 'withoutowner',
          value: withoutowner,
          in: 'query',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_byid_get(
    UID_QAMDuG: string,
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
    ParentKey: string,
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/dge/resources/{UID_QAMDuG}',
      parameters: [
        {
          name: 'UID_QAMDuG',
          value: UID_QAMDuG,
          required: true,
          in: 'path',
        },
        {
          name: 'OrderBy',
          value: OrderBy,
          in: 'query',
        },
        {
          name: 'StartIndex',
          value: StartIndex,
          in: 'query',
        },
        {
          name: 'PageSize',
          value: PageSize,
          in: 'query',
        },
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'withProperties',
          value: withProperties,
          in: 'query',
        },
        {
          name: 'search',
          value: search,
          in: 'query',
        },
        {
          name: 'ParentKey',
          value: ParentKey,
          in: 'query',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_interactive_byid_get(UID_QAMDuG: string): MethodDescriptor<InteractiveEntityData> {
    return {
      path: '/portal/dge/resources/{UID_QAMDuG}/interactive',
      parameters: [
        {
          name: 'UID_QAMDuG',
          value: UID_QAMDuG,
          required: true,
          in: 'path',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_interactive_byid_put(
    UID_QAMDuG: string,
    inputParameterName: InteractiveEntityWriteData,
  ): MethodDescriptor<InteractiveEntityData> {
    return {
      path: '/portal/dge/resources/{UID_QAMDuG}/interactive',
      parameters: [
        {
          name: 'UID_QAMDuG',
          value: UID_QAMDuG,
          required: true,
          in: 'path',
        },
        {
          name: 'inputParameterName',
          value: inputParameterName,
          required: true,
          in: 'body',
        },
      ],
      method: 'PUT',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_access_get(uiddug: string): MethodDescriptor<ResourceAccessData> {
    return {
      path: '/portal/dge/resources/{uiddug}/access',
      parameters: [
        {
          name: 'uiddug',
          value: uiddug,
          required: true,
          in: 'path',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_accessanalysis_get(uiddug: string): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/dge/resources/{uiddug}/accessanalysis',
      parameters: [
        {
          name: 'uiddug',
          value: uiddug,
          required: true,
          in: 'path',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_accesschart_get(uiddug: string, id: string): MethodDescriptor<ChartDto> {
    return {
      path: '/portal/dge/resources/{uiddug}/accesschart/{id}',
      parameters: [
        {
          name: 'uiddug',
          value: uiddug,
          required: true,
          in: 'path',
        },
        {
          name: 'id',
          value: id,
          required: true,
          in: 'path',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_activity_get(
    uiddug: string,
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/dge/resources/{uiddug}/activity',
      parameters: [
        {
          name: 'uiddug',
          value: uiddug,
          required: true,
          in: 'path',
        },
        {
          name: 'OrderBy',
          value: OrderBy,
          in: 'query',
        },
        {
          name: 'StartIndex',
          value: StartIndex,
          in: 'query',
        },
        {
          name: 'PageSize',
          value: PageSize,
          in: 'query',
        },
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'withProperties',
          value: withProperties,
          in: 'query',
        },
        {
          name: 'search',
          value: search,
          in: 'query',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_identities_get(uiddug: string): MethodDescriptor<ResourceAccessExpansionData> {
    return {
      path: '/portal/dge/resources/{uiddug}/identities',
      parameters: [
        {
          name: 'uiddug',
          value: uiddug,
          required: true,
          in: 'path',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_perceivedowners_get(
    uiddug: string,
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/dge/resources/{uiddug}/perceivedowners',
      parameters: [
        {
          name: 'uiddug',
          value: uiddug,
          required: true,
          in: 'path',
        },
        {
          name: 'OrderBy',
          value: OrderBy,
          in: 'query',
        },
        {
          name: 'StartIndex',
          value: StartIndex,
          in: 'query',
        },
        {
          name: 'PageSize',
          value: PageSize,
          in: 'query',
        },
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
        {
          name: 'withProperties',
          value: withProperties,
          in: 'query',
        },
        {
          name: 'search',
          value: search,
          in: 'query',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_reports_get(uiddug: string): MethodDescriptor<ResourceReportData[]> {
    return {
      path: '/portal/dge/resources/{uiddug}/reports',
      parameters: [
        {
          name: 'uiddug',
          value: uiddug,
          required: true,
          in: 'path',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_request_post(uiddug: string, inputParameterName: ChangeRequestInput): MethodDescriptor<void> {
    return {
      path: '/portal/dge/resources/{uiddug}/request',
      parameters: [
        {
          name: 'uiddug',
          value: uiddug,
          required: true,
          in: 'path',
        },
        {
          name: 'inputParameterName',
          value: inputParameterName,
          required: true,
          in: 'body',
        },
      ],
      method: 'POST',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_trusteeandpolicyrightset_get(uiddug: string): MethodDescriptor<AssignedResourceAccessData> {
    return {
      path: '/portal/dge/resources/{uiddug}/trusteeandpolicyrightset',
      parameters: [
        {
          name: 'uiddug',
          value: uiddug,
          required: true,
          in: 'path',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_datamodel_get(filter: FilterData[]): MethodDescriptor<DataModel> {
    return {
      path: '/portal/dge/resources/datamodel',
      parameters: [
        {
          name: 'filter',
          value: filter,
          in: 'query',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resourcetree_get(uidaccproduct: string): MethodDescriptor<TreeNode[]> {
    return {
      path: '/portal/dge/resourcetree/{uidaccproduct}',
      parameters: [
        {
          name: 'uidaccproduct',
          value: uidaccproduct,
          required: true,
          in: 'path',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_serverselectors_get(): MethodDescriptor<ServerSelectionScriptData[]> {
    return {
      path: '/portal/dge/serverselectors',
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_trustees_identity_get(uid_person: string): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/dge/trustees/identity/{uid_person}',
      parameters: [
        {
          name: 'uid_person',
          value: uid_person,
          required: true,
          in: 'path',
        },
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_trustees_types_get(): MethodDescriptor<LimitedValueData[]> {
    return {
      path: '/portal/dge/trustees/types',
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dgeconfig_get(): MethodDescriptor<DgeConfigData> {
    return {
      path: '/portal/dgeconfig',
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
}

/** @deprecated Use the V2Client class for a stable method interface. */
export class Client {
  private readonly methodFactory = new ApiClientMethodFactory();

  constructor(
    private readonly apiClient: ApiClient,
    private schemaProvider?: { readonly schemas: { [key: string]: EntitySchema } },
  ) {
    if (!apiClient) {
      throw new Error('The value for the apiClient parameter is undefined.');
    }
  }

  public get schemas(): { [key: string]: EntitySchema } {
    if (!this.schemaProvider) {
      throw new Error('The schema has not been loaded.');
    }
    return this.schemaProvider.schemas;
  }

  public async loadSchema(language?: string): Promise<void> {
    const headers = {};
    if (language) headers['Accept-Language'] = language;

    const dtos = (await this.apiClient.processRequest({
      path: '/imx/entityschema',
      parameters: [],
      method: 'GET',
      headers: headers,
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    })) as { [key: string]: MethodSchemaDto };

    const schemas: { [key: string]: EntitySchema } = {};

    for (var key in dtos) {
      const dto = dtos[key];
      const columns = dto.Properties ?? {};
      columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
      columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

      schemas[key] = {
        TypeName: dto.TypeName,
        DisplayPattern: new DisplayPattern(dto.DisplayPattern ?? ''),
        Display: dto.Display,
        DisplaySingular: dto.DisplaySingular,
        FkCandidateRoutes: dto.FkCandidateRoutes,
        Columns: columns,
      };
    }
    this.schemaProvider = { schemas: schemas };
  }

  public getFkProviderItems(methodKey: string): FkProviderItem[] {
    return new FkCandidateBuilder(this.getSchema(methodKey)?.FkCandidateRoutes ?? [], this.apiClient).build();
  }

  /** Returns the runtime schema for the named method. */
  public getSchema(methodKey: string): EntitySchema {
    const result = this.schemas[methodKey];
    if (!result) throw new Error('Unknown method: ' + methodKey);
    return result;
  }

  /** Returns a list of candidate objects from the table AERole. */
  portal_candidates_AERole_get(
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
    ParentKey: string,
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_AERole_get(OrderBy, StartIndex, PageSize, filter, withProperties, search, ParentKey),
      requestOptions,
    );
  }
  /** Returns filter tree information for the candidates/AERole endpoint. */
  portal_candidates_AERole_filtertree_post(
    filter: FilterData[],
    parentkey: string,
    inputParameterName: EntityWriteDataSingle,
    requestOptions: ApiRequestOptions = {},
  ): Promise<FilterTreeData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_AERole_filtertree_post(filter, parentkey, inputParameterName),
      requestOptions,
    );
  }
  /** Returns a list of candidate objects from the table Department. */
  portal_candidates_Department_get(
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
    ParentKey: string,
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_Department_get(OrderBy, StartIndex, PageSize, filter, withProperties, search, ParentKey),
      requestOptions,
    );
  }
  /** Returns filter tree information for the candidates/Department endpoint. */
  portal_candidates_Department_filtertree_post(
    filter: FilterData[],
    parentkey: string,
    inputParameterName: EntityWriteDataSingle,
    requestOptions: ApiRequestOptions = {},
  ): Promise<FilterTreeData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_Department_filtertree_post(filter, parentkey, inputParameterName),
      requestOptions,
    );
  }
  /** Returns a list of candidate objects from the table Locality. */
  portal_candidates_Locality_get(
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
    ParentKey: string,
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_Locality_get(OrderBy, StartIndex, PageSize, filter, withProperties, search, ParentKey),
      requestOptions,
    );
  }
  /** Returns filter tree information for the candidates/Locality endpoint. */
  portal_candidates_Locality_filtertree_post(
    filter: FilterData[],
    parentkey: string,
    inputParameterName: EntityWriteDataSingle,
    requestOptions: ApiRequestOptions = {},
  ): Promise<FilterTreeData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_Locality_filtertree_post(filter, parentkey, inputParameterName),
      requestOptions,
    );
  }
  /** Returns a list of candidate objects from the table Org. */
  portal_candidates_Org_get(
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
    ParentKey: string,
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_Org_get(OrderBy, StartIndex, PageSize, filter, withProperties, search, ParentKey),
      requestOptions,
    );
  }
  /** Returns filter tree information for the candidates/Org endpoint. */
  portal_candidates_Org_filtertree_post(
    filter: FilterData[],
    parentkey: string,
    inputParameterName: EntityWriteDataSingle,
    requestOptions: ApiRequestOptions = {},
  ): Promise<FilterTreeData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_Org_filtertree_post(filter, parentkey, inputParameterName),
      requestOptions,
    );
  }
  /** Returns a list of candidate objects from the table Person. */
  portal_candidates_Person_get(
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_Person_get(OrderBy, StartIndex, PageSize, filter, withProperties, search),
      requestOptions,
    );
  }
  /** Returns filter tree information for the candidates/Person endpoint. */
  portal_candidates_Person_filtertree_post(
    filter: FilterData[],
    parentkey: string,
    inputParameterName: EntityWriteDataSingle,
    requestOptions: ApiRequestOptions = {},
  ): Promise<FilterTreeData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_Person_filtertree_post(filter, parentkey, inputParameterName),
      requestOptions,
    );
  }
  /** Returns a list of candidate objects from the table ProfitCenter. */
  portal_candidates_ProfitCenter_get(
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
    ParentKey: string,
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_ProfitCenter_get(OrderBy, StartIndex, PageSize, filter, withProperties, search, ParentKey),
      requestOptions,
    );
  }
  /** Returns filter tree information for the candidates/ProfitCenter endpoint. */
  portal_candidates_ProfitCenter_filtertree_post(
    filter: FilterData[],
    parentkey: string,
    inputParameterName: EntityWriteDataSingle,
    requestOptions: ApiRequestOptions = {},
  ): Promise<FilterTreeData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_ProfitCenter_filtertree_post(filter, parentkey, inputParameterName),
      requestOptions,
    );
  }
  /** Returns a list of candidate objects from the table QAMClassificationLevel. */
  portal_candidates_QAMClassificationLevel_get(
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_QAMClassificationLevel_get(OrderBy, StartIndex, PageSize, filter, withProperties, search),
      requestOptions,
    );
  }
  /** Returns data model information about query options for the candidates/QAMClassificationLevel endpoint. */
  portal_candidates_QAMClassificationLevel_datamodel_get(filter: FilterData[], requestOptions: ApiRequestOptions = {}): Promise<DataModel> {
    return this.apiClient.processRequest(this.methodFactory.portal_candidates_QAMClassificationLevel_datamodel_get(filter), requestOptions);
  }
  /** Returns filter tree information for the candidates/QAMClassificationLevel endpoint. */
  portal_candidates_QAMClassificationLevel_filtertree_post(
    filter: FilterData[],
    parentkey: string,
    inputParameterName: EntityWriteDataSingle,
    requestOptions: ApiRequestOptions = {},
  ): Promise<FilterTreeData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_QAMClassificationLevel_filtertree_post(filter, parentkey, inputParameterName),
      requestOptions,
    );
  }
  /** Returns a list of candidate objects from the table QAMHelperHeadPoI. */
  portal_candidates_QAMHelperHeadPoI_get(
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_QAMHelperHeadPoI_get(OrderBy, StartIndex, PageSize, filter, withProperties, search),
      requestOptions,
    );
  }
  /** Returns data model information about query options for the candidates/QAMHelperHeadPoI endpoint. */
  portal_candidates_QAMHelperHeadPoI_datamodel_get(filter: FilterData[], requestOptions: ApiRequestOptions = {}): Promise<DataModel> {
    return this.apiClient.processRequest(this.methodFactory.portal_candidates_QAMHelperHeadPoI_datamodel_get(filter), requestOptions);
  }
  /** Returns filter tree information for the candidates/QAMHelperHeadPoI endpoint. */
  portal_candidates_QAMHelperHeadPoI_filtertree_post(
    filter: FilterData[],
    parentkey: string,
    inputParameterName: EntityWriteDataSingle,
    requestOptions: ApiRequestOptions = {},
  ): Promise<FilterTreeData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_QAMHelperHeadPoI_filtertree_post(filter, parentkey, inputParameterName),
      requestOptions,
    );
  }
  /** Returns access control information for the specified account or system entitlement. */
  portal_dge_access_get(tablename: string, uid: string, requestOptions: ApiRequestOptions = {}): Promise<TrusteeAccessData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_access_get(tablename, uid), requestOptions);
  }
  portal_dge_access_candidate_get(uidpwo: string, requestOptions: ApiRequestOptions = {}): Promise<PwoCandidateGroupData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_access_candidate_get(uidpwo), requestOptions);
  }
  /** Returns access control information for the specified identity. */
  portal_dge_access_identity_get(uid_person: string, requestOptions: ApiRequestOptions = {}): Promise<TrusteeAccessData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_access_identity_get(uid_person), requestOptions);
  }
  /** Returns access control information for the specified trustee. */
  portal_dge_access_trustee_get(uid_qamtrustee: string, requestOptions: ApiRequestOptions = {}): Promise<TrusteeAccessData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_access_trustee_get(uid_qamtrustee), requestOptions);
  }
  portal_dge_classification_summary_get(requestOptions: ApiRequestOptions = {}): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_classification_summary_get(), requestOptions);
  }
  portal_dge_classificationlevels_get(
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_dge_classificationlevels_get(OrderBy, StartIndex, PageSize, filter, withProperties, search),
      requestOptions,
    );
  }
  portal_dge_filesharerequest_get(uidpwo: string, requestOptions: ApiRequestOptions = {}): Promise<FileShareRequestData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_filesharerequest_get(uidpwo), requestOptions);
  }
  portal_dge_filesharerequest_serverselection_get(
    uidpwo: string,
    name: string,
    requestOptions: ApiRequestOptions = {},
  ): Promise<ServerSelectionResultData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_filesharerequest_serverselection_get(uidpwo, name), requestOptions);
  }
  /** Returns the 10 most active resources owned by the current user. */
  portal_dge_mostactiveresources_get(requestOptions: ApiRequestOptions = {}): Promise<ResourceActivityData[]> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_mostactiveresources_get(), requestOptions);
  }
  /** Returns the 10 trustees with the most activity on resources owned by the current user. */
  portal_dge_mostactivetrustees_get(requestOptions: ApiRequestOptions = {}): Promise<TrusteeActivityData[]> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_mostactivetrustees_get(), requestOptions);
  }
  portal_dge_namepatternresolvers_get(requestOptions: ApiRequestOptions = {}): Promise<NamePatternResolverData[]> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_namepatternresolvers_get(), requestOptions);
  }
  portal_dge_nodes_get(
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_dge_nodes_get(OrderBy, StartIndex, PageSize, filter, withProperties, search),
      requestOptions,
    );
  }
  /** Returns data governance statistics for the current user. */
  portal_dge_personalstats_get(requestOptions: ApiRequestOptions = {}): Promise<PersonalStatsData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_personalstats_get(), requestOptions);
  }
  portal_dge_resources_get(
    uiddugshare: string,
    withblockedinheritance: boolean,
    withindexedsecurity: boolean,
    withactivity: boolean,
    foraccproduct: string,
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
    ParentKey: string,
    owned: string,
    withpolicyviolations: string,
    withoutowner: string,
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_dge_resources_get(
        uiddugshare,
        withblockedinheritance,
        withindexedsecurity,
        withactivity,
        foraccproduct,
        OrderBy,
        StartIndex,
        PageSize,
        filter,
        withProperties,
        search,
        ParentKey,
        owned,
        withpolicyviolations,
        withoutowner,
      ),
      requestOptions,
    );
  }
  portal_dge_resources_byid_get(
    UID_QAMDuG: string,
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
    ParentKey: string,
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_dge_resources_byid_get(
        UID_QAMDuG,
        OrderBy,
        StartIndex,
        PageSize,
        filter,
        withProperties,
        search,
        ParentKey,
      ),
      requestOptions,
    );
  }
  portal_dge_resources_interactive_byid_get(UID_QAMDuG: string, requestOptions: ApiRequestOptions = {}): Promise<InteractiveEntityData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resources_interactive_byid_get(UID_QAMDuG), requestOptions);
  }
  portal_dge_resources_interactive_byid_put(
    UID_QAMDuG: string,
    inputParameterName: InteractiveEntityWriteData,
    requestOptions: ApiRequestOptions = {},
  ): Promise<InteractiveEntityData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_dge_resources_interactive_byid_put(UID_QAMDuG, inputParameterName),
      requestOptions,
    );
  }
  portal_dge_resources_access_get(uiddug: string, requestOptions: ApiRequestOptions = {}): Promise<ResourceAccessData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resources_access_get(uiddug), requestOptions);
  }
  portal_dge_resources_accessanalysis_get(uiddug: string, requestOptions: ApiRequestOptions = {}): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resources_accessanalysis_get(uiddug), requestOptions);
  }
  portal_dge_resources_accesschart_get(uiddug: string, id: string, requestOptions: ApiRequestOptions = {}): Promise<ChartDto> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resources_accesschart_get(uiddug, id), requestOptions);
  }
  portal_dge_resources_activity_get(
    uiddug: string,
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_dge_resources_activity_get(uiddug, OrderBy, StartIndex, PageSize, filter, withProperties, search),
      requestOptions,
    );
  }
  /** Returns the identities having access to this resource, including group expansion */
  portal_dge_resources_identities_get(uiddug: string, requestOptions: ApiRequestOptions = {}): Promise<ResourceAccessExpansionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resources_identities_get(uiddug), requestOptions);
  }
  portal_dge_resources_perceivedowners_get(
    uiddug: string,
    OrderBy: string,
    StartIndex: number,
    PageSize: number,
    filter: FilterData[],
    withProperties: string,
    search: string,
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_dge_resources_perceivedowners_get(uiddug, OrderBy, StartIndex, PageSize, filter, withProperties, search),
      requestOptions,
    );
  }
  portal_dge_resources_reports_get(uiddug: string, requestOptions: ApiRequestOptions = {}): Promise<ResourceReportData[]> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resources_reports_get(uiddug), requestOptions);
  }
  /** Submits a modification or removal request to the DGE administrator. */
  portal_dge_resources_request_post(
    uiddug: string,
    inputParameterName: ChangeRequestInput,
    requestOptions: ApiRequestOptions = {},
  ): Promise<void> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resources_request_post(uiddug, inputParameterName), requestOptions);
  }
  portal_dge_resources_trusteeandpolicyrightset_get(
    uiddug: string,
    requestOptions: ApiRequestOptions = {},
  ): Promise<AssignedResourceAccessData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resources_trusteeandpolicyrightset_get(uiddug), requestOptions);
  }
  /** Returns data model information about query options for the dge/resources endpoint. */
  portal_dge_resources_datamodel_get(filter: FilterData[], requestOptions: ApiRequestOptions = {}): Promise<DataModel> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resources_datamodel_get(filter), requestOptions);
  }
  portal_dge_resourcetree_get(uidaccproduct: string, requestOptions: ApiRequestOptions = {}): Promise<TreeNode[]> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resourcetree_get(uidaccproduct), requestOptions);
  }
  portal_dge_serverselectors_get(requestOptions: ApiRequestOptions = {}): Promise<ServerSelectionScriptData[]> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_serverselectors_get(), requestOptions);
  }
  /** Returns the trustees associated with the specified identity. */
  portal_dge_trustees_identity_get(uid_person: string, requestOptions: ApiRequestOptions = {}): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_trustees_identity_get(uid_person), requestOptions);
  }
  /** Returns the list of known trustee types. */
  portal_dge_trustees_types_get(requestOptions: ApiRequestOptions = {}): Promise<LimitedValueData[]> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_trustees_types_get(), requestOptions);
  }
  portal_dgeconfig_get(requestOptions: ApiRequestOptions = {}): Promise<DgeConfigData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dgeconfig_get(), requestOptions);
  }
}
export interface portal_candidates_AERole_get_args {
  /** ORDER BY clause */ OrderBy?: string;
  /** Index of first entity to return */ StartIndex?: number;
  /** Number of entities to return */ PageSize?: number;
  /** Filter definition */ filter?: FilterData[];
  /** Comma-seperated list of properties to include in the result set. Prefix the list with the - character to exclude the default properties. */ withProperties?: string;
  /** Search term */ search?: string;
  /** Parent object (UID_ParentAERole) */ ParentKey?: string;
}

export interface portal_candidates_AERole_filtertree_post_args {
  /** Filter definition */ filter?: FilterData[];
  /** Parent key */ parentkey?: string;
}

export interface portal_candidates_Department_get_args {
  /** ORDER BY clause */ OrderBy?: string;
  /** Index of first entity to return */ StartIndex?: number;
  /** Number of entities to return */ PageSize?: number;
  /** Filter definition */ filter?: FilterData[];
  /** Comma-seperated list of properties to include in the result set. Prefix the list with the - character to exclude the default properties. */ withProperties?: string;
  /** Search term */ search?: string;
  /** Parent object (UID_ParentDepartment) */ ParentKey?: string;
}

export interface portal_candidates_Department_filtertree_post_args {
  /** Filter definition */ filter?: FilterData[];
  /** Parent key */ parentkey?: string;
}

export interface portal_candidates_Locality_get_args {
  /** ORDER BY clause */ OrderBy?: string;
  /** Index of first entity to return */ StartIndex?: number;
  /** Number of entities to return */ PageSize?: number;
  /** Filter definition */ filter?: FilterData[];
  /** Comma-seperated list of properties to include in the result set. Prefix the list with the - character to exclude the default properties. */ withProperties?: string;
  /** Search term */ search?: string;
  /** Parent object (UID_ParentLocality) */ ParentKey?: string;
}

export interface portal_candidates_Locality_filtertree_post_args {
  /** Filter definition */ filter?: FilterData[];
  /** Parent key */ parentkey?: string;
}

export interface portal_candidates_Org_get_args {
  /** ORDER BY clause */ OrderBy?: string;
  /** Index of first entity to return */ StartIndex?: number;
  /** Number of entities to return */ PageSize?: number;
  /** Filter definition */ filter?: FilterData[];
  /** Comma-seperated list of properties to include in the result set. Prefix the list with the - character to exclude the default properties. */ withProperties?: string;
  /** Search term */ search?: string;
  /** Parent object (UID_ParentOrg) */ ParentKey?: string;
}

export interface portal_candidates_Org_filtertree_post_args {
  /** Filter definition */ filter?: FilterData[];
  /** Parent key */ parentkey?: string;
}

export interface portal_candidates_Person_get_args {
  /** ORDER BY clause */ OrderBy?: string;
  /** Index of first entity to return */ StartIndex?: number;
  /** Number of entities to return */ PageSize?: number;
  /** Filter definition */ filter?: FilterData[];
  /** Comma-seperated list of properties to include in the result set. Prefix the list with the - character to exclude the default properties. */ withProperties?: string;
  /** Search term */ search?: string;
}

export interface portal_candidates_Person_filtertree_post_args {
  /** Filter definition */ filter?: FilterData[];
  /** Parent key */ parentkey?: string;
}

export interface portal_candidates_ProfitCenter_get_args {
  /** ORDER BY clause */ OrderBy?: string;
  /** Index of first entity to return */ StartIndex?: number;
  /** Number of entities to return */ PageSize?: number;
  /** Filter definition */ filter?: FilterData[];
  /** Comma-seperated list of properties to include in the result set. Prefix the list with the - character to exclude the default properties. */ withProperties?: string;
  /** Search term */ search?: string;
  /** Parent object (UID_ParentProfitCenter) */ ParentKey?: string;
}

export interface portal_candidates_ProfitCenter_filtertree_post_args {
  /** Filter definition */ filter?: FilterData[];
  /** Parent key */ parentkey?: string;
}

export interface portal_candidates_QAMClassificationLevel_get_args {
  /** ORDER BY clause */ OrderBy?: string;
  /** Index of first entity to return */ StartIndex?: number;
  /** Number of entities to return */ PageSize?: number;
  /** Filter definition */ filter?: FilterData[];
  /** Comma-seperated list of properties to include in the result set. Prefix the list with the - character to exclude the default properties. */ withProperties?: string;
  /** Search term */ search?: string;
}

export interface portal_candidates_QAMClassificationLevel_datamodel_get_args {
  /** Filter definition */ filter?: FilterData[];
}

export interface portal_candidates_QAMClassificationLevel_filtertree_post_args {
  /** Filter definition */ filter?: FilterData[];
  /** Parent key */ parentkey?: string;
}

export interface portal_candidates_QAMHelperHeadPoI_get_args {
  /** ORDER BY clause */ OrderBy?: string;
  /** Index of first entity to return */ StartIndex?: number;
  /** Number of entities to return */ PageSize?: number;
  /** Filter definition */ filter?: FilterData[];
  /** Comma-seperated list of properties to include in the result set. Prefix the list with the - character to exclude the default properties. */ withProperties?: string;
  /** Search term */ search?: string;
}

export interface portal_candidates_QAMHelperHeadPoI_datamodel_get_args {
  /** Filter definition */ filter?: FilterData[];
}

export interface portal_candidates_QAMHelperHeadPoI_filtertree_post_args {
  /** Filter definition */ filter?: FilterData[];
  /** Parent key */ parentkey?: string;
}

export interface portal_dge_classificationlevels_get_args {
  /** ORDER BY clause */ OrderBy?: string;
  /** Index of first entity to return */ StartIndex?: number;
  /** Number of entities to return */ PageSize?: number;
  /** Filter definition */ filter?: FilterData[];
  /** Comma-seperated list of properties to include in the result set. Prefix the list with the - character to exclude the default properties. */ withProperties?: string;
  /** Search term */ search?: string;
}

export interface portal_dge_nodes_get_args {
  /** ORDER BY clause */ OrderBy?: string;
  /** Index of first entity to return */ StartIndex?: number;
  /** Number of entities to return */ PageSize?: number;
  /** Filter definition */ filter?: FilterData[];
  /** Comma-seperated list of properties to include in the result set. Prefix the list with the - character to exclude the default properties. */ withProperties?: string;
  /** Search term */ search?: string;
}

export interface portal_dge_resources_get_args {
  /** Filters related resources of the specified share. */ uiddugshare?: string;
  /** Filters resources with blocked inheritance. */ withblockedinheritance?: boolean;
  /** Filters resources with indexed security information. */ withindexedsecurity?: boolean;
  /** Filters resources with recent activity. */ withactivity?: boolean;
  /** Filters resources available in the IT Shop for the service item; the URL parameter contains the identifier of the service item */ foraccproduct?: string;
  /** ORDER BY clause */ OrderBy?: string;
  /** Index of first entity to return */ StartIndex?: number;
  /** Number of entities to return */ PageSize?: number;
  /** Filter definition */ filter?: FilterData[];
  /** Comma-seperated list of properties to include in the result set. Prefix the list with the - character to exclude the default properties. */ withProperties?: string;
  /** Search term */ search?: string;
  /** Parent object (UID_QAMDuGParent) */ ParentKey?: string;
  /** Filters resources owned by the current user */ owned?: string;
  /** Filters resources having policy violations */ withpolicyviolations?: string;
  /** Filters resources without owners */ withoutowner?: string;
}

export interface portal_dge_resources_byid_get_args {
  /** ORDER BY clause */ OrderBy?: string;
  /** Index of first entity to return */ StartIndex?: number;
  /** Number of entities to return */ PageSize?: number;
  /** Filter definition */ filter?: FilterData[];
  /** Comma-seperated list of properties to include in the result set. Prefix the list with the - character to exclude the default properties. */ withProperties?: string;
  /** Search term */ search?: string;
  /** Parent object (UID_QAMDuGParent) */ ParentKey?: string;
}

export interface portal_dge_resources_activity_get_args {
  /** ORDER BY clause */ OrderBy?: string;
  /** Index of first entity to return */ StartIndex?: number;
  /** Number of entities to return */ PageSize?: number;
  /** Filter definition */ filter?: FilterData[];
  /** Comma-seperated list of properties to include in the result set. Prefix the list with the - character to exclude the default properties. */ withProperties?: string;
  /** Search term */ search?: string;
}

export interface portal_dge_resources_perceivedowners_get_args {
  /** ORDER BY clause */ OrderBy?: string;
  /** Index of first entity to return */ StartIndex?: number;
  /** Number of entities to return */ PageSize?: number;
  /** Filter definition */ filter?: FilterData[];
  /** Comma-seperated list of properties to include in the result set. Prefix the list with the - character to exclude the default properties. */ withProperties?: string;
  /** Search term */ search?: string;
}

export interface portal_dge_resources_datamodel_get_args {
  /** Filter definition */ filter?: FilterData[];
}

export class V2ApiClientMethodFactory {
  portal_candidates_AERole_get(
    options: portal_candidates_AERole_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/candidates/AERole',
      parameters: MethodDefinition.MakeQueryParameters(options, []),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_AERole_filtertree_post(
    inputParameterName: EntityWriteDataSingle,
    options: portal_candidates_AERole_filtertree_post_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<FilterTreeData> {
    return {
      path: '/portal/candidates/AERole/filtertree',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'inputParameterName',
          value: inputParameterName,
          required: true,
          in: 'body',
        },
      ]),
      method: 'POST',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_Department_get(
    options: portal_candidates_Department_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/candidates/Department',
      parameters: MethodDefinition.MakeQueryParameters(options, []),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_Department_filtertree_post(
    inputParameterName: EntityWriteDataSingle,
    options: portal_candidates_Department_filtertree_post_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<FilterTreeData> {
    return {
      path: '/portal/candidates/Department/filtertree',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'inputParameterName',
          value: inputParameterName,
          required: true,
          in: 'body',
        },
      ]),
      method: 'POST',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_Locality_get(
    options: portal_candidates_Locality_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/candidates/Locality',
      parameters: MethodDefinition.MakeQueryParameters(options, []),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_Locality_filtertree_post(
    inputParameterName: EntityWriteDataSingle,
    options: portal_candidates_Locality_filtertree_post_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<FilterTreeData> {
    return {
      path: '/portal/candidates/Locality/filtertree',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'inputParameterName',
          value: inputParameterName,
          required: true,
          in: 'body',
        },
      ]),
      method: 'POST',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_Org_get(
    options: portal_candidates_Org_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/candidates/Org',
      parameters: MethodDefinition.MakeQueryParameters(options, []),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_Org_filtertree_post(
    inputParameterName: EntityWriteDataSingle,
    options: portal_candidates_Org_filtertree_post_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<FilterTreeData> {
    return {
      path: '/portal/candidates/Org/filtertree',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'inputParameterName',
          value: inputParameterName,
          required: true,
          in: 'body',
        },
      ]),
      method: 'POST',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_Person_get(
    options: portal_candidates_Person_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/candidates/Person',
      parameters: MethodDefinition.MakeQueryParameters(options, []),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_Person_filtertree_post(
    inputParameterName: EntityWriteDataSingle,
    options: portal_candidates_Person_filtertree_post_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<FilterTreeData> {
    return {
      path: '/portal/candidates/Person/filtertree',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'inputParameterName',
          value: inputParameterName,
          required: true,
          in: 'body',
        },
      ]),
      method: 'POST',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_ProfitCenter_get(
    options: portal_candidates_ProfitCenter_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/candidates/ProfitCenter',
      parameters: MethodDefinition.MakeQueryParameters(options, []),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_ProfitCenter_filtertree_post(
    inputParameterName: EntityWriteDataSingle,
    options: portal_candidates_ProfitCenter_filtertree_post_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<FilterTreeData> {
    return {
      path: '/portal/candidates/ProfitCenter/filtertree',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'inputParameterName',
          value: inputParameterName,
          required: true,
          in: 'body',
        },
      ]),
      method: 'POST',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_QAMClassificationLevel_get(
    options: portal_candidates_QAMClassificationLevel_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/candidates/QAMClassificationLevel',
      parameters: MethodDefinition.MakeQueryParameters(options, []),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_QAMClassificationLevel_datamodel_get(
    options: portal_candidates_QAMClassificationLevel_datamodel_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<DataModel> {
    return {
      path: '/portal/candidates/QAMClassificationLevel/datamodel',
      parameters: MethodDefinition.MakeQueryParameters(options, []),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_QAMClassificationLevel_filtertree_post(
    inputParameterName: EntityWriteDataSingle,
    options: portal_candidates_QAMClassificationLevel_filtertree_post_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<FilterTreeData> {
    return {
      path: '/portal/candidates/QAMClassificationLevel/filtertree',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'inputParameterName',
          value: inputParameterName,
          required: true,
          in: 'body',
        },
      ]),
      method: 'POST',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_QAMHelperHeadPoI_get(
    options: portal_candidates_QAMHelperHeadPoI_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/candidates/QAMHelperHeadPoI',
      parameters: MethodDefinition.MakeQueryParameters(options, []),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_QAMHelperHeadPoI_datamodel_get(
    options: portal_candidates_QAMHelperHeadPoI_datamodel_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<DataModel> {
    return {
      path: '/portal/candidates/QAMHelperHeadPoI/datamodel',
      parameters: MethodDefinition.MakeQueryParameters(options, []),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_candidates_QAMHelperHeadPoI_filtertree_post(
    inputParameterName: EntityWriteDataSingle,
    options: portal_candidates_QAMHelperHeadPoI_filtertree_post_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<FilterTreeData> {
    return {
      path: '/portal/candidates/QAMHelperHeadPoI/filtertree',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'inputParameterName',
          value: inputParameterName,
          required: true,
          in: 'body',
        },
      ]),
      method: 'POST',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_access_get(
    /** Type of the object */ tablename: string,
    /** Unique identifier */ uid: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<TrusteeAccessData> {
    return {
      path: '/portal/dge/access/{tablename}/{uid}',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'tablename',
          value: tablename,
          required: true,
          in: 'path',
        },
        {
          name: 'uid',
          value: uid,
          required: true,
          in: 'path',
        },
      ]),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_access_candidate_get(
    /** Unique request identifier */ uidpwo: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<PwoCandidateGroupData> {
    return {
      path: '/portal/dge/access/candidate/{uidpwo}',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'uidpwo',
          value: uidpwo,
          required: true,
          in: 'path',
        },
      ]),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_access_identity_get(
    /** Unique identity identifier */ uid_person: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<TrusteeAccessData> {
    return {
      path: '/portal/dge/access/identity/{uid_person}',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'uid_person',
          value: uid_person,
          required: true,
          in: 'path',
        },
      ]),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_access_trustee_get(
    /** Unique trustee identifier */ uid_qamtrustee: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<TrusteeAccessData> {
    return {
      path: '/portal/dge/access/trustee/{uid_qamtrustee}',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'uid_qamtrustee',
          value: uid_qamtrustee,
          required: true,
          in: 'path',
        },
      ]),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_classification_summary_get(options: {} = {}, requestOptions: ApiRequestOptions = {}): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/dge/classification/summary',
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_classificationlevels_get(
    options: portal_dge_classificationlevels_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/dge/classificationlevels',
      parameters: MethodDefinition.MakeQueryParameters(options, []),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_filesharerequest_get(
    /** Unique request identifier */ uidpwo: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<FileShareRequestData> {
    return {
      path: '/portal/dge/filesharerequest/{uidpwo}',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'uidpwo',
          value: uidpwo,
          required: true,
          in: 'path',
        },
      ]),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_filesharerequest_serverselection_get(
    /** Unique request identifier */ uidpwo: string,
    /** Selection script name */ name: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<ServerSelectionResultData> {
    return {
      path: '/portal/dge/filesharerequest/{uidpwo}/serverselection/{name}',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'uidpwo',
          value: uidpwo,
          required: true,
          in: 'path',
        },
        {
          name: 'name',
          value: name,
          required: true,
          in: 'path',
        },
      ]),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_mostactiveresources_get(options: {} = {}, requestOptions: ApiRequestOptions = {}): MethodDescriptor<ResourceActivityData[]> {
    return {
      path: '/portal/dge/mostactiveresources',
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_mostactivetrustees_get(options: {} = {}, requestOptions: ApiRequestOptions = {}): MethodDescriptor<TrusteeActivityData[]> {
    return {
      path: '/portal/dge/mostactivetrustees',
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_namepatternresolvers_get(
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<NamePatternResolverData[]> {
    return {
      path: '/portal/dge/namepatternresolvers',
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_nodes_get(
    options: portal_dge_nodes_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/dge/nodes',
      parameters: MethodDefinition.MakeQueryParameters(options, []),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_personalstats_get(options: {} = {}, requestOptions: ApiRequestOptions = {}): MethodDescriptor<PersonalStatsData> {
    return {
      path: '/portal/dge/personalstats',
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_get(
    options: portal_dge_resources_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/dge/resources',
      parameters: MethodDefinition.MakeQueryParameters(options, []),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_byid_get(
    /** Unique resource identifier */ UID_QAMDuG: string,
    options: portal_dge_resources_byid_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/dge/resources/{UID_QAMDuG}',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'UID_QAMDuG',
          value: UID_QAMDuG,
          required: true,
          in: 'path',
        },
      ]),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_interactive_byid_get(
    /** Unique resource identifier */ UID_QAMDuG: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<InteractiveEntityData> {
    return {
      path: '/portal/dge/resources/{UID_QAMDuG}/interactive',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'UID_QAMDuG',
          value: UID_QAMDuG,
          required: true,
          in: 'path',
        },
      ]),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_interactive_byid_put(
    /** Unique resource identifier */ UID_QAMDuG: string,
    inputParameterName: InteractiveEntityWriteData,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<InteractiveEntityData> {
    return {
      path: '/portal/dge/resources/{UID_QAMDuG}/interactive',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'UID_QAMDuG',
          value: UID_QAMDuG,
          required: true,
          in: 'path',
        },
        {
          name: 'inputParameterName',
          value: inputParameterName,
          required: true,
          in: 'body',
        },
      ]),
      method: 'PUT',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_access_get(
    /** Unique resource identifier */ uiddug: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<ResourceAccessData> {
    return {
      path: '/portal/dge/resources/{uiddug}/access',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'uiddug',
          value: uiddug,
          required: true,
          in: 'path',
        },
      ]),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_accessanalysis_get(
    /** Unique resource identifier */ uiddug: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/dge/resources/{uiddug}/accessanalysis',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'uiddug',
          value: uiddug,
          required: true,
          in: 'path',
        },
      ]),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_accesschart_get(
    /** Unique resource identifier */ uiddug: string,
    /** Query identifier */ id: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<ChartDto> {
    return {
      path: '/portal/dge/resources/{uiddug}/accesschart/{id}',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'uiddug',
          value: uiddug,
          required: true,
          in: 'path',
        },
        {
          name: 'id',
          value: id,
          required: true,
          in: 'path',
        },
      ]),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_activity_get(
    /** Unique resource identifier */ uiddug: string,
    options: portal_dge_resources_activity_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/dge/resources/{uiddug}/activity',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'uiddug',
          value: uiddug,
          required: true,
          in: 'path',
        },
      ]),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_identities_get(
    /** Unique resource identifier */ uiddug: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<ResourceAccessExpansionData> {
    return {
      path: '/portal/dge/resources/{uiddug}/identities',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'uiddug',
          value: uiddug,
          required: true,
          in: 'path',
        },
      ]),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_perceivedowners_get(
    /** Unique resource identifier */ uiddug: string,
    options: portal_dge_resources_perceivedowners_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/dge/resources/{uiddug}/perceivedowners',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'uiddug',
          value: uiddug,
          required: true,
          in: 'path',
        },
      ]),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_reports_get(
    /** Unique resource identifier */ uiddug: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<ResourceReportData[]> {
    return {
      path: '/portal/dge/resources/{uiddug}/reports',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'uiddug',
          value: uiddug,
          required: true,
          in: 'path',
        },
      ]),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_request_post(
    /** Unique resource identifier */ uiddug: string,
    inputParameterName: ChangeRequestInput,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<void> {
    return {
      path: '/portal/dge/resources/{uiddug}/request',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'uiddug',
          value: uiddug,
          required: true,
          in: 'path',
        },
        {
          name: 'inputParameterName',
          value: inputParameterName,
          required: true,
          in: 'body',
        },
      ]),
      method: 'POST',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_trusteeandpolicyrightset_get(
    /** Unique resource identifier */ uiddug: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<AssignedResourceAccessData> {
    return {
      path: '/portal/dge/resources/{uiddug}/trusteeandpolicyrightset',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'uiddug',
          value: uiddug,
          required: true,
          in: 'path',
        },
      ]),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resources_datamodel_get(
    options: portal_dge_resources_datamodel_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<DataModel> {
    return {
      path: '/portal/dge/resources/datamodel',
      parameters: MethodDefinition.MakeQueryParameters(options, []),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_resourcetree_get(
    uidaccproduct: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<TreeNode[]> {
    return {
      path: '/portal/dge/resourcetree/{uidaccproduct}',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'uidaccproduct',
          value: uidaccproduct,
          required: true,
          in: 'path',
        },
      ]),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_serverselectors_get(options: {} = {}, requestOptions: ApiRequestOptions = {}): MethodDescriptor<ServerSelectionScriptData[]> {
    return {
      path: '/portal/dge/serverselectors',
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_trustees_identity_get(
    /** Unique identity identifier */ uid_person: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): MethodDescriptor<EntityCollectionData> {
    return {
      path: '/portal/dge/trustees/identity/{uid_person}',
      parameters: MethodDefinition.MakeQueryParameters(options, [
        {
          name: 'uid_person',
          value: uid_person,
          required: true,
          in: 'path',
        },
      ]),
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dge_trustees_types_get(options: {} = {}, requestOptions: ApiRequestOptions = {}): MethodDescriptor<LimitedValueData[]> {
    return {
      path: '/portal/dge/trustees/types',
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
  portal_dgeconfig_get(options: {} = {}, requestOptions: ApiRequestOptions = {}): MethodDescriptor<DgeConfigData> {
    return {
      path: '/portal/dgeconfig',
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    };
  }
}

export class V2Client {
  private readonly methodFactory = new V2ApiClientMethodFactory();

  constructor(
    private readonly apiClient: ApiClient,
    private schemaProvider?: { readonly schemas: { [key: string]: EntitySchema } },
  ) {
    if (!apiClient) {
      throw new Error('The value for the apiClient parameter is undefined.');
    }
  }

  public get schemas(): { [key: string]: EntitySchema } {
    if (!this.schemaProvider) {
      throw new Error('The schema has not been loaded.');
    }
    return this.schemaProvider.schemas;
  }

  public async loadSchema(language?: string): Promise<void> {
    const headers = {};
    if (language) headers['Accept-Language'] = language;

    const dtos = (await this.apiClient.processRequest({
      path: '/imx/entityschema',
      parameters: [],
      method: 'GET',
      headers: headers,
      credentials: 'include',
      observe: 'response',
      responseType: 'json',
    })) as { [key: string]: MethodSchemaDto };

    const schemas: { [key: string]: EntitySchema } = {};

    for (var key in dtos) {
      const dto = dtos[key];
      const columns = dto.Properties ?? {};
      columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
      columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

      schemas[key] = {
        TypeName: dto.TypeName,
        DisplayPattern: new DisplayPattern(dto.DisplayPattern ?? ''),
        Display: dto.Display,
        DisplaySingular: dto.DisplaySingular,
        FkCandidateRoutes: dto.FkCandidateRoutes,
        Columns: columns,
      };
    }
    this.schemaProvider = { schemas: schemas };
  }

  public getFkProviderItems(methodKey: string): FkProviderItem[] {
    return new FkCandidateBuilder(this.getSchema(methodKey)?.FkCandidateRoutes ?? [], this.apiClient).build();
  }

  /** Returns the runtime schema for the named method. */
  public getSchema(methodKey: string): EntitySchema {
    const result = this.schemas[methodKey];
    if (!result) throw new Error('Unknown method: ' + methodKey);
    return result;
  }

  /** Returns a list of candidate objects from the table AERole. */
  portal_candidates_AERole_get(
    options: portal_candidates_AERole_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_candidates_AERole_get(options), requestOptions);
  }
  /** Returns filter tree information for the candidates/AERole endpoint. */
  portal_candidates_AERole_filtertree_post(
    inputParameterName: EntityWriteDataSingle,
    options: portal_candidates_AERole_filtertree_post_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<FilterTreeData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_AERole_filtertree_post(inputParameterName, options),
      requestOptions,
    );
  }
  /** Returns a list of candidate objects from the table Department. */
  portal_candidates_Department_get(
    options: portal_candidates_Department_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_candidates_Department_get(options), requestOptions);
  }
  /** Returns filter tree information for the candidates/Department endpoint. */
  portal_candidates_Department_filtertree_post(
    inputParameterName: EntityWriteDataSingle,
    options: portal_candidates_Department_filtertree_post_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<FilterTreeData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_Department_filtertree_post(inputParameterName, options),
      requestOptions,
    );
  }
  /** Returns a list of candidate objects from the table Locality. */
  portal_candidates_Locality_get(
    options: portal_candidates_Locality_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_candidates_Locality_get(options), requestOptions);
  }
  /** Returns filter tree information for the candidates/Locality endpoint. */
  portal_candidates_Locality_filtertree_post(
    inputParameterName: EntityWriteDataSingle,
    options: portal_candidates_Locality_filtertree_post_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<FilterTreeData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_Locality_filtertree_post(inputParameterName, options),
      requestOptions,
    );
  }
  /** Returns a list of candidate objects from the table Org. */
  portal_candidates_Org_get(
    options: portal_candidates_Org_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_candidates_Org_get(options), requestOptions);
  }
  /** Returns filter tree information for the candidates/Org endpoint. */
  portal_candidates_Org_filtertree_post(
    inputParameterName: EntityWriteDataSingle,
    options: portal_candidates_Org_filtertree_post_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<FilterTreeData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_Org_filtertree_post(inputParameterName, options),
      requestOptions,
    );
  }
  /** Returns a list of candidate objects from the table Person. */
  portal_candidates_Person_get(
    options: portal_candidates_Person_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_candidates_Person_get(options), requestOptions);
  }
  /** Returns filter tree information for the candidates/Person endpoint. */
  portal_candidates_Person_filtertree_post(
    inputParameterName: EntityWriteDataSingle,
    options: portal_candidates_Person_filtertree_post_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<FilterTreeData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_Person_filtertree_post(inputParameterName, options),
      requestOptions,
    );
  }
  /** Returns a list of candidate objects from the table ProfitCenter. */
  portal_candidates_ProfitCenter_get(
    options: portal_candidates_ProfitCenter_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_candidates_ProfitCenter_get(options), requestOptions);
  }
  /** Returns filter tree information for the candidates/ProfitCenter endpoint. */
  portal_candidates_ProfitCenter_filtertree_post(
    inputParameterName: EntityWriteDataSingle,
    options: portal_candidates_ProfitCenter_filtertree_post_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<FilterTreeData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_ProfitCenter_filtertree_post(inputParameterName, options),
      requestOptions,
    );
  }
  /** Returns a list of candidate objects from the table QAMClassificationLevel. */
  portal_candidates_QAMClassificationLevel_get(
    options: portal_candidates_QAMClassificationLevel_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_candidates_QAMClassificationLevel_get(options), requestOptions);
  }
  /** Returns data model information about query options for the candidates/QAMClassificationLevel endpoint. */
  portal_candidates_QAMClassificationLevel_datamodel_get(
    options: portal_candidates_QAMClassificationLevel_datamodel_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<DataModel> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_QAMClassificationLevel_datamodel_get(options),
      requestOptions,
    );
  }
  /** Returns filter tree information for the candidates/QAMClassificationLevel endpoint. */
  portal_candidates_QAMClassificationLevel_filtertree_post(
    inputParameterName: EntityWriteDataSingle,
    options: portal_candidates_QAMClassificationLevel_filtertree_post_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<FilterTreeData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_QAMClassificationLevel_filtertree_post(inputParameterName, options),
      requestOptions,
    );
  }
  /** Returns a list of candidate objects from the table QAMHelperHeadPoI. */
  portal_candidates_QAMHelperHeadPoI_get(
    options: portal_candidates_QAMHelperHeadPoI_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_candidates_QAMHelperHeadPoI_get(options), requestOptions);
  }
  /** Returns data model information about query options for the candidates/QAMHelperHeadPoI endpoint. */
  portal_candidates_QAMHelperHeadPoI_datamodel_get(
    options: portal_candidates_QAMHelperHeadPoI_datamodel_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<DataModel> {
    return this.apiClient.processRequest(this.methodFactory.portal_candidates_QAMHelperHeadPoI_datamodel_get(options), requestOptions);
  }
  /** Returns filter tree information for the candidates/QAMHelperHeadPoI endpoint. */
  portal_candidates_QAMHelperHeadPoI_filtertree_post(
    inputParameterName: EntityWriteDataSingle,
    options: portal_candidates_QAMHelperHeadPoI_filtertree_post_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<FilterTreeData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_candidates_QAMHelperHeadPoI_filtertree_post(inputParameterName, options),
      requestOptions,
    );
  }
  /** Returns access control information for the specified account or system entitlement. */
  portal_dge_access_get(
    /** Type of the object */ tablename: string,
    /** Unique identifier */ uid: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<TrusteeAccessData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_access_get(tablename, uid, options), requestOptions);
  }
  portal_dge_access_candidate_get(
    /** Unique request identifier */ uidpwo: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<PwoCandidateGroupData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_access_candidate_get(uidpwo, options), requestOptions);
  }
  /** Returns access control information for the specified identity. */
  portal_dge_access_identity_get(
    /** Unique identity identifier */ uid_person: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<TrusteeAccessData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_access_identity_get(uid_person, options), requestOptions);
  }
  /** Returns access control information for the specified trustee. */
  portal_dge_access_trustee_get(
    /** Unique trustee identifier */ uid_qamtrustee: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<TrusteeAccessData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_access_trustee_get(uid_qamtrustee, options), requestOptions);
  }
  portal_dge_classification_summary_get(options: {} = {}, requestOptions: ApiRequestOptions = {}): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_classification_summary_get(options), requestOptions);
  }
  portal_dge_classificationlevels_get(
    options: portal_dge_classificationlevels_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_classificationlevels_get(options), requestOptions);
  }
  portal_dge_filesharerequest_get(
    /** Unique request identifier */ uidpwo: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<FileShareRequestData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_filesharerequest_get(uidpwo, options), requestOptions);
  }
  portal_dge_filesharerequest_serverselection_get(
    /** Unique request identifier */ uidpwo: string,
    /** Selection script name */ name: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<ServerSelectionResultData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_dge_filesharerequest_serverselection_get(uidpwo, name, options),
      requestOptions,
    );
  }
  /** Returns the 10 most active resources owned by the current user. */
  portal_dge_mostactiveresources_get(options: {} = {}, requestOptions: ApiRequestOptions = {}): Promise<ResourceActivityData[]> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_mostactiveresources_get(options), requestOptions);
  }
  /** Returns the 10 trustees with the most activity on resources owned by the current user. */
  portal_dge_mostactivetrustees_get(options: {} = {}, requestOptions: ApiRequestOptions = {}): Promise<TrusteeActivityData[]> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_mostactivetrustees_get(options), requestOptions);
  }
  portal_dge_namepatternresolvers_get(options: {} = {}, requestOptions: ApiRequestOptions = {}): Promise<NamePatternResolverData[]> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_namepatternresolvers_get(options), requestOptions);
  }
  portal_dge_nodes_get(options: portal_dge_nodes_get_args = {}, requestOptions: ApiRequestOptions = {}): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_nodes_get(options), requestOptions);
  }
  /** Returns data governance statistics for the current user. */
  portal_dge_personalstats_get(options: {} = {}, requestOptions: ApiRequestOptions = {}): Promise<PersonalStatsData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_personalstats_get(options), requestOptions);
  }
  portal_dge_resources_get(
    options: portal_dge_resources_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resources_get(options), requestOptions);
  }
  portal_dge_resources_byid_get(
    /** Unique resource identifier */ UID_QAMDuG: string,
    options: portal_dge_resources_byid_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resources_byid_get(UID_QAMDuG, options), requestOptions);
  }
  portal_dge_resources_interactive_byid_get(
    /** Unique resource identifier */ UID_QAMDuG: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<InteractiveEntityData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resources_interactive_byid_get(UID_QAMDuG, options), requestOptions);
  }
  portal_dge_resources_interactive_byid_put(
    /** Unique resource identifier */ UID_QAMDuG: string,
    inputParameterName: InteractiveEntityWriteData,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<InteractiveEntityData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_dge_resources_interactive_byid_put(UID_QAMDuG, inputParameterName, options),
      requestOptions,
    );
  }
  portal_dge_resources_access_get(
    /** Unique resource identifier */ uiddug: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<ResourceAccessData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resources_access_get(uiddug, options), requestOptions);
  }
  portal_dge_resources_accessanalysis_get(
    /** Unique resource identifier */ uiddug: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resources_accessanalysis_get(uiddug, options), requestOptions);
  }
  portal_dge_resources_accesschart_get(
    /** Unique resource identifier */ uiddug: string,
    /** Query identifier */ id: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<ChartDto> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resources_accesschart_get(uiddug, id, options), requestOptions);
  }
  portal_dge_resources_activity_get(
    /** Unique resource identifier */ uiddug: string,
    options: portal_dge_resources_activity_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resources_activity_get(uiddug, options), requestOptions);
  }
  /** Returns the identities having access to this resource, including group expansion */
  portal_dge_resources_identities_get(
    /** Unique resource identifier */ uiddug: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<ResourceAccessExpansionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resources_identities_get(uiddug, options), requestOptions);
  }
  portal_dge_resources_perceivedowners_get(
    /** Unique resource identifier */ uiddug: string,
    options: portal_dge_resources_perceivedowners_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resources_perceivedowners_get(uiddug, options), requestOptions);
  }
  portal_dge_resources_reports_get(
    /** Unique resource identifier */ uiddug: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<ResourceReportData[]> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resources_reports_get(uiddug, options), requestOptions);
  }
  /** Submits a modification or removal request to the DGE administrator. */
  portal_dge_resources_request_post(
    /** Unique resource identifier */ uiddug: string,
    inputParameterName: ChangeRequestInput,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<void> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_dge_resources_request_post(uiddug, inputParameterName, options),
      requestOptions,
    );
  }
  portal_dge_resources_trusteeandpolicyrightset_get(
    /** Unique resource identifier */ uiddug: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<AssignedResourceAccessData> {
    return this.apiClient.processRequest(
      this.methodFactory.portal_dge_resources_trusteeandpolicyrightset_get(uiddug, options),
      requestOptions,
    );
  }
  /** Returns data model information about query options for the dge/resources endpoint. */
  portal_dge_resources_datamodel_get(
    options: portal_dge_resources_datamodel_get_args = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<DataModel> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resources_datamodel_get(options), requestOptions);
  }
  portal_dge_resourcetree_get(uidaccproduct: string, options: {} = {}, requestOptions: ApiRequestOptions = {}): Promise<TreeNode[]> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_resourcetree_get(uidaccproduct, options), requestOptions);
  }
  portal_dge_serverselectors_get(options: {} = {}, requestOptions: ApiRequestOptions = {}): Promise<ServerSelectionScriptData[]> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_serverselectors_get(options), requestOptions);
  }
  /** Returns the trustees associated with the specified identity. */
  portal_dge_trustees_identity_get(
    /** Unique identity identifier */ uid_person: string,
    options: {} = {},
    requestOptions: ApiRequestOptions = {},
  ): Promise<EntityCollectionData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_trustees_identity_get(uid_person, options), requestOptions);
  }
  /** Returns the list of known trustee types. */
  portal_dge_trustees_types_get(options: {} = {}, requestOptions: ApiRequestOptions = {}): Promise<LimitedValueData[]> {
    return this.apiClient.processRequest(this.methodFactory.portal_dge_trustees_types_get(options), requestOptions);
  }
  portal_dgeconfig_get(options: {} = {}, requestOptions: ApiRequestOptions = {}): Promise<DgeConfigData> {
    return this.apiClient.processRequest(this.methodFactory.portal_dgeconfig_get(options), requestOptions);
  }
}
