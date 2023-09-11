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
import { NotificationRegistryService } from './notification-registry.service';
import { TranslateService } from '@ngx-translate/core';
import { V2ApiClientMethodFactory } from 'imx-api-qer';
import { ClassloggerService, AppConfigService } from 'qbm';

@Injectable({ providedIn: 'root' })
export class NotificationStreamService implements OnDestroy {

  constructor(private logger: ClassloggerService,
    private appConfigService: AppConfigService,
    private translateService: TranslateService,
    private readonly notificationRegistry: NotificationRegistryService,
  ) {
  }

  private stream: EventSource;

  /** Connects to the the event stream API and starts listening to notifications. */
  public openStream() {
    const factory = new V2ApiClientMethodFactory();
    const path = factory.portal_eventstream_get().path;
    this.stream = new EventSource(this.appConfigService.BaseUrl + path, {
      withCredentials: true,
    });
    this.stream.onopen = () => {
      this.logger.debug(this, 'Notification stream has been created 👍');
    };

    this.stream.onmessage = (evt) => {
      let data = JSON.parse(evt.data);
      const notificationHandler = this.notificationRegistry.get(data.Id);
      if (notificationHandler) {
        this.translateService.get(notificationHandler.message).toPromise().then(
          translatedMessage => {
            var notification = new Notification(translatedMessage);
            notification.onclick = (event) => {
              notificationHandler.activate();
            }
          });
      }
    };

    this.stream.onerror = (err) => {
      this.logger.error('Notification stream: An error occured in data stream: ', err);
    };
  }

  ngOnDestroy(): void {
    if (this.stream)
      this.stream.close();
  }

}