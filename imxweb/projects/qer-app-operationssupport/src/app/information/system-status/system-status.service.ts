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

import { Observable, from } from 'rxjs';
import { Injectable } from '@angular/core';

import { imx_SessionService } from 'qbm';
import { SystemStatusInformation } from './system-status-information.interface';
import { OpSupportUserService } from 'qer';

@Injectable()
export class SystemStatusService {
  constructor(private session: imx_SessionService, private readonly userService: OpSupportUserService) { }

  public getStatus(): Observable<SystemStatusInformation> {
    return from(this.get());
  }

  public setStatus(isJobServiceDisabled: boolean, isDbSchedulerDisabled: boolean): Observable<SystemStatusInformation> {
    return from(this.set(isJobServiceDisabled, isDbSchedulerDisabled));
  }

  public get(): Promise<SystemStatusInformation> {
    return this.session.Client.opsupport_systemstatus_get();
  }

  public set(isJobServiceDisabled: boolean, isDbSchedulerDisabled: boolean): Promise<SystemStatusInformation> {
    return this.session.Client.opsupport_systemstatus_post('', {
      IsDbSchedulerDisabled: isDbSchedulerDisabled,
      IsJobServiceDisabled: isJobServiceDisabled
    });
  }

  public async isSystemAdmin(): Promise<boolean> {
    return (await this.userService.getGroups()).some(role => role.Name === 'VID_BaseData_SystemStop_EditRights');
  }
}
