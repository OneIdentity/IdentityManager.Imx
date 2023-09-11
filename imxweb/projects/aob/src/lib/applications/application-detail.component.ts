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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';

import { Base64ImageService, ClassloggerService } from 'qbm';
import { UserModelService } from 'qer';
import { PortalApplication } from 'imx-api-aob';
import { ApplicationsService } from './applications.service';
import { ApplicationContent } from './application-content.interface';
import { AobPermissionsService } from '../permissions/aob-permissions.service';

@Component({
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss'],
})
export class ApplicationDetailComponent implements ApplicationContent, OnInit, OnDestroy {
  @Input() public application: PortalApplication;
   
  @Input() public  loadingSubject: Subject<boolean>;

  public totalCount: number;
  public keywords: string;
  public isAdmin: boolean;
  public selectedTabIndex = 0;
  public showHelper = true;
  public isLoading = false;

  private subscription: Subscription;

  constructor(
    private base64ImageService: Base64ImageService,
    private readonly logger: ClassloggerService,
    private readonly applicationsProvider: ApplicationsService,
    public readonly userService: UserModelService,
    public route:ActivatedRoute,
    private readonly aobPermissionsService: AobPermissionsService
  ) {
    this.route.queryParams.subscribe(async (params) => {
      if (Object.keys(params).length === 0) this.application = null;
    });
  }
  
  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  public async ngOnInit(): Promise<void> {

    this.subscription = this.loadingSubject.subscribe(elem=> this.isLoading = elem);
    this.isAdmin = await this.aobPermissionsService.isAobApplicationAdmin();
  }

  public getImageUrl(app: PortalApplication): SafeUrl {
    return this.base64ImageService.getImageUrl(app.JPegPhoto);
  }

  public async onSelectedTabChanged(event: MatTabChangeEvent): Promise<void> {
    await this.reloadApplication();
    this.selectedTabIndex = event.index;
    this.logger.debug(this, 'tab selected', event.tab.textLabel);
  }

  public async reloadApplication(): Promise<void> {
    this.application = await this.applicationsProvider.reload(this.application.UID_AOBApplication.value);
  }

  public createApplication(): void {
    this.applicationsProvider.createApplication();
  }

  public onHelperDismissed(): void {
    this.showHelper = false;
  }
}
