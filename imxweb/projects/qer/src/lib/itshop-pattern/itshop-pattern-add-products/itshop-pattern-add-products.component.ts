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
 * Copyright 2022 One Identity LLC.
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

import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { EuiLoadingService, EuiSidesheetRef, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { PortalShopCategories, PortalShopServiceitems, QerProjectConfig, RequestableProductForPerson } from 'imx-api-qer';
import { EntityValue, IWriteValue, LocalProperty, MultiValue } from 'imx-qbm-dbts';

import { AuthenticationService, BaseCdr, ColumnDependentReference, DataTileMenuItem, EntityService } from 'qbm';

import { ShelfService } from '../../itshop/shelf.service';
import { PersonService } from '../../person/person.service';
import { ProductDetailsSidesheetComponent } from '../../product-selection/product-details-sidesheet/product-details-sidesheet.component';
import { CategoryTreeComponent } from '../../product-selection/servicecategory-list/category-tree.component';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { QerApiService } from '../../qer-api-client.service';
import { ServiceItemsService } from '../../service-items/service-items.service';
import { ServiceitemListComponent } from '../../service-items/serviceitem-list/serviceitem-list.component';
import { UserModelService } from '../../user/user-model.service';
import { ItshopPatternCreateService } from '../itshop-pattern-create-sidesheet/itshop-pattern-create.service';

/**
 * Component that shows the service catalog with service items, which the user can added to the itshop pattern.
 */
@Component({
  selector: 'imx-itshop-pattern-add-products',
  templateUrl: './itshop-pattern-add-products.component.html',
  styleUrls: ['./itshop-pattern-add-products.component.scss']
})
export class ItshopPatternAddProductsComponent implements OnInit, OnDestroy {

  @ViewChild(ServiceitemListComponent) public serviceitemListComponent: ServiceitemListComponent;

  public readonly dataSourceView = { selected: 'cardlist' };
  public recipients: IWriteValue<string>;
  public selectedItems: PortalShopServiceitems[] = [];
  public selectedCategory: PortalShopCategories;
  public cartItemRecipients: ColumnDependentReference;
  public canRequestForSomebodyElse: boolean;
  public recipientType: 'self' | 'others' = 'self';

  public description = '#LDS#To add products to this request template, select products that are available to you. You can also select another identity to view products available to that identity.';

  public serviceItemActions: DataTileMenuItem[] = [
    {
      name: 'details',
      description: '#LDS#Details'
    },
    {
      name: 'addToTemplate',
      description: '#LDS#Add'
    }
  ];

  private projectConfig: QerProjectConfig;
  private authSubscription: Subscription;
  private userUid: string;

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: {
      shoppingCartPatternUid: string
    },
    private readonly busyIndicator: EuiLoadingService,
    private readonly entityService: EntityService,
    private readonly patternCreateService: ItshopPatternCreateService,
    private readonly personProvider: PersonService,
    private readonly projectConfigService: ProjectConfigurationService,
    private readonly qerClient: QerApiService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly sideSheetRef: EuiSidesheetRef,
    private readonly shelfService: ShelfService,
    private readonly serviceItemsProvider: ServiceItemsService,
    private readonly translate: TranslateService,
    private readonly userModelService: UserModelService,
    authentication: AuthenticationService
  ) {
    this.authSubscription = authentication.onSessionResponse.subscribe(elem => {
      this.userUid = elem.UserUid;
    });

  }

  public async ngOnInit(): Promise<void> {
    this.projectConfig = await this.projectConfigService.getConfig();
    this.setupRecipient();
  }

  public ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  public onSelectionChanged(items: PortalShopServiceitems[]): void {
    this.selectedItems = items;
  }

  public async handlePatternItemAction(action: { name: string, item: PortalShopServiceitems }): Promise<void> {
    if (action.name === 'addToTemplate') {
      this.addTemplateItem([action.item]);
    }
    if (action.name === 'details') {
      this.requestDetails(action.item);
    }
  }

  public async requestDetails(item: PortalShopServiceitems): Promise<void> {
    await this.sidesheet.open(ProductDetailsSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading View Product Details').toPromise(),
      padding: '0px',
      width: 'max(700px, 60%)',
      headerColour: 'iris-blue',
      bodyColour: 'asher-gray',
      testId: 'product-details-sidesheet',
      data: {
        item,
        projectConfig: this.projectConfig
      }
    }).afterClosed().toPromise();
  }

  public async addTemplateItem(serviceItems: PortalShopServiceitems[]): Promise<void> {
    if (this.recipients) {
      const recipientsUids = MultiValue.FromString(this.recipients.value).GetValues();
      const recipientsDisplays = MultiValue.FromString(this.recipients.Column.GetDisplayValue()).GetValues();

      if (serviceItems && serviceItems.length > 0) {
        setTimeout(() => this.busyIndicator.show());
        let serviceItemsForPersons: RequestableProductForPerson[];
        try {
          serviceItemsForPersons = await this.serviceItemsProvider.getServiceItemsForPersons(
            serviceItems,
            recipientsUids.map((uid, index) => ({
              DataValue: uid,
              DisplayValue: recipientsDisplays[index]
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
              const cartItemUids = serviceItemsForPersons.map(item => item.UidAccProduct);
              const assignedPatterns = await this.patternCreateService.assignItemsToPattern(
                cartItemUids, serviceItemsForPersons, this.data.shoppingCartPatternUid);
              if (assignedPatterns > 0) {
                this.sideSheetRef.close(assignedPatterns);
              }
            } finally {
              setTimeout(() => this.busyIndicator.hide());
            }
          }
        }
      }
    }
  }

  public openCategoryTree(): void {
    const sidesheetRef = this.sidesheet.open(CategoryTreeComponent, {
      title: this.qerClient.typedClient.PortalShopCategories.GetSchema().DisplaySingular,
      width: '600px',
      headerColour: 'iris-blue',
      testId: 'categorytree-sidesheet',
      data: {
        selectedServiceCategory: this.selectedCategory,
        recipients: this.recipients,
        showImage: false
      }
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
  }

  public async selectedRecipientTypeChanged(arg: MatSelectChange): Promise<void> {
    if (arg.value === 'self') {
      await this.recipients.Column.PutValueStruct({
        DataValue: this.userUid,
        DisplayValue: await this.getPersonDisplay(this.userUid)
      });
    } else {
      await this.recipients.Column.PutValueStruct({
        DataValue: '',
        DisplayValue: ''
      });
    }
    this.onRecipientsChanged();
  }

  public async onRecipientsChanged(recipient?: string): Promise<void> {

    if (this.serviceitemListComponent) {
      this.serviceitemListComponent.deselectAll();
      this.serviceitemListComponent.getData();
    }
  }
  private async setupRecipient(): Promise<void> {
    this.canRequestForSomebodyElse = (await this.userModelService.getUserConfig()).CanRequestForSomebodyElse;

    const recipientsProperty = new LocalProperty();
    recipientsProperty.IsMultiValued = false;
    recipientsProperty.ColumnName = 'UID_PersonOrdered';
    recipientsProperty.MinLen = 1;
    recipientsProperty.FkRelation = this.qerClient.typedClient.PortalCartitem.GetSchema().Columns.UID_PersonOrdered.FkRelation;

    const dummyCartItemEntity = this.qerClient.typedClient.PortalCartitem.createEntity().GetEntity();
    const fkProviderItems = this.qerClient.client.getFkProviderItems('portal/cartitem').map(item => ({
      ...item,
      load: (_, parameters = {}) => item.load(dummyCartItemEntity, parameters),
      getDataModel: async (entity) =>
        item.getDataModel(entity),
      getFilterTree: async (entity, parentKey) => item.getFilterTree(entity, parentKey)
    }));

    const column = this.entityService.createLocalEntityColumn(
      recipientsProperty,
      fkProviderItems,
      { Value: this.userUid }
    );
    this.recipients = new EntityValue(column);

    // preset recipient to the current user
    await this.recipients.Column.PutValueStruct({
      DataValue: this.userUid,
      DisplayValue: await this.getPersonDisplay(this.userUid)
    });


    this.cartItemRecipients = new BaseCdr(
      this.recipients.Column,
      '#LDS#Identity'
    );

  }

  private async getPersonDisplay(uid: string): Promise<string> {
    const person = await this.personProvider.get(uid);
    if (person && person.Data.length) {
      return person.Data[0].GetEntity().GetDisplay();
    }
    return uid;
  }

}
