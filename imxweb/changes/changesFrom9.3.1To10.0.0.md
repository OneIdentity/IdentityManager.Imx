# aob `(1 change)`
StartPageComponent (*Class deleted*)



# att `(7 changes)`
AttestationCasesComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | entitySchema:~~import("@imx-modules/imx-qbm-dbts").StaticSchema<"Key">;~~**_imx_modules_imx_qbm_dbts.StaticSchema<"Key">;** |


AttestationHistoryActionService (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | approve(attestationCases:AttestationCaseAction[], **isEscalation:boolean**):Promise<void>; |
| *MemberMismatch* | deny(attestationCases:AttestationCaseAction[], **isEscalation:boolean**):Promise<void>; |


AttestationHistoryComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | parameters:~~{ objecttable: string; objectuid: string; filter?:FilterData[]; };~~**AttestationParameters;** |


PolicyListComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Method added* | getSubtitleText |


PolicyService (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | elementalUiConfigService |


RunsGridComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Method added* | getSubtitleText |




# iqc
*PackageAdded*


# pol `(1 change)`
PolicyViolationsComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Method added* | getSubtitleText |




# qbm `(145 changes)`
Guid (*Class deleted*)

LoginComponent (*Class deleted*)

AppInitializationService (*Class added*)

ChartInfoTyped (*Class added*)

ConfirmationInputComponent (*Class added*)

DateTimePickerComponent (*Class added*)

DynamicMethodTypeWrapper (*Interface added*)

DynamicModuleImportService (*Class added*)

ErrorPageComponent (*Class added*)

ExportColumnsService (*Class added*)

FKViewConfig (*Interface added*)

GlobalSearchService (*Class added*)

HelpContextualTemplate (*Class added*)

HyperViewLayoutAlgorithm (*TypeAlias added*)

isAllIntegers (*Function added*)

LocalDataViewInitParameters (*Interface added*)

LoginPageComponent (*Class added*)

MethodDescriptorService (*Class added*)

ModelCssService (*Class added*)

PointStatVisualService (*Class added*)

PortalIdentifiers (*Variable added*)

PortalSwitcherComponent (*Class added*)

SChartTileComponent (*Class added*)

StatisticsApiService (*Class added*)

StatisticsChartHandlerService (*Class added*)

StatisticsForObjectsComponent (*Class added*)

StatisticsForObjectsService (*Class added*)

StatisticsGuardService (*Class added*)

StatisticsModule (*Class added*)

TypedEntityBuilderService (*Class added*)

AppConfigService (*3 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | onConfigTitleUpdated |
| *Method added* | loadCustomStyle |
| *Property added* | title |


CaptchaComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | captchaInputField |


CaptchaService (*3 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | captchaLoading |
| *Method added* | onLoad |
| *MemberMismatch* | builtInUrlParameter:~~string;~~**WritableSignal<string>;** |


CdrEditorComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | controlCreated:~~EventEmitter<AbstractControl<any, any>>;~~**EventEmitter<AbstractControl<any, any, any>>;** |


ConfirmationService (*3 changes*)

| Type | Change |
| -------- | ------- |
| *Method added* | confirmSecureDelete |
| *Method added* | showCustomMessage |
| *MemberMismatch* | confirmDelete(title?:string, message?:string, **buttonTitle?:string**):Promise<boolean>; |


ConnectionComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | ngOnInit():~~void;~~**Promise<void>;** |


DataSourceItemStatus (*1 change*)

| Type | Change |
| -------- | ------- |
| *PropertySignature added* | rowCssClass |


DataSourceToolbarComponent (*4 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | sortFeedbackMessages |
| *Property added* | elementalUiConfigService |
| *MemberMismatch* | multiSelectFilterValueChange(filter:~~DataSourceToolbarFilter, event:MatSelectChange):void;~~**DataSourceToolbarFilter, event:MatSelectChange<string[]>):void;** |
| *MemberMismatch* | selectFilterValueChanged(filter:~~DataSourceToolbarFilter, event:MatSelectChange):void;~~**DataSourceToolbarFilter, event:MatSelectChange<string>):void;** |


DataTableComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Method deleted* | getGroupKey |
| *MemberMismatch* | debouncedHighlightRow:~~import("lodash").DebouncedFunc<(entity: any, event?: any) => void>;~~**lodash.DebouncedFunc<(entity: any, event?: any) => void>;** |


DataTileComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | ~~True~~**False** |
| *MemberMismatch* | ~~get badges():DataTileBadge[] \| undefined;~~**badges:DataTileBadge[] \| undefined;** |


DataViewAutoTableComponent (*10 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | DisplayColumns |
| *Method added* | getSubtitleText |
| *Property added* | groupInfoTypeEnum |
| *Property added* | log |
| *Method added* | ngAfterContentInit |
| *Property added* | refreshButton |
| *Method added* | refreshGroup |
| *MemberMismatch* | columnDefs:~~QueryList<MatColumnDef>;~~**Signal<readonlyMatColumnDef[]>;** |
| *MemberMismatch* | namesOfDisplayedColumns:~~string[];~~**WritableSignal<string[]>;** |
| *MemberMismatch* | table:~~MatTable<any>;~~**Signal<MatTable<any> \| undefined>;** |


DataViewFilterComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | filterCount |


DataViewGroupComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | feedbackMessages |
| *Property added* | elementalUiConfigService |


DataViewInitParameters (*1 change*)

| Type | Change |
| -------- | ------- |
ParameterAdded: ExtendedType
| *MemberMismatch* | execute:~~ExecuteFunction<T>;~~**ExecuteFunction<T, ExtendedType>;** |


DataViewSearchComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | isGroupingApplied |
| *Property added* | searchPlaceholder |


DataViewSource (*4 changes*)

| Type | Change |
| -------- | ------- |
| *Method added* | renderRows |
| *Property added* | triggerRender |
| *MemberMismatch* | debouncedHighlightRow:~~import("lodash").DebouncedFunc<(entity: T, event?: any) => void>;~~**lodash.DebouncedFunc<(entity: T, event?: any) => void>;** |
| *MemberMismatch* | setKeywords(keywords:string, **needUpdate?:boolean**):void; |


DataViewSourceFactoryService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getDataSource<T extendsTypedEntity=TypedEntity, ExtendedType =any>():~~DataViewSource<T>;~~**DataViewSource<T, ExtendedType>;** |


DataViewToolbarComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | searchPlaceholder |


DateComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Method added* | clearInput |
| *Property added* | dateFormat |


DynFkContainer (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | protected getEntityKey(data:~~EntityData):string;~~**EntityData):string \| undefined;** |


EditDateComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | dateFormat |
| *Method added* | ngOnInit |


ElementalUiConfigService (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | SelectFeedbackMessages |
| *Property added* | TableManagementLabelTranslations |


EntityColumnContainer (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | get value():~~T;~~**T \| undefined;** |


EntityColumnEditorComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | pendingChanged |


EntitySelectComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | elementalUiConfigService |
| *MemberMismatch* | controlCreated:~~EventEmitter<AbstractControl<any, any>>;~~**EventEmitter<AbstractControl<any, any, any>>;** |


FilterWizardComponent (*9 changes*)

| Type | Change |
| -------- | ------- |
| *Method added* | canRemovePredefinedFilters |
| *Method added* | canRemoveSqlExpressions |
| *Method added* | close |
| *Property added* | nCustomFilters |
| *Property added* | nPreselectedFilters |
| *Property added* | nTreeFilters |
| *Method added* | onClearPredefinedFilters |
| *Method added* | onClearSqlExpression |
| *Property added* | sqlWizardComponent |


FilterWizardService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | clearFilters(**emit?:boolean**):void; |


FkSelectorComponent (*18 changes*)

| Type | Change |
| -------- | ------- |
| *Method deleted* | amIDisabled |
| *Method deleted* | clearSelection |
| *Property deleted* | dataTable |
| *Property deleted* | elementSelected |
| *Method deleted* | filterByTree |
| *Method deleted* | loadTableData |
| *Method deleted* | search |
| *Property deleted* | selectedCandidates |
| *Property deleted* | selectedCandidatesChanges |
| *Method deleted* | selectionChanged |
| *Method deleted* | selectObject |
| *Method deleted* | setSelectedClass |
| *Property deleted* | tableselected |
| *Property added* | dataSource |
| *Method added* | deleteConfigById |
| *Method added* | isRowDisabled |
| *Property added* | tableSelected |
| *Method added* | updateConfig |


HyperviewComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | showToolbar |
| *MemberMismatch* | layout:~~'Hierarchical' \| 'Vertical' \| 'Horizontal';~~**HyperViewLayoutAlgorithm;** |


IeWarningService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | showIe11Banner():~~Promise<void>;~~**void;** |


ImxTranslationProviderService (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | cultureChanged |


JobQueueOverviewComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | viewChange |


MastHeadComponent (*7 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | hasDocumentationConfig |
| *Method deleted* | navigateToDocumentation |
| *Property added* | aboutInfoService |
| *Property added* | canUseChatbot |
| *Method added* | checkChatbotExtension |
| *Property added* | mastHeadService |
| *MemberMismatch* | static ɵfac:~~i0.ɵɵFactoryDeclaration<MastHeadComponent, never>;~~**i0.ɵɵFactoryDeclaration<MastHeadComponent, [{ optional: true; }, null, null, null, null, null, null, null, null, null, null, null, null]>;** |


MastHeadService (*4 changes*)

| Type | Change |
| -------- | ------- |
| *Method deleted* | getDocumentationLink |
| *Method deleted* | openDocumentationLink |
| *Property added* | externalDocumentationLink |
| *Method added* | getDocumentLink |


MessageDialogComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | isConfirmationValid |


MessageParameter (*2 changes*)

| Type | Change |
| -------- | ------- |
| *PropertySignature added* | confirmationInput |
| *PropertySignature added* | customButtons |


ObjectHistoryComponent (*5 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | comparisonData |
| *Property added* | elementalUiConfigService |
| *Property added* | showOnlyChangedValues |
| *MemberMismatch* | momentToday:~~moment.Moment;~~**moment$1.Moment;** |
| *MemberMismatch* | get timelineToDateMoment():~~moment.Moment;~~**moment$1.Moment;** |


ObjectHistoryGridviewComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | columnDefs:~~Column[];~~**Column$2[];** |


ProcessingQueueService (*4 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | errorCount:~~import("@angular/core").Signal<number>;~~**i0.Signal<number>;** |
| *MemberMismatch* | hasCompletedGroups:~~import("@angular/core").Signal<boolean>;~~**i0.Signal<boolean>;** |
| *MemberMismatch* | isAllGroupsCompleted:~~import("@angular/core").Signal<boolean>;~~**i0.Signal<boolean>;** |
| *MemberMismatch* | totalCount:~~import("@angular/core").Signal<number>;~~**i0.Signal<number>;** |


ShapeClickArgs (*1 change*)

| Type | Change |
| -------- | ------- |
| *PropertySignature added* | shape |


SqlWizardComponent (*3 changes*)

| Type | Change |
| -------- | ------- |
| *Method added* | logOpTooltip |
| *MemberMismatch* | LogOp:~~typeof_logOp;~~**typeofLogOp;** |
| *MemberMismatch* | onOperatorChanged(~~event:MatButtonToggleChange~~):void; |




# qer `(43 changes)`
ApprovalWorkFlowModule (*Class deleted*)

ChartInfoTyped (*Class deleted*)

ChartTileComponent (*Class deleted*)

PointStatVisualService (*Class deleted*)

StatisticsChartHandlerService (*Class deleted*)

StatisticsForObjectsComponent (*Class deleted*)

StatisticsModule (*Class deleted*)

isStatistics (*Function added*)

DataExplorerIdentitiesComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Method added* | getSubtitleText |


DataExplorerRegistryService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getNavItems(preProps:~~string[], features:string[], projectConfig?:ProjectConfig, groups?:string[]):(SideNavigationExtension \| undefined)[];~~**string[], features:string[], projectConfig?:ProjectConfig$1, groups?:string[]):(SideNavigationExtension \| undefined)[];** |


DecisionReasonComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | exceptionValidUntil |
| *MemberMismatch* | controlCreated:~~EventEmitter<AbstractControl<any, any>>;~~**EventEmitter<AbstractControl<any, any, any>>;** |


DecisionStepSevice (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Method added* | checkStepForRules |
| *Property added* | isEscalationApprover |


IdentitiesReportsService (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | elementalUiConfigService |


IdentitiesService (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | static ɵfac:~~i0.ɵɵFactoryDeclaration<IdentitiesService, never>;~~**i0.ɵɵFactoryDeclaration<IdentitiesService$1, never>;** |
| *MemberMismatch* | static ɵprov:~~i0.ɵɵInjectableDeclaration<IdentitiesService>;~~**i0.ɵɵInjectableDeclaration<IdentitiesService$1>;** |


IdentitySidesheetComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | identities:~~IdentitiesService;~~**IdentitiesService$1;** |


MyResponsibilitiesRegistryService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getNavItems(preProps:~~string[], features:string[], projectConfig?:ProjectConfig):(SideNavigationExtension \| undefined)[];~~**string[], features:string[], projectConfig?:ProjectConfig$1):(SideNavigationExtension \| undefined)[];** |


NewRequestSelectionService (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Method added* | addSelectionKeyColumn |
| *MemberMismatch* | addProducts(products:TypedEntity[], **allProducts:TypedEntity[]**, productSource?:SelectedProductSource,~~wholeBundle?:boolean~~ productBundle?:PortalItshopPatternRequestable):void; |


ObjectHyperviewComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | layout |


OpSupportUserService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getGroups():~~Promise<UserGroupInfo[]>;~~**Promise<UserGroupInfo$1[]>;** |


OwnerControlComponent (*3 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | formControlCreated:~~EventEmitter<AbstractControl<any, any>>;~~**EventEmitter<AbstractControl<any, any, any>>;** |
| *MemberMismatch* | get uidPersonSelected():~~string;~~**string \| undefined;** |
| *MemberMismatch* | get uidRoleSelected():~~string;~~**string \| undefined;** |


ParameterDataService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | createInteractiveParameterCategoryColumns(parameterCategories:~~ParameterCategory[], getFkProvider:(parameter:ParameterData) =>IFkCandidateProvider, typedEntity:ReadWriteExtTypedEntity<{ Parameters?: { [key: string]:ParameterData[][]; }; },CategoryParameterWrite>, callbackOnChange?:() => void):ParameterCategoryColumn[];~~**ParameterCategory[], getFkProvider:(parameter:ParameterData) =>IFkCandidateProvider, typedEntity:ReadWriteExtTypedEntity<{ Parameters?: { [key: string]:ParameterData[][]; }; },CategoryParameterWrite$1>, callbackOnChange?:() => void):ParameterCategoryColumn[];** |


PasscodeService (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Method deleted* | getValidationDuration |
| *MemberMismatch* | showPasscode(passcode:~~duration:number \| undefined~~PersonPasscodeResult, userDisplay:string, managerDisplay:string):Promise<void>; |


PasswordQuestionsComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getData():~~void;~~**Promise<void>;** |


RequestHistoryFilterComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | elementalUiConfigService |


RequestTableComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Method added* | ngOnChanges |


RoleService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getHelpContextId():~~import("qbm").HelpContextualValues \| undefined;~~**i6.HelpContextualValues \| undefined;** |


ServiceItemsEditFormComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | formControlCreated:~~EventEmitter<AbstractControl<any, any>>;~~**EventEmitter<AbstractControl<any, any, any>>;** |
| *MemberMismatch* | get getSelectedUidPerson():~~string;~~**string \| undefined;** |


ServiceItemTagsComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | readonly controlCreated:~~EventEmitter<AbstractControl<any, any>>;~~**EventEmitter<AbstractControl<any, any, any>>;** |


TermsOfUseService (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | elementalUiConfigService |


ViewConfigService (*6 changes*)

| Type | Change |
| -------- | ------- |
| *Method added* | viewConfigSettings |
| *MemberMismatch* | deleteViewConfig(id:string, **opsupport?:boolean**):Promise<void>; |
| *MemberMismatch* | getDSTExtensionChanges(viewId:string, **signal?:AbortSignal**, **opsupport?:boolean**):Promise<DataSourceToolbarViewConfig>; |
| *MemberMismatch* | getInitialDSTExtension(dataModel:DataModel, viewId:string, signal?:AbortSignal, **opsupport?:boolean**):Promise<DataSourceToolbarViewConfig>; |
| *MemberMismatch* | getViewConfig(viewId:string, signal?:AbortSignal, **opsupport?:boolean**):Promise<ViewConfigData[]>; |
| *MemberMismatch* | putViewConfig(config:ViewConfigData, **opsupport?:boolean**):Promise<void>; |




# rps `(1 change)`
ReportButtonComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | elementalUiConfigService |




# tsb `(6 changes)`
AccountSidesheetComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | elementalUiConfigService |


AccountsService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getFilterTree(parameter:~~AccountsFilterTreeParameters):Promise<FilterTreeData>;~~**AcountsFilterTreeParameters):Promise<FilterTreeData>;** |


DataExplorerAccountsComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Method added* | getSubtitleText |


DataExplorerFiltersComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | elementalUiConfigService |


DataExplorerGroupsComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Method added* | getSubtitleText |


GroupSidesheetComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | elementalUiConfigService |




# uci
*Removed from the public repository*


