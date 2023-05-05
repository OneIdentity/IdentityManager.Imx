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
 * Copyright 2021 One Identity LLC.
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

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { Router, ActivatedRoute } from '@angular/router';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { MatSelectChange } from '@angular/material/select';
import { Subscription } from 'rxjs';

import { IWriteValue, EntityValue, LocalProperty, ValueStruct, MultiValue } from 'imx-qbm-dbts';
import {
  PortalShopServiceitems,
  PortalShopCategories,
  PortalItshopPeergroupMemberships,
  RequestableProductForPerson,
  QerProjectConfig,
  PortalItshopPatternRequestable,
} from 'imx-api-qer';

import {
  ColumnDependentReference,
  FkAdvancedPickerComponent,
  MessageDialogComponent,
  EntityService,
  BaseReadonlyCdr,
  BaseCdr,
  AuthenticationService,
} from 'qbm';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { UserModelService } from '../user/user-model.service';
import { PersonService } from '../person/person.service';
import { ServiceItemsService } from '../service-items/service-items.service';
import { CartItemsService } from '../shopping-cart/cart-items.service';
import { QerApiService } from '../qer-api-client.service';
import { ServiceCategoryListComponent } from './servicecategory-list/servicecategory-list.component';
import { ServiceitemListComponent } from '../service-items/serviceitem-list/serviceitem-list.component';
import { ProductSelectionService } from './product-selection.service';
import { CategoryTreeComponent } from './servicecategory-list/category-tree.component';
import { RoleMembershipsComponent } from './role-memberships/role-memberships.component';
import { RecipientsWrapper } from './recipients-wrapper';
import { ShelfService } from '../itshop/shelf.service';
import { ProductDetailsSidesheetComponent } from './product-details-sidesheet/product-details-sidesheet.component';
import { PatternDetailsSidesheetComponent } from './pattern-details-sidesheet/pattern-details-sidesheet.component';
import { PatternItemService } from '../pattern-item-list/pattern-item.service';
import { PatternItemListComponent } from '../pattern-item-list/pattern-item-list.component';

/** Main entry component for the product selection page. */
@Component({
  templateUrl: './product-selection.component.html',
  styleUrls: ['./product-selection.component.scss'],
  selector: 'imx-product-selection',
})
export class ProductSelectionComponent implements OnInit, OnDestroy {
  @ViewChild(ServiceitemListComponent) public serviceitemListComponent: ServiceitemListComponent;
  @ViewChild(PatternItemListComponent) public patternitemListComponent: PatternItemListComponent;
  @ViewChild(ServiceCategoryListComponent) public serviceCategoryListComponent: ServiceCategoryListComponent;

  public readonly dataSourceView = { selected: 'cardlist' };
  public includeChildCategories: boolean;
  public cartItemRecipients: ColumnDependentReference;
  public cartItemRecipientsReadonly: ColumnDependentReference;
  public canRequestForSomebodyElse: boolean;
  public recipients: IWriteValue<string>;
  public recipientsWrapper: RecipientsWrapper;
  public uidaccproduct: string;
  public searchString: string;
  public selectedItems: PortalShopServiceitems[] = [];
  public selectedTemplates: PortalItshopPatternRequestable[] = [];
  public selectedRoles: PortalItshopPeergroupMemberships[] = [];
  public employeePreselected: boolean;
  public canSelectFromTemplate: boolean;
  public canSelectByRefUser: boolean;
  public selectedCategory: PortalShopCategories;
  public referenceUser: ValueStruct<string>;
  public uidPersonPeerGroup: string;
  public displayProducts = true;
  public recipientType: 'self' | 'others' = 'self';
  public showTemplates = false;
  private authSubscription: Subscription;

  private userUid: string;

  private projectConfig: QerProjectConfig;

  @ViewChild(RoleMembershipsComponent) private roles: RoleMembershipsComponent;
  @ViewChild(MatTabGroup) private tabControl: MatTabGroup;

  constructor(
    private readonly translate: TranslateService,
    private qerClient: QerApiService,
    private router: Router,
    private dialogService: MatDialog,
    private projectConfigService: ProjectConfigurationService,
    private userModelSvc: UserModelService,
    private activatedRoute: ActivatedRoute,
    private readonly personProvider: PersonService,
    private readonly busyIndicator: EuiLoadingService,
    private readonly serviceItemsProvider: ServiceItemsService,
    private readonly patternItemsService: PatternItemService,
    private readonly cartItemsProvider: CartItemsService,
    private readonly shelfService: ShelfService,
    private readonly sideSheetService: EuiSidesheetService,
    private readonly productSelectionService: ProductSelectionService,
    private readonly entityService: EntityService,
    authentication: AuthenticationService
  ) {
    this.authSubscription = authentication.onSessionResponse.subscribe((elem) => {
      this.userUid = elem.UserUid;
    });

    // apply project configuration
    this.projectConfigService.getConfig().then(config => {
      this.projectConfig = config;
      this.employeePreselected = this.projectConfig.ITShopConfig.VI_ITShop_Employee_Preselected;
      this.canSelectFromTemplate = this.projectConfig.ITShopConfig.VI_ITShop_ProductSelectionFromTemplate;
      this.canSelectByRefUser = this.projectConfig.ITShopConfig.VI_ITShop_ProductSelectionByReferenceUser;

    });
  }

  public ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  public async ngOnInit(): Promise<void> {
    // define the recipients as a multi-valued property
    const recipientsProperty = new LocalProperty();
    recipientsProperty.IsMultiValued = true;
    recipientsProperty.ColumnName = 'UID_PersonOrdered';
    recipientsProperty.MinLen = 1;
    recipientsProperty.FkRelation = this.qerClient.typedClient.PortalCartitem.GetSchema().Columns.UID_PersonOrdered.FkRelation;

    const dummyCartItemEntity = this.qerClient.typedClient.PortalCartitem.createEntity().GetEntity();
    const fkProviderItems = this.qerClient.client.getFkProviderItems('portal/cartitem').map((item) => ({
      ...item,
      load: (_, parameters = {}) => item.load(dummyCartItemEntity, parameters),
      getDataModel: async (entity) => item.getDataModel(entity),
      getFilterTree: async (entity, parentKey) => item.getFilterTree(entity, parentKey),
    }));

    const column = this.entityService.createLocalEntityColumn(recipientsProperty, fkProviderItems, { Value: this.userUid });
    this.recipients = new EntityValue(column);

    this.recipientsWrapper = new RecipientsWrapper(this.recipients);

    this.canRequestForSomebodyElse = (await this.userModelSvc.getUserConfig()).CanRequestForSomebodyElse;

    // TODO activatedRoute parameters may change, must subscribe to changes

    this.uidaccproduct = this.activatedRoute.snapshot.paramMap.get('UID_AccProduct');
    if (this.uidaccproduct) {
      // TODO load all according to this.categoryModel.SelectedCategory
    }

    this.searchString = this.activatedRoute.snapshot.paramMap.get('ProductSearchString');
    if (this.searchString) {
      /* user can pass product search string by URL parameter -> load the data with this search string
       */
    }

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

    this.cartItemRecipients = new BaseCdr(this.recipients.Column, '#LDS#Recipients');

    this.cartItemRecipientsReadonly = new BaseReadonlyCdr(this.recipients.Column, '#LDS#Target identities');
  }

  public openCategoryTree(): void {
    const sidesheetRef = this.sideSheetService.open(CategoryTreeComponent, {
      title: this.productSelectionService.getServiceCategoryDisplaySingular(),
      width: '600px',
      headerColour: 'iris-blue',
      testId: 'categorytree-sidesheet',
      data: {
        selectedServiceCategory: this.selectedCategory,
        recipients: this.recipients,
        showImage: false,
      },
    });

    sidesheetRef.afterClosed().subscribe((category: PortalShopCategories) => {
      if (category == null) {
        return;
      }

      this.onServiceCategorySelected(category);
    });
  }

  public onServiceCategorySelected(selectedCategory: PortalShopCategories): void {
    this.serviceitemListComponent.resetKeywords();
    this.selectedCategory = selectedCategory;

    if (this.selectedCategory == null) {
      this.serviceCategoryListComponent.resetCategory();
    }
  }

  public showProductGroupSelector(): boolean {
    return this.requesterSelected() && !this.uidaccproduct;
  }

  public getDataSourceView(): { selected: string } {
    return this.uidPersonPeerGroup ? { selected: 'table' } : this.dataSourceView;
  }

  public showRequestsForRecipient(): void {
    if (this.recipients) {
      // this method can only show the history for the first recipient. TODO
      const uidPerson = this.recipientsWrapper?.uids;
      if (uidPerson.length > 0) {
        this.router.navigate(['requests', 'for', uidPerson[0]]);
      }
    } else {
      // TODO: log error
    }
  }

  public async selectReferenceUser(): Promise<void> {
    const disabledIds =
      this.recipients.Column?.GetValue()?.split('').length === 1 ? this.recipients.Column?.GetValue()?.split('') : undefined;

    const selection = await this.sideSheetService
      .open(FkAdvancedPickerComponent, {
        title: await this.translate.get('#LDS#Heading Select Reference User').toPromise(),
        padding: '0',
        width: '600px',
        headerColour: 'iris-blue',
        testId: 'referenceUser-sidesheet',
        data: {
          displayValue: '',
          fkRelations: this.qerClient.typedClient.PortalCartitem.createEntity().UID_PersonOrdered.GetMetadata().GetFkRelations(),
          isMultiValue: false,
          disabledIds: disabledIds,
        },
      })
      .afterClosed()
      .toPromise();

    if (selection && selection.candidates?.length > 0) {
      this.setReferenceUser(selection.candidates[0]);
    }
  }

  public setReferenceUser(user: ValueStruct<string>): void {
    this.referenceUser = user;
    this.selectedCategory = undefined;
    this.uidPersonPeerGroup = undefined;
  }

  public setPeerGroupPerson(uidPerson: string): void {
    this.showTemplates = false;
    this.uidPersonPeerGroup = uidPerson;
    this.selectedCategory = undefined;

    if (uidPerson != null) {
      this.referenceUser = undefined;
    }
  }

  public cancelPeerOrReference(): void {
    this.referenceUser = undefined;
    this.uidPersonPeerGroup = undefined;
    this.selectedRoles = [];
    this.selectedCategory = undefined;
    this.displayProducts = true;
    this.showTemplates = false;
    if (this.tabControl) {
      this.tabControl.selectedIndex = 0;
    }
  }

  public isSinglePersonRequest(): boolean {
    return this.recipientsWrapper?.uids?.length === 1;
  }

  public requesterSelected(): boolean {
    return this.recipientsWrapper?.uids?.length > 0;
  }

  public onSelectionChanged(items: PortalShopServiceitems[]): void {
    this.selectedItems = items;
  }

  public onTemplateSelectionChanged(items: PortalItshopPatternRequestable[]): void {
    this.selectedTemplates = items;
  }

  public onRoleSelectionChanged(items: PortalItshopPeergroupMemberships[]): void {
    this.selectedRoles = items;
  }

  public async requestDetails(item: PortalShopServiceitems): Promise<void> {
    await this.sideSheetService
      .open(ProductDetailsSidesheetComponent, {
        title: await this.translate.get('#LDS#Heading View Product Details').toPromise(),
        padding: '0px',
        width: 'max(700px, 60%)',
        headerColour: 'iris-blue',
        bodyColour: 'asher-gray',
        testId: 'product-details-sidesheet',
        data: {
          item,
          projectConfig: this.projectConfig,
        },
      })
      .afterClosed()
      .toPromise();
  }

  public async requestTemplateDetails(items: PortalShopServiceitems[]): Promise<void> {
    await this.sideSheetService
      .open(PatternDetailsSidesheetComponent, {
        title: await this.translate.get('#LDS#Heading View Request Template Details').toPromise(),
        padding: '0px',
        width: 'max(700px, 60%)',
        headerColour: 'iris-blue',
        bodyColour: 'asher-gray',
        testId: 'template-details-sidesheet',
        data: {
          items,
          projectConfig: this.projectConfig,
        },
      })
      .afterClosed()
      .toPromise();
  }

  public async onAddItemsToCart(): Promise<void> {
    if (!this.selectedItems?.length && !this.selectedRoles?.length && !this.selectedTemplates.length) {
      this.dialogService.open(MessageDialogComponent, {
        data: {
          ShowOk: true,
          Title: await this.translate.get('#LDS#Heading Add to Cart').toPromise(),
          Message: await this.translate.get('#LDS#Please select at least one product you want to add to your shopping cart.').toPromise(),
        },
        panelClass: 'imx-messageDialog',
      });
      return;
    }

    await this.orderSelected(this.selectedItems, this.selectedTemplates, this.selectedRoles);
  }

  public async addItemToCart(serviceItem: PortalShopServiceitems): Promise<void> {
    this.orderSelected([serviceItem], undefined);
  }

  public async addTemplateToCart(patternRequestable: PortalItshopPatternRequestable): Promise<void> {
    this.orderSelected(undefined, [patternRequestable]);
  }

  public async addRoleToCart(role: PortalItshopPeergroupMemberships): Promise<void> {
    this.orderSelected(undefined, undefined, [role]);
  }

  public goToHistory(): void {
    this.router.navigate(['requesthistory']);
  }

  public async onIncludeChildCategories(include: boolean): Promise<void> {
    this.serviceitemListComponent.includeChildCategories = include;
    await this.serviceitemListComponent.getData();
  }

  public async selectedRecipientTypeChanged(arg: MatSelectChange): Promise<void> {
    if (arg.value === 'self') {
      await this.recipients.Column.PutValueStruct({
        DataValue: this.userUid,
        DisplayValue: await this.getPersonDisplay(this.userUid),
      });
    } else {
      await this.recipients.Column.PutValueStruct({
        DataValue: '',
        DisplayValue: '',
      });
    }
    this.onRecipientsChanged();
  }

  public async onRecipientsChanged(): Promise<void> {
    this.setPeerGroupPerson(undefined);

    if (this.serviceCategoryListComponent) {
      this.serviceitemListComponent.deselectAll();
      this.serviceitemListComponent.getData();
    }

    if (this.patternitemListComponent) {
      this.patternitemListComponent.deselectAll();
      this.patternitemListComponent.getData();
    }
  }

  public onSelectall(): void {
    if (this.showTemplates) {
      this.patternitemListComponent.selectAll();
    } else {
      this.serviceitemListComponent.selectAll();
    }
  }

  public selectAllRolesOnPage(): void {
    this.roles?.selectAllOnPage();
  }

  public onDeselectAll(): void {
    this.selectedItems = [];
    this.serviceitemListComponent?.deselectAll();
    this.selectedTemplates = [];
    this.patternitemListComponent?.deselectAll();
  }

  public deselectAllRoles(): void {
    this.roles?.deselectAll();
  }

  public onTabChange(event: MatTabChangeEvent): void {
    if (event.index === 0) {
      this.displayProducts = true;
    } else if (event.index === 1) {
      this.displayProducts = false;
    }
  }

  public onTableChange(event: MatTabChangeEvent): void {
    if (event.index === 0) {
      this.showTemplates = false;
    } else if (event.index === 1) {
      this.showTemplates = true;
    }
  }

  private async orderSelected(
    serviceItems: PortalShopServiceitems[],
    templateItems: PortalItshopPatternRequestable[],
    roles?: PortalItshopPeergroupMemberships[]
  ): Promise<void> {
    if (this.recipients) {
      const recipientsUids = MultiValue.FromString(this.recipients.value).GetValues();
      const recipientsDisplays = MultiValue.FromString(this.recipients.Column.GetDisplayValue()).GetValues();

      let savedItems = false;

      if (serviceItems && serviceItems.length > 0) {
        setTimeout(() => this.busyIndicator.show());
        let serviceItemsForPersons: RequestableProductForPerson[];
        try {
          serviceItemsForPersons = await this.serviceItemsProvider.getServiceItemsForPersons(
            serviceItems,
            recipientsUids.map((uid, index) => ({
              DataValue: uid,
              DisplayValue: recipientsDisplays[index],
            }))
          );
        } finally {
          setTimeout(() => this.busyIndicator.hide());
        }
        if (serviceItemsForPersons && serviceItemsForPersons.length > 0) {
          const hasItems = await this.shelfService.setShops(serviceItemsForPersons);
          if (hasItems) {
            setTimeout(() => this.busyIndicator.show());
            try {
              savedItems = await this.cartItemsProvider.addItems(serviceItemsForPersons.filter((item) => item.UidITShopOrg?.length > 0));
            } finally {
              setTimeout(() => this.busyIndicator.hide());
            }
          }
        }
      }

      if (templateItems && templateItems.length > 0) {
        let templateItemsForPersons: RequestableProductForPerson[];
        try {
          templateItemsForPersons = await this.patternItemsService.getPatternItemsForPersons(
            templateItems,
            recipientsUids.map((uid, index) => ({
              DataValue: uid,
              DisplayValue: recipientsDisplays[index],
            }))
          );
        } finally {
          setTimeout(() => this.busyIndicator.hide());
        }
        if (templateItemsForPersons && templateItemsForPersons.length > 0) {
          const hasItems = await this.shelfService.setShops(templateItemsForPersons);
          if (hasItems) {
            setTimeout(() => this.busyIndicator.show());
            try {
              savedItems = await this.cartItemsProvider.addItems(templateItemsForPersons.filter((item) => item.UidITShopOrg?.length > 0));
            } finally {
              setTimeout(() => this.busyIndicator.hide());
            }
          }
        }
      }

      if (roles && roles.length > 0) {
        setTimeout(() => this.busyIndicator.show());
        try {
          await this.cartItemsProvider.addItemsFromRoles(
            roles.map((item) => item.XObjectKey.value),
            this.recipientsWrapper?.uids
          );
          savedItems = true;
        } finally {
          setTimeout(() => this.busyIndicator.hide());
        }
      }

      if (savedItems) {
        this.router.navigate(['shoppingcart']);
      }
    }
  }

  private async getPersonDisplay(uid: string): Promise<string> {
    const person = await this.personProvider.get(uid);
    if (person && person.Data.length) {
      return person.Data[0].GetEntity().GetDisplay();
    }

    return uid;
  }
}
