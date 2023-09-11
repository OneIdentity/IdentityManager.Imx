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

import { Component, OnInit } from '@angular/core';
import { ProjectConfig } from 'imx-api-qer';
import { SnackBarService } from 'qbm';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
@Component({
  templateUrl: './notification-tile.component.html',
  selector: 'imx-notification-tile',
  styleUrls: ['./notification-tile.component.scss']
})
export class NotificationTileComponent implements OnInit {

  public projectConfig: ProjectConfig;
  public showAskForNotifications: boolean;
  constructor(
    private readonly projectConfigurationService: ProjectConfigurationService,
    private readonly snackbar: SnackBarService,
  ) { }

  public async ngOnInit(): Promise<void> {
    this.projectConfig = await this.projectConfigurationService.getConfig();

    this.showAskForNotifications = this.doAskForNotifications();
  }

  public async requestNotificationPermission(): Promise<void> {
    const permission = await Notification.requestPermission();

    const snackbarMessage = permission === 'granted'
      ? '#LDS#You will receive notifications from this website.'
      : '#LDS#You will not receive any notifications from this website.';
    this.snackbar.open({ key: snackbarMessage }, '#LDS#Close');

    this.showAskForNotifications = this.doAskForNotifications();
  }

  private doAskForNotifications(): boolean {
    return this.projectConfig?.VI_Common_EnableNotifications
      && typeof (Notification) !== 'undefined'
      && Notification.permission !== 'granted'
      && Notification.permission !== 'denied';
  }
}