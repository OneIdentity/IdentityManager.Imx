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

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EventStreamConfig } from 'imx-api-qbm';
import { EntityCollectionChangeData } from 'imx-qbm-dbts';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { imx_SessionService } from '../session/imx-session.service';

export interface StatusSession {
  OpenSessions?: number[];
  time?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  public statusSessionData: EntityCollectionChangeData[] = [];
  public statusSession: number = 0;
  // Config Params
  public configParams: EventStreamConfig;

  private stream: EventSource;
  constructor(
    public session: imx_SessionService,
    public translateService: TranslateService,
    private logger: ClassloggerService) { }

  
  public async setUp(path: string): Promise<void> {
    // Setup connection and event triggers
    this.stream = new EventSource(path + '/admin/status', {
      withCredentials: true,
    });

    this.stream.onopen = () => {
      this.logger.debug(this, 'Session stream has been created 👍');
    };

    this.stream.onmessage = (evt) => {
      const changeData: EntityCollectionChangeData = JSON.parse(evt.data);
      console.log(changeData)
      this.statusSession = changeData["OpenSessions"];
    };

    this.stream.onerror = (err) => {
      this.logger.error('Session: An error occured in data stream: ', err);
    };
  }

  public getStatusSessionData(){
    return this.statusSession;
  }
}
