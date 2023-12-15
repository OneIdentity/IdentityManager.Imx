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

import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { CollectionLoadParameters, EntityValue, IWriteValue, LocalProperty, ValueStruct } from 'imx-qbm-dbts';
import { PortalItshopPatternRequestable, PortalServicecategories, PortalShopServiceitems } from 'imx-api-qer';

import { AuthenticationService, DataSourceToolbarComponent, DataSourceToolbarSettings, EntityService, SettingsService } from 'qbm';
import { QerApiService } from '../qer-api-client.service';
import { PersonService } from '../person/person.service';
import { ServiceItemParameters } from './new-request-product/service-item-parameters';
import { NewRequestTabModel } from './new-request-tab/new-request-tab-model';
import { SelectedProductSource } from './new-request-selected-products/selected-product-item.interface';
import { NewRequestSelectionService } from './new-request-selection.service';
import { CurrentProductSource } from './current-product-source';

@Injectable({
  providedIn: 'root',
})
export class NewRequestOrchestrationService implements OnDestroy {

  //#region Private properties
  private userUid: string;
  private defaultUser: ValueStruct<string>;
  //#endregion

  //#region Public properties

  //#region Recipients
  private recipientsProperty: IWriteValue<string>;
  public get recipients(): IWriteValue<string> {
    return this.recipientsProperty;
  }
  public set recipients(value: IWriteValue<string>) {
    this.recipientsProperty = value;
    this.recipients$.next(value);
  }
  public recipients$ = new BehaviorSubject<IWriteValue<string>>(null);
  //#endregion

  //#region Current Product Source
  private currentProductSourceProperty: CurrentProductSource;
  public get currentProductSource(): CurrentProductSource {
    return this.currentProductSourceProperty;
  }
  public set currentProductSource(value: CurrentProductSource) {
    value.dst.itemStatus = {
      enabled: (prod: PortalShopServiceitems): boolean => {
        return prod.IsRequestable === undefined || prod.IsRequestable?.value;
      }
    };
    this.currentProductSourceProperty = value;
    this.currentProductSource$.next(value);
  }

  public currentProductSource$ = new BehaviorSubject<CurrentProductSource>(null);
  //#endregion

  //#region DST Settings
  public dstSettingsAllProducts: DataSourceToolbarSettings;
  public dstSettingsPeerGroupProducts: DataSourceToolbarSettings;
  public dstSettingsPeerGroupOrgs: DataSourceToolbarSettings;
  public dstSettingsReferenceUserProducts: DataSourceToolbarSettings;
  public dstSettingsReferenceUserOrgs: DataSourceToolbarSettings;
  public dstSettingsProductBundles: DataSourceToolbarSettings;
  //#endregion

  //#region Search Api
  public searchApi$ = new BehaviorSubject<() => Observable<any>>(null);

  private disableSearchProperty: boolean;
  public get disableSearch(): boolean {
    return this.disableSearchProperty;
  }
  public set disableSearch(value: boolean) {
    this.disableSearchProperty = value;
    this.disableSearch$.next(value);
  }
  public disableSearch$ = new BehaviorSubject<boolean>(null);
  //#endregion

  //#region Navigation State
  private navigationStateProperty: CollectionLoadParameters | ServiceItemParameters;
  public get navigationState(): CollectionLoadParameters | ServiceItemParameters {
    return this.navigationStateProperty;
  }
  public set navigationState(value: CollectionLoadParameters | ServiceItemParameters) {
    this.navigationStateProperty = value;
    this.navigationState$.next(value);
  }
  public navigationState$ = new BehaviorSubject<CollectionLoadParameters | ServiceItemParameters>(null);
  //#endregion

  //#region Selected Tab
  private selectedTabProperty: NewRequestTabModel;
  public get selectedTab(): NewRequestTabModel {
    return this.selectedTabProperty;
  }
  public set selectedTab(value: NewRequestTabModel) {
    this.selectedTabProperty = value;
    // this.dst?.clearSearch();

    this.selectedTab$.next(value);
    // this.clearSearch$.next(true);
  }
  public selectedTab$ = new BehaviorSubject<NewRequestTabModel>(null);
  //#endregion

  // CHECK - Do we need this
  //#region Search
  // public searchInProgress$ = new BehaviorSubject<boolean>(false);
  // public clearSearch$ = new BehaviorSubject<boolean>(false);
  //#endregion

  //#region Selected Chip
  private selectedChipProperty: number;
  public get selectedChip(): number {
    return this.selectedChipProperty;
  }
  public set selectedChip(value: number) {
    this.selectedChipProperty = value;
    this.selectedChip$.next(value);

  }
  public selectedChip$ = new BehaviorSubject<number>(null);
  //#endregion

  //#region Selected Category. If no category is selected (we are on root level) show root level text.
  private selectedCategoryProperty: PortalServicecategories;
  public get selectedCategory(): PortalServicecategories {
    return this.selectedCategoryProperty;
  }
  public set selectedCategory(value: PortalServicecategories) {
    this.selectedCategoryProperty = value;
    this.selectedCategory$.next(value);
  }
  public selectedCategory$ = new BehaviorSubject<PortalServicecategories>(null);
  //#endregion

  //#region Product Selection: Include Child Categories
  private includeChildCategoriesProperty: boolean;
  public get includeChildCategories(): boolean {
    return this.includeChildCategoriesProperty;
  }
  public set includeChildCategories(value: boolean) {
    this.includeChildCategoriesProperty = value;
    this.includeChildCategories$.next(value);
  }
  public includeChildCategories$ = new BehaviorSubject<boolean>(false);
  //#endregion

  //#region Reference User
  private referenceUserProperty: ValueStruct<string>;
  public get referenceUser(): ValueStruct<string> {
    return this.referenceUserProperty;
  }
  public set referenceUser(value: ValueStruct<string>) {
    this.referenceUserProperty = value;
    this.referenceUser$.next(value);
  }
  public referenceUser$ = new BehaviorSubject<ValueStruct<string>>(null);
  //#endregion

  //#region Product Bundle
  private productBundleProperty: PortalItshopPatternRequestable;
  public get productBundle(): PortalItshopPatternRequestable {
    return this.productBundleProperty;
  }
  public set productBundle(value: PortalItshopPatternRequestable) {
    this.productBundleProperty = value;
    this.productBundle$.next(value);
  }
  public productBundle$ = new BehaviorSubject<PortalItshopPatternRequestable>(null);
  //#endregion

  //#region SelectedView
  private selectedViewProperty: SelectedProductSource;
  public get selectedView(): SelectedProductSource {
    return this.selectedViewProperty;
  }
  public set selectedView(value: SelectedProductSource) {
    this.selectedViewProperty = value;
    this.selectedView$.next(value);
  }
  public selectedView$ = new BehaviorSubject<SelectedProductSource>(null);
  //#endregion

  //#region AbortController
  public abortController = new AbortController();
  //#endregion

  //#endregion

  constructor(
    authentication: AuthenticationService,
    private readonly qerClient: QerApiService,
    private readonly entityService: EntityService,
    private readonly personProvider: PersonService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly selectionService: NewRequestSelectionService,
    settingsService: SettingsService
  ) {
    this.navigationState = { PageSize: settingsService.DefaultPageSize, StartIndex: 0 };
    authentication.onSessionResponse.subscribe(async (elem) => {
      this.userUid = elem.UserUid;

      if (this.userUid == null) {
        return;
      }

      await this.initRecipients();
    });
  }

  public ngOnDestroy(): void {
    this.referenceUser = null;
  }

  public preselectBySource(source: SelectedProductSource, dst: DataSourceToolbarComponent): void {
    if (this.selectionService.selectedProducts == null || dst == null) {
      return;
    }

    dst.preSelection = this.selectionService.selectedProducts.filter((x) => x.source === source).map((x) => x.item);

    dst.selection.clear();
    dst.preSelection.forEach((item) => dst.selection.checked(item));
  }

  public async setDefaultUser(): Promise<void> {
    await this.recipients.Column.PutValueStruct(this.defaultUser);
    this.recipients$.next(this.recipients);
  }

  public async setRecipients(value: ValueStruct<string>): Promise<void> {
    await this.recipients.Column.PutValueStruct(value);    
    this.recipients$.next(this.recipients);
  }

  public abortCall(): void {
    this.abortController.abort();
    this.abortController = new AbortController();
  }

  private async initRecipients(): Promise<void> {
    // define the recipients as a multi-valued property
    const recipientsProp = new LocalProperty();
    recipientsProp.IsMultiValued = true;
    recipientsProp.ColumnName = 'UID_PersonOrdered';
    recipientsProp.MinLen = 1;
    recipientsProp.FkRelation = this.qerClient.typedClient.PortalCartitem.GetSchema().Columns.UID_PersonOrdered.FkRelation;

    const dummyCartItemEntity = this.qerClient.typedClient.PortalCartitem.createEntity().GetEntity();
    const fkProviderItems = this.qerClient.client.getFkProviderItems('portal/cartitem').map((item) => ({
      ...item,
      load: (_, parameters = {}) => item.load(dummyCartItemEntity, parameters),
      getDataModel: async (entity) => item.getDataModel(entity),
      getFilterTree: async (entity, parentKey) => item.getFilterTree(entity, parentKey),
    }));

    const column = this.entityService.createLocalEntityColumn(recipientsProp, fkProviderItems, { Value: this.userUid });
    this.recipients = new EntityValue(column);

    // preset recipient to the current user
    await this.recipients.Column.PutValueStruct({
      DataValue: this.userUid,
      DisplayValue: await this.getPersonDisplay(this.userUid),
    });

    const uidPerson = this.activatedRoute.snapshot.paramMap.get('UID_Person');

    if (uidPerson) {
      await this.recipients.Column.PutValueStruct({
        DataValue: uidPerson,
        DisplayValue: await this.getPersonDisplay(uidPerson),
      });

      // TODO in this case, CanRequestForSomebodyElse is false
    }
    this.defaultUser = {
      DataValue: this.recipients.Column.GetValue(),
      DisplayValue: this.recipients.Column.GetDisplayValue(),
    };
  }

  private async getPersonDisplay(uid: string): Promise<string> {
    const person = await this.personProvider.get(uid);
    if (person && person.Data.length) {
      return person.Data[0].GetEntity().GetDisplay();
    }

    return uid;
  }
}
