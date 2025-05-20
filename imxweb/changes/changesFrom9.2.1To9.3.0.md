# aad `(2 changes)`
AadUserDeniedPlansComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | onDeniedPlanSelected(selected:TypedEntity[]):void; |


AadUserSubscriptionsComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | onUserSubSelected(selected:TypedEntity[]):void; |




# att `(50 changes)`
AttestationCasesComponent (*8 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | dstSettings |
| *Method deleted* | onNavigationStateChanged |
| *Property deleted* | treeDatabase |
| *Property added* | dataSource |
| *Property added* | isLoading |
| *MemberMismatch* | createRun(data:(PortalAttestationFilterMatchingobjects \| undefined)[]):Promise<void>; |
| *MemberMismatch* | entitySchema:import("@imx-modules/imx-qbm-dbts").StaticSchema<"Key">; |
| *MemberMismatch* | selectedItems:(PortalAttestationFilterMatchingobjects \| undefined)[]; |


AttestationHistoryActionService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | readonly applied:Subject<void>; |


AttestationHistoryCase (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | readonly data:AttestationCaseData \| undefined; |


AttestationHistoryComponent (*10 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | attestorFilter |
| *Property deleted* | dstSettings |
| *Method deleted* | getData |
| *Method deleted* | onGroupingChange |
| *Method deleted* | onSearch |
| *Property added* | dataSource |
| *Method added* | initTable |
| *Property added* | title |
| *MemberMismatch* | selectionChanged:EventEmitter<TypedEntity[]>; |
| *MemberMismatch* | viewDetails(~~attestationCase:AttestationHistoryCase~~**entity:AttestationHistoryCase**):Promise<void>; |


AttestationHistoryService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | get(~~parameters:AttestationCaseLoadParameters~~**parameters?:AttestationCaseLoadParameters**):Promise<ExtendedTypedEntityCollection<PortalAttestationCase,AttCaseDataRead>>; |


EditMasterDataComponent (*6 changes*)

| Type | Change |
| -------- | ------- |
| *Method deleted* | updatePickCategory |
| *Property added* | busyService |
| *Property added* | LdsKeySampleRemoved |
| *Method added* | onFilterChanged |
| *MemberMismatch* | addControl(evt:AbstractControl, ~~columnName:string~~**columnName?:string**):void; |
| *MemberMismatch* | objectProperties:{ [key: string]: { cdr:ColumnDependentReference; formControl?:AbstractControl; }; }; |


EditPolicyGroupSidesheetComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | addControl(columnName:string, evt:AbstractControl):void; |


PolicyGroupListComponent (*5 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | dstSettings |
| *Method deleted* | onGroupingChange |
| *Method deleted* | onNavigationStateChanged |
| *Method deleted* | onSearch |
| *Property added* | dataSource |


PolicyListComponent (*7 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | dstSettings |
| *Property deleted* | navigationState |
| *Method deleted* | onGroupingChange |
| *Method deleted* | onNavigationStateChanged |
| *Method deleted* | onSearch |
| *Property added* | dataSource |
| *MemberMismatch* | editPolicy(policy:AttestationPolicy):Promise<void>; |


PolicyService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getPolicies(parameters:PolicyLoadParameters, **signal?:AbortSignal**):Promise<ExtendedTypedEntityCollection<AttestationPolicy, {}>>; |


RunsComponent (*3 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | dataSource |
| *Method added* | ngAfterViewInit |
| *Property added* | runsGridComponent |


RunsGridComponent (*6 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | dstSettings |
| *Property deleted* | groupedData |
| *Method deleted* | onGroupingChange |
| *Method deleted* | onSearch |
| *Property added* | dataSource |
| *MemberMismatch* | getData(~~newState?:CollectionLoadParameters~~):Promise<void>; |




# dpr `(5 changes)`
OutstandingComponent (*5 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | busyLoadingTable |
| *Property added* | busyService |
| *Property added* | selectedNamespaceTitle |
| *MemberMismatch* | selectedTable:OpsupportOutstandingTables \| null; |
| *MemberMismatch* | selectionChanged(selected:TypedEntity[]):void; |




# o3t
*PackageMissing*


# olg `(6 changes)`
MfaFormControlComponent (*6 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | activatedFactor:ActivateFactorData \| undefined; |
| *MemberMismatch* | activateFactor(factorName:string \| undefined, deviceId:string \| undefined, index:number):Promise<void>; |
| *MemberMismatch* | isAuthenticator(factorName:string \| undefined):boolean; |
| *MemberMismatch* | isCDRValid(cdr:ColumnDependentReference \| undefined):boolean; |
| *MemberMismatch* | isOTP(factorName:string \| undefined):boolean; |
| *MemberMismatch* | isProtect(factorName:string \| undefined):boolean; |




# pol `(8 changes)`
PolicyViolationsComponent (*8 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | dstSettings |
| *Property deleted* | groupedData |
| *Method deleted* | onGroupingChange |
| *Method deleted* | search |
| *Property deleted* | table |
| *Property added* | dataSource |
| *Method added* | decide |
| *MemberMismatch* | getData(~~newState?:CollectionLoadParameters~~):void; |




# qbm `(319 changes)`
DataNavigationParameters (*Interface deleted*)

DeviceStateService (*Class deleted*)

DocChapter (*Interface deleted*)

DocChapterService (*Class deleted*)

DocDocument (*Interface deleted*)

FkSelectionContainer (*Class deleted*)

GroupMenuItem (*Class deleted*)

MasterDetailComponent (*Class deleted*)

MenuComponent (*Class deleted*)

MenuModule (*Class deleted*)

NavigationMenuItem (*Class deleted*)

NavigationService (*Class deleted*)

PluginLoaderService (*Class deleted*)

SelectComponent (*Class deleted*)

SelectContentProvider (*Interface deleted*)

SelectModule (*Class deleted*)

SidenavTreeModule (*Class deleted*)

TempBillboardComponent (*Class deleted*)

TempBillboardModule (*Class deleted*)

AboutService (*Class added*)

Action (*Class added*)

ActionGroup (*Class added*)

calculateSidesheetWidth (*Function added*)

DataViewAutoTableComponent (*Class added*)

DataViewChipbarComponent (*Class added*)

DataViewFilterComponent (*Class added*)

DataViewGroupComponent (*Class added*)

DataViewInitParameters (*Interface added*)

DataViewModule (*Class added*)

DataViewPaginatorComponent (*Class added*)

DataViewSearchComponent (*Class added*)

DataViewSelectionComponent (*Class added*)

DataViewSettingsComponent (*Class added*)

DataViewSource (*Class added*)

DataViewSourceFactoryService (*Class added*)

DataViewStatusComponent (*Class added*)

DataViewToolbarComponent (*Class added*)

EuiDateProviders (*Variable added*)

FakeDataViewSource (*Variable added*)

FkCandidatesData (*Interface added*)

isMobile (*Function added*)

MessageDialogService (*Class added*)

ProcessingQueueService (*Class added*)

QueuedAction (*Interface added*)

QueuedActionGroup (*Interface added*)

QueuedActionState (*Enum added*)

setFilterDisplay (*Function added*)

TableAccessiblilityDirective (*Class added*)

TreeNode (*Class added*)

TypedEntityFkData (*Interface added*)

ApiClientAngularService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | processRequest<T>(methodDescriptor:MethodDescriptor<T>):Observable<T \| null>; |


ApiClientService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | request<T>(apiCall:() =>Promise<T>):Promise<T \| undefined>; |


AppConfigService (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | initializedSubject:Subject<void>; |
| *MemberMismatch* | onConfigTitleUpdated:Subject<void>; |


AuthConfigProvider (*2 changes*)

| Type | Change |
| -------- | ------- |
| *PropertySignature added* | preAuthProps |
| *PropertySignature added* | preAuthState |


AuthenticationService (*5 changes*)

| Type | Change |
| -------- | ------- |
| *Method added* | preAuth |
| *Method added* | preAuthVerify |
| *MemberMismatch* | login(loginData:{ [key: string]: string; }):Promise<ISessionState \| undefined>; |
| *MemberMismatch* | logout(currentSessionState?:ISessionState, **withNotification?:boolean**):Promise<void>; |
| *MemberMismatch* | update(**navigateToStart?:boolean**):Promise<void>; |


BaseCdr (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | isReadOnlyColumn |
| *MemberMismatch* | readonly display?:string \| undefined; |


BaseCdrEditorProvider (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | createEditor(parent:ViewContainerRef, cdref:ColumnDependentReference):ComponentRef<CdrEditor> \| null; |


BaseImxApiDataMock (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | static CreateEntityDataCollection<TEntityCollection>(createEntity:(i: number) => TEntityCollection, numOfEntries:number):TEntityCollection[]; |


CaptchaComponent (*9 changes*)

| Type | Change |
| -------- | ------- |
| *Method deleted* | isBuiltIn |
| *Property added* | disableButton |
| *Property added* | LdsCaptchaInfo |
| *Property added* | nextClick |
| *Method added* | onBack |
| *Property added* | onBackEvent |
| *Method added* | onNext |
| *Property added* | showAllButtons |
| *Property added* | showBackButton |


CaptchaMode (*1 change*)

| Type | Change |
| -------- | ------- |
| *EnumMember added* | RecaptchaV3 |


CaptchaService (*3 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | captchaImageUrl |
| *Property added* | isBuiltIn |
| *Property added* | isReCaptchaV3 |


CdrEditor (*1 change*)

| Type | Change |
| -------- | ------- |
| *PropertySignature added* | validateOnlyOnChange |


CdrEditorComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | validateOnlyOnChange |
| *MemberMismatch* | editor:CdrEditor \| undefined; |


CdrEditorProvider (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | createEditor(parent:ViewContainerRef, cdref:ColumnDependentReference):ComponentRef<CdrEditor> \| null; |


CdrFactoryService (*3 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | buildCdr(entity:IEntity \| undefined, columnName:string, readOnly?:boolean, columnDisplay?:string):ColumnDependentReference \| undefined; |
| *MemberMismatch* | buildCdrFromColumnList(entity:IEntity \| undefined, columnNames:string[], readOnly?:boolean):ColumnDependentReference[]; |
| *MemberMismatch* | static tryGetColumn(entity:IEntity \| undefined, columnName:string):IEntityColumn \| undefined; |


CdrRegistryService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | createEditor(parent:ViewContainerRef, cdref:ColumnDependentReference):ComponentRef<CdrEditor> \| null; |


CdrSidesheetComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | addFormControl(name:string, control:AbstractControl):void; |


ColumnOptions (*5 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | currentViewSettings:DataModelViewConfig \| DSTViewConfig \| undefined; |
| *MemberMismatch* | static findKey(key:string \| undefined, schema:EntitySchema):string \| undefined; |
| *MemberMismatch* | static getClientProperty(name:string \| undefined, dataModel:DataModel \| undefined, entitySchema?:EntitySchema):IClientProperty; |
| *MemberMismatch* | optionalColumns:(IClientProperty \| undefined)[]; |
| *MemberMismatch* | viewConfig?:DSTViewConfig \| undefined; |


ConfirmationService (*3 changes*)

| Type | Change |
| -------- | ------- |
| *Method added* | handleExpiredSession |
| *Method added* | showErrorMessage |
| *Method added* | showMessageBox |


createGroupData (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | export declare function createGroupData(dataModel:DataModel, getGroupInfo:(parameters:GroupInfoLoadParameters) =>Promise<GroupInfoData \| undefined> \| undefined, excludedColumns?:string[]):DataSourceToolbarGroupData \| undefined; |


CreateIEntityColumn (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | export declare function CreateIEntityColumn(displayValue:string \| undefined):IEntityColumn; |


DataModelWrapper (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getGroupInfo?:(parameters:GroupInfoLoadParameters) =>Promise<GroupInfoData \| undefined>; |


DataSourceItemStatus (*3 changes*)

| Type | Change |
| -------- | ------- |
| *PropertySignature added* | rowEnabled |
| *PropertySignature added* | status |
| *MemberMismatch* | enabled:(item?:TypedEntity) => boolean; |


DataSourceToolbarComponent (*19 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | hasFilterTree |
| *Method deleted* | showFilterTree |
| *Method added* | applyOrderBy |
| *MemberMismatch* | ascendingSortControl:FormControl<boolean \| null>; |
| *MemberMismatch* | columnOptions:ColumnOptions \| undefined; |
| *MemberMismatch* | currentFilterData:FilterTreeSelectionParameter \| undefined; |
| *MemberMismatch* | dataSourceChanged:EventEmitter<TypedEntityCollectionData<TypedEntity> \| null \| undefined>; |
| *MemberMismatch* | filterWizardExpression:SqlWizardExpression \| undefined; |
| *MemberMismatch* | getSelectedFilterFromName(filterName:string, value:string):DataSourceToolbarSelectedFilter[]; |
| *MemberMismatch* | isRedundant(value:string \| null \| undefined):boolean; |
| *MemberMismatch* | onSearch(keywords:string \| null \| undefined):void; |
| *MemberMismatch* | onSelectedFilterRemoved(selectedFilter:DataSourceToolbarSelectedFilter, optionValue:string \| undefined):void; |
| *MemberMismatch* | get optionalColumns():(IClientProperty \| undefined)[]; |
| *MemberMismatch* | removeSelectedFilter(filter:DataSourceToolbarFilter \| undefined, emitChange?:boolean, optionValue?:string, selectedFilter?:DataSourceToolbarSelectedFilter):void; |
| *MemberMismatch* | searchApi?:(keywords?: string) =>Observable<any> \| undefined; |
| *MemberMismatch* | selectedSortControl:FormControl<string>; |
| *MemberMismatch* | readonly selection:SelectionModelWrapper<TypedEntity>; |
| *MemberMismatch* | sortControl:FormGroup<{ selectedSortControl:FormControl<string>; ascendingSortControl:FormControl<boolean \| null>; }>; |
| *MemberMismatch* | sortFeedbackMessages:EuiSelectFeedbackMessages; |


DataSourceToolBarGroup (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getData:(parameter?:CollectionLoadParameters) =>Promise<GroupInfoData \| undefined>; |


DataSourceToolbarGroupData (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | currentGrouping?:{ display: string; getData: (parameter?:CollectionLoadParameters) =>Promise<GroupInfoData \| undefined>; navigationState?:CollectionLoadParameters; }; |


DataSourceToolbarSelectedFilter (*4 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | True |
| *MemberMismatch* | filter?:DataSourceToolbarFilter; |
| *MemberMismatch* | True |
| *MemberMismatch* | selectedOption?:DataModelFilterOptionExtended; |


DataSourceToolbarSettings (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | dataSource:TypedEntityCollectionData<TypedEntity> \| undefined; |


DataSourceWrapper (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | extendedData:TExtendedData \| undefined; |
| *MemberMismatch* | getDstSettings(parameters?:CollectionLoadParameters, requestOpts?:ApiRequestOptions):Promise<DataSourceToolbarSettings \| undefined>; |


DataTableColumnComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | get entityColumn():IClientProperty \| undefined;set entityColumn(value:IClientProperty \| undefined); |


DataTableComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | highlightedEntity:TypedEntity \| null; |


DataTableGroupedData (*4 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | True |
| *MemberMismatch* | navigationState?:CollectionLoadParameters; |
| *MemberMismatch* | True |
| *MemberMismatch* | settings?:DataSourceToolbarSettings; |


DataTileComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | get badges():DataTileBadge[] \| undefined; |
| *MemberMismatch* | getTitleDisplayValue(colName:string \| undefined):string; |


DataTilesComponent (*3 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | badgeClicked:EventEmitter<{ entity:TypedEntity; badge:DataTileBadge; }>; |
| *MemberMismatch* | get height():string;set height(value: string); |
| *MemberMismatch* | onBadgeClicked(badge:{ entity:TypedEntity; badge:DataTileBadge; }):void; |


DataTreeComponent (*3 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | customDisplay |
| *MemberMismatch* | getEntityById(id:string):IEntity \| undefined; |
| *MemberMismatch* | selectedEntities:(IEntity \| undefined)[]; |


DataTreeWrapperComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | customDisplay |
| *MemberMismatch* | getEntityById(id:string):IEntity \| undefined; |


DateComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | validateOnlyOnChange |


DbObjectInfo (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | True |
| *MemberMismatch* | Key?:DbObjectKey; |


DefaultCdrEditorProvider (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | createEditor(parent:ViewContainerRef, cdref:ColumnDependentReference):ComponentRef<CdrEditor> \| null; |


DynamicDataApiControls (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | abortSearch |


DynamicDataSource (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | dstSettings:DataSourceToolbarSettings \| undefined; |


DynamicMethod (*3 changes*)

| Type | Change |
| -------- | ------- |
| *Method added* | Post |
| *MemberMismatch* | Get(parametersOptional?:any):Promise<import("@imx-modules/imx-qbm-dbts").ExtendedTypedEntityCollection<TypedEntity, unknown>>; |
| *MemberMismatch* | Put(entity:TypedEntity):Promise<import("@imx-modules/imx-qbm-dbts").ExtendedTypedEntityCollection<TypedEntity, unknown>>; |


EditDateComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | validateOnlyOnChange |


EditFkComponent (*4 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | hasCandidatesOrIsLoading |
| *Method added* | candidateTrackByFn |
| *MemberMismatch* | get candidates():Candidate[];set candidates(value:Candidate[] \| undefined \| null); |
| *MemberMismatch* | selectedTable:IForeignKeyInfo \| undefined; |


EditMultiLimitedValueComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | isWriting |
| *MemberMismatch* | control:FormGroup<LimitedForm>; |


EntityColumnContainer (*10 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | showDisplayValue |
| *MemberMismatch* | get displayValue():string \| undefined; |
| *MemberMismatch* | get fkRelations():ReadonlyArray<IForeignKeyInfo> \| undefined; |
| *MemberMismatch* | get hint():string \| undefined; |
| *MemberMismatch* | get metaData():IValueMetadata \| undefined; |
| *MemberMismatch* | get name():string \| undefined; |
| *MemberMismatch* | get type():ValType \| undefined; |
| *MemberMismatch* | updateValue(value:T \| undefined):Promise<void>; |
| *MemberMismatch* | updateValueStruct(value:ValueStruct<T \| undefined>):Promise<void>; |
| *MemberMismatch* | get valueConstraint():ValueConstraint \| undefined; |


EntityColumnEditorComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | display |
| *MemberMismatch* | cdr:ColumnDependentReference \| undefined; |


EntityColumnStub (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | GetValue():T \| undefined; |


EntitySelectComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Method added* | selectionUpdated |
| *MemberMismatch* | options:EuiSelectOption[] \| undefined; |


ExtService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getFittingComponent<T extendsIExtension>(key:string):Promise<T \| undefined>; |


FileSelectorService (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | emitFiles(files:FileList \| null, acceptedFileFormat:string):void; |
| *MemberMismatch* | readonly fileFormatError:Subject<void>; |


FilterTreeComponent (*3 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | currentlySelectedFilter:(FilterTreeSelectionArg \| undefined)[]; |
| *MemberMismatch* | currentlySelectedFilterEntities:(IEntity \| undefined)[]; |
| *MemberMismatch* | database:TreeDatabase \| undefined; |


FilterTreeDatabase (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getId(entity:IEntity \| undefined):string; |


FilterWizardComponent (*8 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | hasTreeFilter |
| *Property added* | initialized |
| *Property added* | isLoading |
| *Method added* | ngOnInit |
| *Method added* | onFilterTreeSelectionChanged |
| *Property added* | treeFilterUpdated |
| *MemberMismatch* | data?:FilterWizardSidesheetData \| undefined; |
| *MemberMismatch* | lastGoodExpression:SqlExpression \| undefined; |


FkCandidatesComponent (*6 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | showLongdisplay |
| *Property added* | dataModel |
| *Property added* | showLongDisplay |
| *MemberMismatch* | data:FkCandidatesData \| TypedEntityFkData; |
| *MemberMismatch* | entitySchema:EntitySchema; |
| *MemberMismatch* | ngOnChanges(~~changes:SimpleChanges~~):Promise<void>; |


FkCdrEditorProvider (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | createEditor(parent:ViewContainerRef, cdref:ColumnDependentReference):ComponentRef<CdrEditor> \| null; |


FkContainer (*3 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | candidateCollection:EntityCollectionData \| undefined; |
| *MemberMismatch* | protected getEntityKey(data:EntityData):string \| undefined; |
| *MemberMismatch* | value:EntityData \| null; |


FkSelectorComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | entitySchema |
| *MemberMismatch* | preselectedEntities:TypedEntity[] \| null; |


HelpContextualService (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | GetHelpContextId():HelpContextualValues \| null; |
| *MemberMismatch* | setHelpContextId(contextId:HelpContextualValues \| null):void; |


ImageSelectComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | control:FormControl<any>; |


imx_SessionService (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Method added* | preAuth |
| *Method added* | preAuthVerify |


ImxDataSource (*4 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | childItemsProvider:(item: T) =>Promise<T[]>; |
| *MemberMismatch* | getRows(items:T[], parent:ImxExpandableItem<T> \| null, level:number):ImxExpandableItem<T>[]; |
| *MemberMismatch* | hasChildrenProvider:(data: T) => boolean; |
| *MemberMismatch* | itemsProvider:() =>Promise<T[]>; |


ImxExpandableItem (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | parent:ImxExpandableItem<T> \| null; |


ImxMatColumnComponent (*4 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | cellTemplate:TemplateRef<any>; |
| *MemberMismatch* | dataAccessor:(data: T, index: number, name: string) => string; |
| *MemberMismatch* | hasChildrenProvider:(data: T) => boolean; |
| *MemberMismatch* | headerTemplate:TemplateRef<any>; |


ImxTranslationProviderService (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Method added* | reinit |
| *MemberMismatch* | init(culture?:string \| undefined, cultureFormat?:string \| undefined):Promise<void>; |


InfoButtonComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | title:string \| null; |


ISessionState (*5 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | externalLogoutUrl?:string \| undefined; |
| *MemberMismatch* | SecondaryAuthName?:string \| null; |
| *MemberMismatch* | SecondaryErrorMessage?:string \| null; |
| *MemberMismatch* | Username?:string \| null; |
| *MemberMismatch* | UserUid?:string \| null; |


JobQueueOverviewComponent (*4 changes*)

| Type | Change |
| -------- | ------- |
| *Method deleted* | removeOldSVG |
| *Method deleted* | setData |
| *Method added* | onChart |
| *MemberMismatch* | chartOptions:ChartOptions \| null; |


LineChartOptions (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | emptyText |


LoginComponent (*12 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | authPropertyInput |
| *Method added* | backToPreAuth |
| *Method added* | checkPreAuth |
| *Property added* | isFormHidden |
| *Method added* | ngAfterViewChecked |
| *Method added* | onVerifyCaptcha |
| *Property added* | preAuthPropertyInput |
| *Property added* | preAuthStateType |
| *Property added* | selectedProviderPreAuthState |
| *Property added* | showBackButton |
| *Property added* | showCreateAccountButton |
| *Property added* | showLoginButton |


MastHeadComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | isQueueFinished |


MenuItem (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | True |
| *MemberMismatch* | readonly title?:string; |


MessageDialogComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | messageDialogService |
| *Property added* | messages |


MessageParameter (*1 change*)

| Type | Change |
| -------- | ------- |
| *PropertySignature added* | icon |


MetadataService (*8 changes*)

| Type | Change |
| -------- | ------- |
| *Method added* | abortCall |
| *Property added* | abortController |
| *Method added* | getTable |
| *Method added* | ngOnDestroy |
| *MemberMismatch* | GetTableMetadata(~~table:string~~**tableName:string**, **options?:unknown**):Promise<any>; |
| *MemberMismatch* | readonly tables:{ [id: string]:MetaTableData \| undefined; }; |
| *MemberMismatch* | update(tableNames:string[], **options?:unknown**):Promise<void>; |
| *MemberMismatch* | updateNonExisting(tableNames:string[], **options?:unknown**):Promise<void>; |


MultiValueService (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getMultiValue(values:string[]):string \| undefined; |
| *MemberMismatch* | getValues(value:string \| undefined):string[] \| undefined; |


OAuthService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | convertToOAuthLoginData(loginData:{ [key: string]: any; }):{ Module: string; Code: string; } \| undefined; |


ObjectHistoryComponent (*13 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | eventChangeTypes |
| *Method added* | getFilterTypeValue |
| *Method added* | onFilterTypeChanged |
| *Property added* | selectedEventChangeTypes |
| *Property added* | timelineToDateMoment |
| *Property added* | viewModeControl |
| *MemberMismatch* | filteredHistoryData:ExtendedObjectHistoryEvent[]; |
| *MemberMismatch* | historyData:ExtendedObjectHistoryEvent[]; |
| *MemberMismatch* | timelineFromDateFormControl:FormControl<Moment>; |
| *MemberMismatch* | timelineFromTimeFormControl:FormControl<Moment>; |
| *MemberMismatch* | timelineToDateFormControl:FormControl<Moment>; |
| *MemberMismatch* | timelineToTimeFormControl:FormControl<Moment>; |
| *MemberMismatch* | viewModes:EuiSelectOption[]; |


OrderedListComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | dataSource:{ Name?: string; Display?: string; }[]; |


ParameterizedTextComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | additionalText |


QueryParametersHandler (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | GetQueryParameters(filter?:(name: string) => boolean):{ [key: string]: any; } \| undefined; |


SearchBarComponent (*3 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | isLoading |
| *MemberMismatch* | displayItem(item?:any):string; |
| *MemberMismatch* | resultTemplate:TemplateRef<any>; |


SelectedElementsComponent (*7 changes*)

| Type | Change |
| -------- | ------- |
| *Method added* | deselectAll |
| *Property added* | deselectAllCaption |
| *Property added* | onDeselectAllClicked |
| *Property added* | openCustomSelectionDialog |
| *Property added* | showDeselectAll |
| *MemberMismatch* | caption:string; |
| *MemberMismatch* | dialogHeader:string; |


SeriesInformation (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | True |
| *MemberMismatch* | readonly color?:string; |


SessionState (*7 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | readonly culture:string \| undefined; |
| *MemberMismatch* | readonly cultureFormat:string \| undefined; |
| *MemberMismatch* | readonly externalLogoutUrl:string \| undefined; |
| *MemberMismatch* | get SecondaryAuthName():string \| null; |
| *MemberMismatch* | get SecondaryErrorMessage():string \| null; |
| *MemberMismatch* | get Username():string \| null; |
| *MemberMismatch* | get UserUid():string \| null; |


SettingsService (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | DefaultPageOptions |


SideNavigationViewComponent (*4 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | isMobile |
| *MemberMismatch* | _navItems:(SideNavigationExtension \| undefined)[]; |
| *MemberMismatch* | contextId:HelpContextualValues; |
| *MemberMismatch* | get navItems():(SideNavigationExtension \| undefined)[];set navItems(value: (SideNavigationExtension \| undefined)[]); |


SidenavTreeComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | hideExpandButton |
| *MemberMismatch* | hasChild:(_: number, node: any) => any; |


StorageService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | get lastUrl():string;set lastUrl(value: string \| undefined); |


TranslationEditorComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | onInput(~~translationValue:string~~**translationValueTarget:Event**, columnName:string, uidCulture:string):void; |
| *MemberMismatch* | translationData:TranslationDataRead \| undefined; |


TreeDatabase (*7 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | dataReloaded$:BehaviorSubject<boolean \| undefined>; |
| *MemberMismatch* | getData(showLoading:boolean, parameter?:CollectionLoadParameters):Promise<TreeNodeResultParameter \| undefined>; |
| *MemberMismatch* | getId(entity:IEntity \| undefined):string; |
| *MemberMismatch* | static getId(entity:IEntity \| undefined):string; |
| *MemberMismatch* | readonly initialized:Subject<void>; |
| *MemberMismatch* | False |
| *MemberMismatch* | rootNodes:TreeNode[]; |


TreeNodeInfo (*2 changes*)

| Type | Change |
| -------- | ------- |
| *PropertySignature added* | isSelectable |
| *PropertySignature added* | nodes |


TypedEntitySelectionData (*3 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | export interface TypedEntitySelectionData<**T extendsTypedEntity=TypedEntity**> |
| *MemberMismatch* | dynamicFkRelation?:{ tables:ReadonlyArray<IForeignKeyInfo>; getSelectedTableName: (selected: T[]) => string; }; |
| *MemberMismatch* | getSelected:() =>Promise<T[]>; |
| *MemberMismatch* | getTyped?:(parameters:CollectionLoadParameters) =>Promise<TypedEntityCollectionData<T> \| undefined>; |


UserMessageComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | message:Message \| undefined; |


UserMessageService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | readonly subject:ReplaySubject<Message \| undefined>; |


XAxisInformation (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | readonly tickConfiguration:XTickConfiguration \| undefined; |




# qer `(248 changes)`
CartItemsExtensionService (*Class added*)

ChartTileComponent (*Class added*)

ExtendedEntityWrapper (*Interface added*)

ICartItemsExtensionService (*Interface added*)

PasswordQuestionsModule (*Class added*)

PasswordService (*Class added*)

PointStatVisualService (*Class added*)

QueueStatusComponent (*Class added*)

RequestableProduct (*Interface added*)

StatisticsChartHandlerService (*Class added*)

WorkflowActionComponent (*Class added*)

AddressbookComponent (*11 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | dstSettings |
| *Property deleted* | groupData |
| *Method deleted* | onGroupingChange |
| *Method deleted* | onNavigationStateChanged |
| *Method deleted* | onSearch |
| *Property added* | dataModel |
| *Property added* | dataSource |
| *Method added* | deleteConfigById |
| *Property added* | displayedColumns |
| *Property added* | entitySchema |
| *Method added* | updateConfig |


ApproverContainer (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | canSeeSteps |


BadgeTileComponent (*4 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | caption |
| *Property deleted* | identifier |
| *Property deleted* | loadingState |
| *Property deleted* | value |


BaseMembership (*14 changes*)

| Type | Change |
| -------- | ------- |
| *Method deleted* | getSchema |
| *Property deleted* | schemaPaths |
| *Property deleted* | session |
| *Property added* | columnName |
| *Property added* | dynamicRoleUrl |
| *Property added* | fkCandidateRoute |
| *Method added* | GetSchema |
| *Method added* | setRoleName |
| *MemberMismatch* | False |
| *MemberMismatch* | basePath:string; |
| *MemberMismatch* | get(id:string, navigationState?:CollectionLoadParameters):Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>>; |
| *MemberMismatch* | getCandidates(id:string, navigationState?:CollectionLoadParameters):Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>>; |
| *MemberMismatch* | getCandidatesDataModel(~~idatesDataModel(id:string~~):Promise<DataModel>; |
| *MemberMismatch* | GetUidRole(entity:IEntity):string; |


BaseTreeEntitlement (*4 changes*)

| Type | Change |
| -------- | ------- |
| *Method deleted* | getEntitlementFkName |
| *Property deleted* | schemaPaths |
| *Property added* | entitlementFkName |
| *MemberMismatch* | createEntitlementAssignmentEntity(role:IEntity, entlType:RoleAssignmentData):IEntity \| undefined; |


ChartInfoTyped (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | DisplayType |


DataExplorerIdentitiesComponent (*10 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | dstSettings |
| *Property deleted* | isMobile |
| *Property deleted* | navigationState |
| *Method deleted* | onGroupingChange |
| *Method deleted* | onNavigationStateChanged |
| *Method deleted* | onSearch |
| *Property added* | dataSource |
| *Property added* | isCreationAllowed |
| *MemberMismatch* | onIdentityChanged(identity:PortalAdminPerson \| PortalPersonReports):Promise<void>; |
| *MemberMismatch* | selectedPerson:PortalAdminPerson \| PortalPersonReports; |


DataExplorerRegistryService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getNavItems(preProps:string[], features:string[], projectConfig?:ProjectConfig, groups?:string[]):(SideNavigationExtension \| undefined)[]; |


DataManagementService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | entityInteractive:TypedEntity \| undefined; |


DecisionReasonComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | reasonFreetext:ColumnDependentReference; |
| *MemberMismatch* | reasonStandard:ColumnDependentReference; |


DecisionStepSevice (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getCurrentStepCdr(entity:TypedEntity, extended:any, display:string):ColumnDependentReference \| undefined; |


DelegationComponent (*10 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | canDelegateAll |
| *Property added* | canDelegateSelected |
| *Property added* | isSaving |
| *Property added* | navigationState |
| *MemberMismatch* | isShowCdr(cdr:ColumnDependentReference):boolean; |
| *MemberMismatch* | False |
| *MemberMismatch* | recipientFormGroup:UntypedFormGroup; |
| *MemberMismatch* | False |
| *MemberMismatch* | senderFormGroup:UntypedFormGroup; |
| *MemberMismatch* | state:string \| undefined; |


IdentitiesService (*4 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getAllPerson(navigationState:CollectionLoadParameters, **signal?:AbortSignal**):Promise<TypedEntityCollectionData<PortalPersonAll>>; |
| *MemberMismatch* | getAllPersonAdmin(navigationState:CollectionLoadParameters, **signal:AbortSignal**):Promise<TypedEntityCollectionData<PortalAdminPerson>>; |
| *MemberMismatch* | getGroupedAllPerson(columns:string, navigationState:CollectionLoadParameters, **signal:AbortSignal**):Promise<GroupInfoData>; |
| *MemberMismatch* | getReportsOfManager(navigationState:CollectionLoadParameters, **signal:AbortSignal**):Promise<TypedEntityCollectionData<PortalPersonReports>>; |


IdentityRoleMembershipsComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | entitySchema:EntitySchema \| undefined; |


IdentityRoleMembershipsService (*4 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | get(target:string, uidPerson:string, navigationState?:CollectionLoadParameters):Promise<TypedEntityCollectionData<TypedEntity> \| undefined>; |
| *MemberMismatch* | getSchema(target:string):EntitySchema \| undefined; |
| *MemberMismatch* | getTabData(target:string):MembershipContolInfo \| undefined; |
| *MemberMismatch* | targets:string[]; |


IdentitySidesheetComponent (*9 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | cdrList:(ColumnDependentReference \| undefined)[]; |
| *MemberMismatch* | cdrListLocality:(ColumnDependentReference \| undefined)[]; |
| *MemberMismatch* | cdrListOrganizational:(ColumnDependentReference \| undefined)[]; |
| *MemberMismatch* | cdrListPersonal:(ColumnDependentReference \| undefined)[]; |
| *MemberMismatch* | readonly detailsFormGroup:FormGroup<{}>; |
| *MemberMismatch* | isActiveFormControl:FormControl<boolean>; |
| *MemberMismatch* | isSecurityIncidentFormControl:FormControl<boolean>; |
| *MemberMismatch* | readonly parameters:{ objecttable: string; objectuid: string; display: string; }; |
| *MemberMismatch* | update(cdr:ColumnDependentReference \| undefined, list:(ColumnDependentReference \| undefined)[]):void; |


IRoleEntitlements (*4 changes*)

| Type | Change |
| -------- | ------- |
| *MethodSignature deleted* | getEntitlementFkName |
| *PropertySignature added* | entitlementFkName |
| *MemberMismatch* | createEntitlementAssignmentEntity(role:IEntity,~~entlType:RoleAssignmentData~~ **entlType?:RoleAssignmentData**):IEntity \| undefined; |
| *MemberMismatch* | getEntitlementTypes(~~role:IEntity~~**role?:IEntity**):Promise<RoleAssignmentData[]>; |


IRoleMembershipType (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MethodSignature deleted* | getSchema |
| *MethodSignature added* | GetSchema |


ItshopRequest (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | readonly parameterColumns:(IEntityColumn \| undefined)[]; |


ItshopService (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getPeerGroupMemberships(parameters:CollectionLoadParameters \| ServiceItemParameters, requestOpts?:ApiRequestOptions):Promise<ExtendedTypedEntityCollection<PortalItshopPeergroupMemberships,ServiceItemsExtendedData>>; |
| *MemberMismatch* | getServiceItem(serviceItemUid:string, isSkippable?:boolean):Promise<PortalShopServiceitems \| undefined>; |


JustificationService (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | createCdr(justificationType:JustificationType):Promise<BaseCdr \| undefined>; |
| *MemberMismatch* | get(uid:string):Promise<PortalJustifications \| undefined>; |


MyResponsibilitiesRegistryService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getNavItems(preProps:string[], features:string[], projectConfig?:ProjectConfig):(SideNavigationExtension \| undefined)[]; |


NewRequestSelectionService (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | selectedProductEntities |
| *MemberMismatch* | addProducts(products:TypedEntity[], productSource?:SelectedProductSource, wholeBundle?:boolean, productBundle?:PortalItshopPatternRequestable):void; |


NotificationRegistryService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | get(id:string):NotificationHandler \| null \| undefined; |


ObjectHyperviewService (*1 change*)

| Type | Change |
| -------- | ------- |
| *Method added* | getNavigationPermission |


OpSupportUserService (*1 change*)

| Type | Change |
| -------- | ------- |
| *Method added* | getFeatures |


ParameterContainer (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | add(uniqueId:string, parameter:ParameterData, extendedDataGenerator:(newValue: any) => TExtendedData):IEntityColumn \| undefined; |


ParameterDataService (*3 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | createContainer<TData>(entity:IEntity, extendedCollectionData:ExtendedCollectionData<TData> \| undefined, getCandidates:(loadParameters:ParameterDataLoadParameters) =>Promise<EntityCollectionData>, getFilterTree:(loadParameters:ParameterDataLoadParameters) =>Promise<FilterTreeData>):ParameterDataContainer; |
| *MemberMismatch* | createExtendedDataWrapper<TData>(entity:IEntity, extendedCollectionData:ExtendedCollectionData<TData> \| undefined, getCandidates:(loadParameters:ParameterDataLoadParameters) =>Promise<EntityCollectionData>, getFilterTree:(loadParameters:ParameterDataLoadParameters) =>Promise<FilterTreeData>):ExtendedDataWrapper<TData \| undefined>; |
| *MemberMismatch* | createParameterColumns(entity:IEntity, parameters:ParameterData[], getCandidates:(loadParameters:ParameterDataLoadParameters) =>Promise<EntityCollectionData>, getFilterTree:(loadParameters:ParameterDataLoadParameters) =>Promise<FilterTreeData>):(IEntityColumn \| undefined)[]; |


PasscodeLoginModule (*1 change*)

| Type | Change |
| -------- | ------- |
| *Constructor deleted* |  |


PasscodeService (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getValidationDuration():Promise<number \| undefined>; |
| *MemberMismatch* | showPasscode(passcode:PersonPasscodeResult, userDisplay:string, managerDisplay:string, duration:number \| undefined):Promise<void>; |


PasswordQuestionsComponent (*9 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | dstSettings |
| *Property deleted* | dstWrapper |
| *Property deleted* | navigationState |
| *Method deleted* | onHighlightedEntityChanged |
| *Method deleted* | onSelectionChanged |
| *Property deleted* | totalCount |
| *Property added* | dataSource |
| *Property added* | displayedColumns |
| *MemberMismatch* | getData():void; |


PersonService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getAll(parameters?:CollectionLoadParameters, **signal?:AbortSignal**):Promise<TypedEntityCollectionData<PortalPersonAll>>; |


ProfileComponent (*3 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | readonly confirmChange:{ check: () =>Promise<boolean>; }; |
| *MemberMismatch* | mailToBeUnsubscribed:MailInfoType \| undefined; |
| *MemberMismatch* | unsubscribe(uidMail:string \| undefined):Promise<any>; |


QaLoginModule (*1 change*)

| Type | Change |
| -------- | ------- |
| *Constructor deleted* |  |


QerApiService (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Method added* | initClient |
| *MemberMismatch* | get v2Client():V2Client; |


QerPermissionsService (*3 changes*)

| Type | Change |
| -------- | ------- |
| *Method deleted* | isPasswordHelpdesk |
| *Method deleted* | isTsbNameSpaceAdminBase |
| *Method added* | isHyperviewNavigation |


RecommendationSidesheetComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | data |


RequestDisplayComponent (*4 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | False |
| *MemberMismatch* | isReadOnly:boolean; |
| *MemberMismatch* | False |
| *MemberMismatch* | personWantsOrg:PortalItshopRequests; |


RequestHistoryFilterComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | clearPersonFilterSelection(~~clearSelectControl?:boolean~~**filter:DataSourceToolbarSelectedFilter**, emit?:boolean):void; |
| *MemberMismatch* | personSelected(~~selected:EuiSelectOption~~**selectedValues:EuiSelectOption \| EuiSelectOption[]**):void; |


RequestInfoComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | parameters:(BaseReadonlyCdr \| undefined)[]; |
| *MemberMismatch* | serviceItem:PortalShopServiceitems \| undefined; |


RequestParameterDataEntity (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | parameterColumns:(IEntityColumn \| undefined)[]; |


RequestsComponent (*7 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | dstSettings |
| *Property deleted* | filterOptions |
| *Property deleted* | navigationState |
| *Method deleted* | onNavigationStateChanged |
| *Method deleted* | onRequestShopSelected |
| *Method deleted* | onSearch |
| *Property added* | dataSource |


RequestsService (*4 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getShopStructures(navigationState:CollectionLoadParameters, parentId?:string, **signal?:AbortSignal**):Promise<TypedEntityCollectionData<PortalShopConfigStructure>>; |
| *MemberMismatch* | removeRequestConfigMemberExclusions(uidDynamicGroup:string, exclusions:TypedEntity[]):Promise<any>; |
| *MemberMismatch* | removeRequestConfigMembers(customerNodeId:string, uidDynamicGroup:string, members:TypedEntity[], description?:string):Promise<any>; |
| *MemberMismatch* | selectedEntitlementType:IRequestableEntitlementType \| null; |


RequestTableComponent (*12 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | dstSettings |
| *Method deleted* | onHighlightedEntityChanged |
| *Method deleted* | onSearch |
| *Method deleted* | onSelectionChanged |
| *Property deleted* | requestHistoryFilters |
| *Property added* | dataSource |
| *Property added* | filterByDelegations |
| *Property added* | filterMyPendings |
| *Property added* | uidpwo |
| *Property added* | uniqueTableConfig |
| *MemberMismatch* | getAdditionalText(entity:ItshopRequest~~additional:IClientProperty[]~~):string; |
| *MemberMismatch* | getData(~~newState?:RequestHistoryLoadParameters, isInit?:boolean~~):Promise<void>; |


RiskAnalysisComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getRiskObjectTop():RiskObject \| undefined; |


RiskConfigComponent (*7 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | dataModelWrapper |
| *Property deleted* | dstSettings |
| *Property deleted* | dstWrapper |
| *Property added* | dataModel |
| *Property added* | dataSource |
| *Property added* | displayedColumns |
| *MemberMismatch* | getData(~~newState?:CollectionLoadParameters~~):void; |


RoleDetailComponent (*3 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | get objectType():string \| undefined; |
| *MemberMismatch* | get objectUid():string \| undefined; |
| *MemberMismatch* | parameters:{ tablename?: string; entity?:IEntity; }; |


RoleMembershipsComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | get uidDynamicGroup():string; |


RoleRecommendationsComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | readonly data:{ tablename: string; uidRole: string; canEdit: boolean; infoText?: string; recommendation?:RoleRecommendationItem[]; selectionTitle?: string; submitButtonTitle?: string; actionColumnTitle?: string; hideActionConfirmation?: boolean; applyWithoutSelection?: boolean; noDataText?: string; }; |
| *MemberMismatch* | onSelectionChanged(items:TypedEntity[]):Promise<any>; |


RoleService (*30 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | dynamicMethodSvc |
| *Method added* | getHelpContextId |
| *MemberMismatch* | canCreate(tableName:string \| undefined, isAdmin:boolean, userCanCreateAeRole:boolean):Promise<boolean>; |
| *MemberMismatch* | canHaveDynamicMemberships(tableName:string \| undefined):boolean; |
| *MemberMismatch* | createEntitlementAssignmentEntity(role:IEntity, entlType:RoleAssignmentData):IEntity \| undefined; |
| *MemberMismatch* | exists(tableName:string \| undefined):boolean; |
| *MemberMismatch* | get(tableName:string, isAdmin?:boolean, navigationState?:CollectionLoadParameters):Promise<TypedEntityCollectionData<TypedEntity> \| undefined>; |
| *MemberMismatch* | getCandidates(id:string \| undefined, navigationState?:CollectionLoadParameters):Promise<ExtendedTypedEntityCollection<TypedEntity, unknown> \| undefined>; |
| *MemberMismatch* | getCandidatesDataModel(id:string \| undefined):Promise<DataModel>; |
| *MemberMismatch* | getDataModel(tableName:string \| undefined, isAdmin:boolean):Promise<DataModel>; |
| *MemberMismatch* | getEditableFields(objectType:string \| undefined, entity:IEntity \| undefined, primary?:boolean):Promise<string[]>; |
| *MemberMismatch* | getEntitiesForTree(tableName:string \| undefined, navigationState:CollectionLoadParameters):Promise<EntityCollectionData \| undefined>; |
| *MemberMismatch* | getEntitlementFkName():string \| undefined; |
| *MemberMismatch* | getEntitlements(args:{ id: string \| undefined; navigationState?:CollectionLoadParameters; objectKey?: string; }):Promise<ExtendedTypedEntityCollection<TypedEntity, unknown> \| undefined>; |
| *MemberMismatch* | getEntitlementTypes(role:IEntity \| undefined):Promise<RoleAssignmentData[] \| undefined>; |
| *MemberMismatch* | getExportMethod(tableName:string \| undefined, isAdmin:boolean, navigationState:CollectionLoadParameters):DataSourceToolbarExportMethod \| undefined; |
| *MemberMismatch* | getInteractive(tableName:string, id:string, isAdmin?:boolean):Promise<TypedEntity \| undefined>; |
| *MemberMismatch* | getInteractiveInternal():Promise<TypedEntity \| undefined>; |
| *MemberMismatch* | getInteractiveNew(tableName:string \| undefined):Promise<WriteExtTypedEntity<RoleExtendedDataWrite> \| undefined>; |
| *MemberMismatch* | getMembershipEntitySchema(~~key:string~~):EntitySchema \| undefined; |
| *MemberMismatch* | getMemberships(args:{ id: string \| undefined; navigationState?:CollectionLoadParameters; }):Promise<ExtendedTypedEntityCollection<TypedEntity, unknown> \| undefined>; |
| *MemberMismatch* | getPrimaryMemberships(args:{ id: string \| undefined; navigationState?:CollectionLoadParameters; }):Promise<ExtendedTypedEntityCollection<TypedEntity, unknown> \| undefined>; |
| *MemberMismatch* | getPrimaryMembershipSchema():EntitySchema \| undefined; |
| *MemberMismatch* | getRoleEntitySchema(tableName:string \| undefined, interactive?:boolean, isAdmin?:boolean):EntitySchema \| undefined; |
| *MemberMismatch* | getRoleTranslateKeys(tableName:string \| undefined):RoleTranslateKeys; |
| *MemberMismatch* | getRoleTypeInfo():RoleObjectInfo \| undefined; |
| *MemberMismatch* | getType(tableName:string \| undefined, admin?:boolean):any \| undefined; |
| *MemberMismatch* | getUidRole(item:TypedEntity \| undefined):string; |
| *MemberMismatch* | hasHierarchy(tablename:string \| undefined, isAdmin:boolean):boolean; |
| *MemberMismatch* | removeMembership(item:TypedEntity, role:string \| undefined):Promise<void>; |


RolesOverviewComponent (*5 changes*)

| Type | Change |
| -------- | ------- |
| *Method deleted* | onSearch |
| *Property added* | dataSource |
| *MemberMismatch* | dstSettings:DataSourceToolbarSettings \| undefined; |
| *MemberMismatch* | entitySchema:EntitySchema \| undefined; |
| *MemberMismatch* | get restoreHandler():IRoleRestoreHandler \| undefined; |


ServiceCategoriesService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | get(parameters?:CollectionLoadParameters):Promise<TypedEntityCollectionData<PortalServicecategories> \| undefined>; |


ServiceItemsEditFormComponent (*4 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getColumn(name:string):IEntityColumn \| undefined; |
| *MemberMismatch* | isInActiveFormControl:FormControl<boolean \| null>; |
| *MemberMismatch* | onFormControlCreated(control:AbstractControl, cdr?:ColumnDependentReference):void; |
| *MemberMismatch* | onImageValueChanged(~~control:AbstractControl,cdr:BaseCdr~~**cdr?:ColumnDependentReference**):void; |


SettingsComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *Property added* | userCulture |


StatisticsForObjectsComponent (*7 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | chartHasData(chartInfo:ChartInfoTyped):boolean; |
| *MemberMismatch* | chartIsLoading(chartInfo:ChartInfoTyped):boolean; |
| *MemberMismatch* | charts:ChartInfoTyped[]; |
| *MemberMismatch* | getChartOptionsWithHistory(chartInfo:ChartInfoTyped):{ chartData:ChartDto; tableData:TypedEntityCollectionData<ChartDataTyped>; chartOptions:ChartOptions; } \| undefined; |
| *MemberMismatch* | getDetails(chartInfo:ChartInfoTyped, chartDetails:ChartDetails):void; |
| *MemberMismatch* | getSummaryStat(chartInfo:ChartInfoTyped):ChartDto \| undefined; |
| *MemberMismatch* | openStatistic(chartInfo:ChartInfoTyped):Promise<void>; |


TermsOfUseItem (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | UID_QERTermsOfUse:IReadValue<string> \| undefined; |


TermsOfUseService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getDownloadOptions(~~key:string,display:string~~**item:PortalTermsofuse**):EuiDownloadOptions; |


TermsOfUseViewerComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *Method deleted* | getDownloadOptions |
| *Property added* | termsOfUseService |


ViewConfigService (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getInitialDSTExtension(dataModel:DataModel, viewId:string, **signal?:AbortSignal**):Promise<DataSourceToolbarViewConfig>; |
| *MemberMismatch* | getViewConfig(viewId:string, **signal?:AbortSignal**):Promise<ViewConfigData[]>; |


ViewDevicesComponent (*15 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | dataModelWrapper |
| *Property deleted* | dstSettings |
| *Property deleted* | dstSettingsHardwareType |
| *Property deleted* | dstWrapper |
| *Property deleted* | dstWrapperHardwareType |
| *Property deleted* | entitySchemaHardwareType |
| *Property deleted* | hardwareTypeDataModelWrapper |
| *Property added* | dataModel |
| *Property added* | dataSource |
| *Property added* | displayedColumns |
| *Property added* | hardwareCandidates |
| *Property added* | qerPermissionService |
| *MemberMismatch* | deviceConfig:DeviceConfig \| undefined; |
| *MemberMismatch* | deviceModelValueStruct:ValueStruct<string>[] \| undefined; |
| *MemberMismatch* | getData(~~newState?:CollectionLoadParameters~~):Promise<void>; |




# rps `(1 change)`
SubscriptionsComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | editSubscription(subscription:TypedEntity):Promise<void>; |




# tsb `(32 changes)`
AccountsExtComponent (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | referrer:{ objecttable?: string; objectuid: string; tablename?: string; }; |


AccountSidesheetComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | linkedIdentitiesManager:DbObjectKey \| undefined; |
| *MemberMismatch* | parameters:{ objecttable: string; objectuid: string; display: string; }; |


AccountsService (*1 change*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getAccounts(navigationState:CollectionLoadParameters, **signal:AbortSignal**):Promise<TypedEntityCollectionData<PortalTargetsystemUnsAccount>>; |


DataExplorerAccountsComponent (*9 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | applyIssuesFilter |
| *Property deleted* | dataExplorerFilters |
| *Property deleted* | dstSettings |
| *Method deleted* | filterByTree |
| *Property deleted* | issuesFilterMode |
| *Method deleted* | onNavigationStateChanged |
| *Method deleted* | onSearch |
| *Property deleted* | targetSystemData |
| *Property added* | dataSource |


DataExplorerFiltersComponent (*2 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | setSelectedContainer(~~selected:EuiSelectOption~~**chosen:EuiSelectOption \| EuiSelectOption[]**):void; |
| *MemberMismatch* | targetSystemSelected(~~selected:EuiSelectOption~~**chosen:EuiSelectOption \| EuiSelectOption[]**):void; |


DataExplorerGroupsComponent (*10 changes*)

| Type | Change |
| -------- | ------- |
| *Property deleted* | dataTable |
| *Property deleted* | dstSettings |
| *Method deleted* | filterByTree |
| *Property deleted* | navigationState |
| *Method deleted* | onNavigationStateChanged |
| *Method deleted* | onSearch |
| *Property added* | dataSource |
| *MemberMismatch* | onGroupChanged(group:PortalTargetsystemUnsGroup \| PortalRespUnsgroup):Promise<void>; |
| *MemberMismatch* | onGroupSelected(selected:Array<PortalTargetsystemUnsGroup \| PortalRespUnsgroup>):void; |
| *MemberMismatch* | selectedGroupsForUpdate:Array<PortalTargetsystemUnsGroup \| PortalRespUnsgroup>; |


GroupSidesheetComponent (*3 changes*)

| Type | Change |
| -------- | ------- |
| *Property added* | sidesheetData |
| *MemberMismatch* | buttonBarExtensionReferrer:{ type: string; uidGroup: string; defaultDownloadOptions?:EuiDownloadOptions; }; |
| *MemberMismatch* | parameters:{ objecttable: string; objectuid: string; display: string; }; |


GroupsService (*4 changes*)

| Type | Change |
| -------- | ------- |
| *MemberMismatch* | getGroupDirectMembers(groupId:string, navigationState:CollectionLoadParameters, **signal?:AbortSignal**):Promise<TypedEntityCollectionData<PortalTargetsystemUnsDirectmembers>>; |
| *MemberMismatch* | getGroupNestedMembers(groupId:string, navigationState:CollectionLoadParameters, **signal?:AbortSignal**):Promise<TypedEntityCollectionData<PortalTargetsystemUnsNestedmembers>>; |
| *MemberMismatch* | getGroups(navigationState:GetGroupsOptionalParameters, **signal:AbortSignal**):Promise<TypedEntityCollectionData<PortalTargetsystemUnsGroup>>; |
| *MemberMismatch* | getGroupsResp(navigationState:GetGroupsOptionalParameters, **signal:AbortSignal**):Promise<TypedEntityCollectionData<PortalRespUnsgroup>>; |