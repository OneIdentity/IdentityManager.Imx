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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';

import { EuiLoadingService } from '@elemental-ui/core';
import { PortalApplication } from 'imx-api-aob';
import { ClassloggerService, SnackBarService } from 'qbm';
import { TypedEntityCollectionData } from 'imx-qbm-dbts';

import { ApplicationsService } from './applications.service';
import { ApplicationNavigationComponent } from './application-navigation/application-navigation.component';
import { ApplicationDetailComponent } from './application-detail.component';
import { ApplicationContent } from './application-content.interface';

@Component({
  selector: 'imx-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss'],
})
export class ApplicationsComponent implements OnDestroy, OnInit {
  private selectedApplication: PortalApplication;
  private dataSource: TypedEntityCollectionData<PortalApplication>;
  private applicationNavigation: ApplicationNavigationComponent;
  private applicationContent: ApplicationContent;
  private subscriptions: Subscription[] = [];
  private loadingSubject = new Subject<boolean>();

  constructor(
    private readonly logger: ClassloggerService,
    private readonly applicationsProvider: ApplicationsService,
    private readonly busyService: EuiLoadingService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly snackbar: SnackBarService
  ) {
    this.subscriptions.push(
      this.applicationsProvider.onApplicationCreated.subscribe(async (uidApplication: string) => {
        this.selectedApplication = await this.applicationsProvider.reload(uidApplication);

        if (this.selectedApplication == null) {
          return;
        }

        if (this.dataSource?.Data) {
          this.dataSource.Data.shift();
          this.dataSource.Data.unshift(this.selectedApplication);
        }

        this.applicationContent.application = this.selectedApplication;

        return this.redirectToAppDetails(this.selectedApplication.UID_AOBApplication.value);
      })
    );
    this.subscriptions.push(
      this.applicationsProvider.onApplicationDeleted.subscribe(async (uidApplication: string) => {
        const index = this.dataSource.Data.findIndex(elem => elem.UID_AOBApplication.value === uidApplication);
        if (index < 0) {
          return this.redirectToAppDetails(null);
        }
        const removed = this.dataSource.Data.splice(index, 1);
        this.applicationContent.application = null;
        this.snackbar.open({ key: '#LDS#The application "{0}" has been successfully deleted.', parameters: [removed[0].GetEntity().GetDisplay()] });
        return this.redirectToAppDetails(null);
      }));
  }

  public ngOnInit(): void {
    this.route.queryParams.subscribe(async (params) => {
      this.logger.trace(this, 'Routing parameters', params);
      this.selectedApplication = undefined;

      if (params?.id == null) {
        return;
      }

      if (params.id) {
        this.selectedApplication = await this.applicationsProvider.reload(params.id);
      }

      this.applicationContent.application = this.selectedApplication;

      if (!this.selectedApplication) {
        this.applicationNavigation.clearSelection();
      }

      if (this.selectedApplication && this.isEditRoute(this.route)) {
        await this.redirectToAppDetails(this.selectedApplication.UID_AOBApplication.value);
      }
    });
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public onActivateNavigationOutlet(componentRef: ApplicationNavigationComponent): void {
    this.logger.trace(this, 'Initializing Application Navigation View', componentRef);

    this.applicationNavigation = componentRef;
    this.applicationNavigation.loadingSubject = this.loadingSubject;

    this.subscriptions.push(
      this.applicationNavigation.applicationSelected.subscribe((uidApplication: string) =>
        this.redirectToAppDetails(uidApplication)
      )
    );

    this.subscriptions.push(
      this.applicationNavigation.dataSourceChanged.subscribe((changeSet:
        { keywords: string; dataSource: TypedEntityCollectionData<PortalApplication> }) => {
        this.dataSource = changeSet?.dataSource;
        this.applicationContent.totalCount = this.dataSource?.totalCount ?? 0;
        this.applicationContent.keywords = changeSet?.keywords;
      })
    );
  }

  public async onActivateContentOutlet(applicationContent: any): Promise<void> {
    this.applicationContent = applicationContent;
    this.applicationContent.loadingSubject = this.loadingSubject;
    this.logger.trace(this, 'Initializing Application Content View', this.applicationContent);

    if (this.selectedApplication == null) {
      return;
    }

    // reload app:
    this.selectedApplication = await this.applicationsProvider.reload(this.selectedApplication.UID_AOBApplication.value)

    if (applicationContent instanceof ApplicationDetailComponent) {
      this.applicationContent.application = this.selectedApplication;
    }
  }

  private isEditRoute(route: ActivatedRoute): boolean {
    return (
      route.children &&
      route.children.length > 1 &&
      route.children[1].routeConfig.outlet.toLowerCase() === 'content' &&
      route.children[1].routeConfig.path.toLowerCase() === 'edit'
    );
  }

  private async redirectToAppDetails(uidApplication: string): Promise<boolean> {
    this.logger.trace(this, 'Redirecting to details view.');

     return this.router.navigate(
        ['applications', { outlets: { content: ['detail'] } }],
        uidApplication ? { queryParams: { id: uidApplication } } : undefined)
  }
}
