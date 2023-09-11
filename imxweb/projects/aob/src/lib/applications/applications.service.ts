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

import { OverlayRef } from '@angular/cdk/overlay';
import { Injectable, ErrorHandler } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService, EuiTheme } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { PortalApplication, PortalApplicationInteractive, PortalApplicationNew } from 'imx-api-aob';
import { TypedEntityCollectionData, CollectionLoadParameters, EntitySchema } from 'imx-qbm-dbts';
import { ApiClientService, ClassloggerService, DataTileBadge, SnackBarService } from 'qbm';
import { AobApiService } from '../aob-api-client.service';
import { ApplicationCreateComponent } from './application-create/application-create.component';

/**
 * This service provides methods for handling with {@link PortalApplication[]|applications}.
 * {@link ApplicationCardComponent|ApplicationCardComponent}.
 */
@Injectable({
  providedIn: 'root',
})
export class ApplicationsService {
  public readonly onApplicationCreated = new Subject<string>();
  public readonly onApplicationDeleted = new Subject<string>();
  public applicationRefresh: BehaviorSubject<Boolean> = new BehaviorSubject<Boolean>(false);

  private badgePublished: DataTileBadge;
  private badgeKpiErrors: DataTileBadge;
  private badgeNew: DataTileBadge;

  private publishedText: string;
  private kpiErrorsText: string;
  private newBadgeText: string;

  public get applicationSchema(): EntitySchema {
    return this.aobClient.typedClient.PortalApplication.GetSchema();
  }

  private get theme(): string {
    const bodyClasses = document.body.classList;
    return bodyClasses.contains(EuiTheme.LIGHT)
      ? EuiTheme.LIGHT
      : bodyClasses.contains(EuiTheme.DARK)
      ? EuiTheme.DARK
      : bodyClasses.contains(EuiTheme.CONTRAST)
      ? EuiTheme.CONTRAST
      : '';
  }

  constructor(
    private readonly aobClient: AobApiService,
    private readonly logger: ClassloggerService,
    private readonly errorHandler: ErrorHandler,
    private readonly apiProvider: ApiClientService,
    private readonly translateService: TranslateService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly snackbar: SnackBarService,
    private readonly busyService: EuiLoadingService
  ) {
    this.translateService.get('#LDS#Published').subscribe((trans: string) => (this.publishedText = trans));
    this.translateService.get('#LDS#KPI issues').subscribe((trans: string) => (this.kpiErrorsText = trans));
    this.translateService.get('#LDS#New').subscribe((trans: string) => (this.newBadgeText = trans));
  }

  /**
   * Encapsules the aob/applications GET endpoint and delivers a list of {@link PortalApplication[]|applications}.
   */
  public async get(parameters: CollectionLoadParameters = {}): Promise<TypedEntityCollectionData<PortalApplication>> {
    if (this.aobClient.typedClient == null) {
      return new Promise<TypedEntityCollectionData<PortalApplication>>((resolve) => resolve(null));
    }
    return this.apiProvider.request(() => this.aobClient.typedClient.PortalApplication.Get(parameters));
  }

  public async reload(uidApplication: string): Promise<PortalApplicationInteractive> {
    return await this.apiProvider.request(
      async () => (await this.aobClient.typedClient.PortalApplicationInteractive.Get_byid(uidApplication)).Data[0]
    );
  }

  public createNew(): PortalApplicationNew {
    return this.aobClient.typedClient.PortalApplicationNew.createEntity();
  }

  public async tryCommit(application: PortalApplication | PortalApplicationNew, reload?: boolean): Promise<boolean> {
    try {
      await application.GetEntity().Commit(reload);
      if (application.AuthenticationRoot.value) {
        application.AuthenticationRootHelper.value = application.AuthenticationRoot.value;
      }
      this.logger.debug(this, 'storedapp:', application);
      return true;
    } catch (error) {
      this.errorHandler.handleError(error);
    }

    return false;
  }

  /**
   * Publishs the given {@link PortalApplication[]|applications} by setting IsInactive to false or an ActivationDate to the given date.
   */
  public async publish(application: PortalApplication, publishData: { publishFuture: boolean; date: Date }): Promise<boolean> {
    if (!publishData.publishFuture) {
      await application.IsInActive.Column.PutValue(publishData.publishFuture);
    } else {
      await application.ActivationDate.Column.PutValue(publishData.date);
    }
    this.logger.debug(this, 'Commit change: publish application...', application.ActivationDate.value);

    return this.tryCommit(application, true);
  }

  /**
   * Unpublishs the given {@link PortalApplication[]|applications} by setting IsInactive to true and ActivationDate to the default.
   */
  public async unpublish(application: PortalApplication): Promise<boolean> {
    await application.IsInActive.Column.PutValue(true);
    await application.ActivationDate.Column.PutValue(null);

    this.logger.debug(this, 'Commit change: unpublish application...');
    return this.tryCommit(application, true);
  }

  /**
   * Shows a badge on the given {@link PortalApplication[]|applications},
   * if the application is published or has kpi issues.
   */
  public getApplicationBadges(application: PortalApplication | PortalApplicationNew): DataTileBadge[] {
    this.updateBadges(this.theme);

    if (application instanceof PortalApplicationNew) {
      this.logger.trace(this, 'Add a new badge to the badgelist.');
      return [this.badgeNew];
    }

    const badges: DataTileBadge[] = [];
    if (this.hasKpiIssues(application as PortalApplication)) {
      this.logger.trace(this, 'Add a kpi error badge to the badgelist.');
      badges.push(this.badgeKpiErrors);
    }

    if (this.isPublished(application as PortalApplication)) {
      this.logger.trace(this, 'Add a published badge to the badgelist.');
      badges.push(this.badgePublished);
    }

    if (this.createdToday(application)) {
      this.logger.trace(this, 'Add a new badge to the badgelist.');
      badges.push(this.badgeNew);
    }

    if (badges.length === 0) {
      this.logger.trace(this, 'Add no badge.');
    }
    return badges;
  }

  public async createApplication(): Promise<void> {
    const application = this.createNew();

    const result = await this.sidesheet
      .open(ApplicationCreateComponent, {
        title: await this.translateService.get('#LDS#Heading Create Application').toPromise(),
        padding: '0px',
        width: 'max(600px, 60%)',
        disableClose: true,
        testId: 'create-aob-application',
        data: {
          application,
        },
      })
      .afterClosed()
      .toPromise();

    if (result) {
      let overlayRef: OverlayRef;
      setTimeout(() => (overlayRef = this.busyService.show()));

      try {
        await application.GetEntity().Commit(true);
        this.onApplicationCreated.next(application.UID_AOBApplication.value);
        this.snackbar.open({ key: '#LDS#The application has been successfully created.' });
      } catch (error) {
        this.errorHandler.handleError(error);
      } finally {
        setTimeout(() => this.busyService.hide(overlayRef));
      }
    } else {
      this.snackbar.open({ key: '#LDS#The creation of the application has been canceled.' });
    }
  }

  public async deleteApplication(uid: string): Promise<void> {
    await this.aobClient.client.portal_application_delete(uid);

    this.onApplicationDeleted.next(uid);
  }

  private isPublished(application: PortalApplication): boolean {
    if (application.IsInActive == null) {
      return false;
    }

    return !application.IsInActive.value;
  }

  private hasKpiIssues(application: PortalApplication): boolean {
    if (application.HasKpiIssues == null) {
      return false;
    }

    return application.HasKpiIssues.value;
  }

  private createdToday(app: PortalApplication): boolean {
    return (
      app != null && app.XDateInserted != null && new Date(app.XDateInserted.value).toLocaleDateString() === new Date().toLocaleDateString()
    );
  }

  /**
   * Updates the badges, that are used on the application tiles, according to the used theme
   * 
   * @param theme Currently used EuiTheme
   */
  private updateBadges(theme: string): void {
    //ToDo Bug422573 find a better solution for theming

    const published = {};
    published[EuiTheme.LIGHT] = '#0a96d1';
    published[EuiTheme.DARK] = '#016b91';
    published[EuiTheme.CONTRAST] = '#016b91';

    const newb = {};
    newb[EuiTheme.LIGHT] = '#4ba803';
    newb[EuiTheme.DARK] = '#327301';
    newb[EuiTheme.CONTRAST] = '#327301';

    const kpi = {};
    kpi[EuiTheme.LIGHT] = '#e36a00';
    kpi[EuiTheme.DARK] = '#900';
    kpi[EuiTheme.CONTRAST] = '#900';

    this.badgePublished = {
      content: this.publishedText,
      color: published[theme] ?? '#618f3e',
      textColor: '#ffffff',
    };

    this.badgeKpiErrors = {
      content: this.kpiErrorsText,
      color: kpi[theme] ?? '#f4770b',
      textColor: '#ffffff',
    };

    this.badgeNew = {
      content: this.newBadgeText,
      color: newb[theme] ?? '#02556d',
      textColor: theme === EuiTheme.LIGHT ? '#ffffff' : '#000000',
    };
  }
}
