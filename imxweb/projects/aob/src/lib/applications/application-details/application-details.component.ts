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

import { Platform } from '@angular/cdk/platform';
import { Component, Input, OnChanges, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalApplication } from '@imx-modules/imx-api-aob';
import { TypedEntity } from '@imx-modules/imx-qbm-dbts';
import { BusyService, calculateSidesheetWidth, ClassloggerService, ConfirmationService, SnackBarService, TextContainer } from 'qbm';
import { AccountsService } from '../../accounts/accounts.service';
import { AobApiService } from '../../aob-api-client.service';
import { EntitlementFilter } from '../../entitlements/entitlement-filter';
import { EntitlementsService } from '../../entitlements/entitlements.service';
import { LifecycleActionComponent } from '../../lifecycle-actions/lifecycle-action.component';
import { LifecycleAction } from '../../lifecycle-actions/lifecycle-action.enum';
import { AobPermissionsService } from '../../permissions/aob-permissions.service';
import { ShopsService } from '../../shops/shops.service';
import { ApplicationsService } from '../applications.service';
import { EditApplicationComponent } from '../edit-application/edit-application.component';
import { ServiceCategoryComponent } from '../edit-application/service-category/service-category.component';
import { AccountDetails } from './account-details.interface';

@Component({
  selector: 'imx-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.scss'],
})
export class ApplicationDetailsComponent implements OnChanges, OnInit {
  /**
   * The {@link PortalApplication | AobApplication}
   */
  @Input() public application: PortalApplication | undefined;

  @ViewChild('multiValueControl', { static: true }) public chartDialog: TemplateRef<any>;

  @ViewChild(MatMenuTrigger) public menuTrigger: MatMenuTrigger;

  public hasAssignedEntitlements: boolean;
  public hasPublishedEntitlements = false;
  public canBeDeleted = false;
  public hasOwner: boolean;
  public accountsInformation: AccountDetails;

  public assignedShops: TypedEntity[] = [];

  public readonly shopsDisplay: string;
  public readonly accountsDisplay: string;

  public busyService = new BusyService();
  public isLoading;

  constructor(
    private entitlementsProvider: EntitlementsService,
    public readonly shopsProvider: ShopsService,
    private readonly euiBusyService: EuiLoadingService,
    private readonly logger: ClassloggerService,
    public readonly accountsProvider: AccountsService,
    private readonly dialog: MatDialog,
    private readonly applicationprovider: ApplicationsService,
    private readonly snackbar: SnackBarService,
    private readonly platform: Platform,
    private readonly aobApiService: AobApiService,
    private readonly translateService: TranslateService,
    private readonly confirmation: ConfirmationService,
    private readonly sidesheetService: EuiSidesheetService,
    private readonly permissions: AobPermissionsService,
  ) {
    this.shopsDisplay = this.aobApiService.typedClient.PortalShops.GetSchema().Display || '';
    this.accountsDisplay = this.aobApiService.typedClient.PortalApplicationusesaccount.GetSchema().Display || '';
    this.busyService.busyStateChanged.subscribe((elem) => (this.isLoading = elem));
  }

  public ngOnInit(): void {
    this.accountsInformation = {
      count: 0,
      first: undefined,
      uidApplication: this.application?.UID_AOBApplication.value || '',
    };
  }

  public async ngOnChanges(): Promise<void> {
    return this.reloadData();
  }

  /**
   * Deletes the displayed application, after confirming the process by the user
   */
  public async deleteApplication(): Promise<void> {
    if (
      await this.confirmation.confirm({
        Title: '#LDS#Heading Delete Application',
        Message: '#LDS#Are you sure you want to delete the application?',
      })
    ) {
      if (this.euiBusyService.overlayRefs.length === 0) {
        this.euiBusyService.show();
      }
      try {
        if (!!this.application) {
          await this.applicationprovider.deleteApplication(this.application.UID_AOBApplication.value);
        }
      } finally {
        this.euiBusyService.hide();
      }
    }
  }

  /**
   * Edits the information of the associated application
   */
  public async editApplication(): Promise<void> {
    await this.sidesheetService
      .open(EditApplicationComponent, {
        title: await this.translateService.get('#LDS#Heading Edit Application').toPromise(),
        subTitle: this.application?.GetEntity().GetDisplay(),
        width: calculateSidesheetWidth(800),
        padding: '0',
        data: this.application,
        testId: 'edit-application',
        disableClose: true,
      })
      .afterClosed()
      .toPromise();
    this.applicationprovider.applicationRefresh.next(true);
    if (this.application) {
      this.application = await this.applicationprovider.reload(this.application?.UID_AOBApplication.value);
    }
    this.reloadData();
  }

  /**
   * Opens a dialog for publishing the application
   * @ignore @param _ unused mouse event
   */
  public async publishApplication(_: MouseEvent): Promise<void> {
    if (await this.updateShops()) {
      const dialogConfig = {
        data: {
          action: LifecycleAction.Publish,
          elements: [this.application],
          shops: this.assignedShops,
          type: 'AobApplication',
        },
        height: this.platform.TRIDENT ? '550px' : 'auto',
      };
      const dialogRef = this.dialog.open(LifecycleActionComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(async (publishData) => {
        if (publishData) {
          this.logger.debug(
            this,
            `Publishing application) ${publishData.date && publishData.publishFuture ? `on ${publishData.date}` : 'now'}`,
          );

          if (!!this.application && (await this.applicationprovider.publish(this.application, publishData))) {
            let publishMessage: TextContainer = {
              key: '#LDS#The application was successfully published. It takes a moment for the changes to take effect.',
            };
            if (publishData.publishFuture && publishData.date) {
              const browserCulture = this.translateService.currentLang;
              publishMessage = {
                key: '#LDS#The application will be published on {0} at {1} (your local time).',
                parameters: [publishData.date.toLocaleDateString(browserCulture), publishData.date.toLocaleTimeString(browserCulture)],
              };
            }
            this.snackbar.open(publishMessage, '#LDS#Close');
          } else {
            this.logger.error(this, 'Attempt to publish the application failed');
          }
        } else {
          this.logger.debug(this, 'dialog Cancel');
        }
      });
    }
  }

  /**
   * Opens a dialog for unpublishing the application
   * @ignore @param _ unused mouse event
   */
  public unpublishApplication(_: MouseEvent): void {
    const dialogConfig = {
      data: { action: LifecycleAction.Unpublish, elements: [this.application], type: 'AobApplication' },
      width: '800px',
      height: '500px',
    };
    const dialogRef = this.dialog.open(LifecycleActionComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.logger.debug(this, 'Unpublish application...');

        if (this.application && (await this.applicationprovider.unpublish(this.application))) {
          this.snackbar.open(
            { key: '#LDS#The application was successfully unpublished. It takes a moment for the changes to take effect.' },
            '#LDS#Close',
          );
        } else {
          this.logger.error(this, 'Attempt to unpublish the  application failed');
        }
      } else {
        this.logger.debug(this, 'dialog Cancel');
      }
    });
  }

  /**
   * Checks if the specified  {@link PortalApplication|application} can be publish.
   */
  public get isPublishable(): boolean {
    return this.application != null && this.application?.ActivationDate.GetMetadata().CanEdit() && !this.published();
  }

  /**
   * Checks if the specified  {@link PortalApplication|application} can be unnpublish.
   */
  public get isUnpublishable(): boolean {
    return this.application != null && this.application?.IsInActive.GetMetadata().CanEdit() && !this.notPublished();
  }

  // TODO 222863: Use the same filter as for entitlements:

  public notPublished(): boolean {
    return !!this.application?.IsInActive && !!this.application?.IsInActive.value && !this.application?.ActivationDate.value;
  }

  public willPublish(): boolean {
    return !!this.application?.IsInActive && !!this.application?.IsInActive.value && this.application?.ActivationDate.value != null;
  }

  public published(): boolean {
    return !this.application?.IsInActive.value;
  }

  /**
   * Opens/Closes the menu programmatically and stopps propagation of the event.
   * Otherwise the tile would be selected/deselcted as a sideeffect.
   * @ignore Used internally in components template.
   */
  public menuClicked(event: MouseEvent): void {
    this.menuTrigger.toggleMenu();
    event.stopImmediatePropagation();
  }

  /**
   *
   * @param elements Opens a dialog, that shows additional elements (because in the beginning there are only 3 elements displayed)
   * @param title A title for the dialog
   * @param iconText name of a cadence icon, that should be used
   */
  public showMore(elements: TypedEntity[], title: string, iconText?: string): void {
    const content = { parts: elements.map((part) => part.GetEntity().GetDisplay()), caption: title, icon: iconText };

    this.dialog.open(this.chartDialog, { data: content, width: '600px' });
  }

  /**
   * Shows a dialog, that displays additionals accounts (because in the beginning there are only 3 elements displayed)
   */
  public async showMoreAccounts(): Promise<void> {
    if (this.euiBusyService.overlayRefs.length === 0) {
      this.euiBusyService.show();
    }
    try {
      if (!!this.application) {
        const elements = await this.accountsProvider.getAssigned(this.application.UID_AOBApplication.value, {
          PageSize: this.accountsInformation.count,
        });
        this.showMore(elements, this.accountsDisplay);
      }
    } finally {
      this.euiBusyService.hide();
    }
  }

  public async editServiceCategories(): Promise<void> {
    await this.sidesheetService
      .open(ServiceCategoryComponent, {
        title: await this.translateService.get('#LDS#Heading Manage Service Categories').toPromise(),
        subTitle: this.application?.GetEntity().GetDisplay(),
        width: calculateSidesheetWidth(),
        padding: '0',
        data: this.application,
        testId: 'edit-application-servicecategory',
      })
      .afterClosed()
      .toPromise();
  }

  private async reloadData(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      if (this.application?.AuthenticationRoot.value) {
        this.application.AuthenticationRootHelper.value = this.application?.AuthenticationRoot.value;
      }

      this.hasOwner = this.application?.UID_PersonHead.value != null && this.application?.UID_PersonHead.value !== '';
      await this.updateShops();

      const accountInfo = !!this.application
        ? await this.accountsProvider.getFirstAndCount(this.application.UID_AOBApplication.value)
        : { count: 0, first: undefined };

      this.accountsInformation = {
        ...this.accountsInformation,
        ...{ count: accountInfo.count, first: accountInfo.first },
        ...{ count: accountInfo.count, first: accountInfo.first },
      };

      const applicationEntitlements = !!this.application
        ? await this.entitlementsProvider.getEntitlementsForApplication(this.application)
        : undefined;
      if (!!applicationEntitlements) {
        const entitlementFilter = new EntitlementFilter();
        this.hasPublishedEntitlements = applicationEntitlements.Data.filter(entitlementFilter.published).length > 0;
        this.hasAssignedEntitlements = applicationEntitlements.Data.length > 0;
        const publishedAndWillBePublished = applicationEntitlements.Data.filter(
          (elem) => entitlementFilter.published(elem) || entitlementFilter.willPublish(elem),
        );
        this.canBeDeleted = (await this.permissions.isAobApplicationAdmin()) && publishedAndWillBePublished.length === 0;
      } else {
        this.logger.error(this, 'TypedEntityCollectionData<PortalEntitlement> is undefined');
      }
    } finally {
      isBusy.endBusy();
    }
  }

  private async updateShops(): Promise<boolean> {
    const appInShop = !!this.application
      ? await this.shopsProvider.getApplicationInShop(this.application.UID_AOBApplication.value)
      : undefined;
    if (!!appInShop) {
      this.assignedShops = appInShop.Data;
      return true;
    }
    this.logger.error(this, 'TypedEntityCollectionData<AobApplicationinshop> is undefined');
    this.assignedShops = [];
    return false;
  }
}
