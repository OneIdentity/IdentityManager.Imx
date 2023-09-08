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

import { of, Subject } from 'rxjs';
import { ngMocks } from 'ng-mocks';
import { EuiSidesheetRef, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { RouteGuardService } from './lib/route-guard/route-guard.service';
import { ISessionState } from './lib/session/session-state';
import { AuthenticationService } from './lib/authentication/authentication.service';
import { CacheService } from './lib/cache/cache.service';
import { CachedPromise } from 'imx-qbm-dbts';

export class QbmDefaultMocks {
  public static readonly afterClosedSubject = new Subject<any>();
  public static readonly sidesheetServiceStub = {
    open: jasmine.createSpy().and.returnValue({
      afterClosed: () => QbmDefaultMocks.afterClosedSubject,
    }),
  };

  public static readonly sidesheetRefStub = {
    close: jasmine.createSpy('close'),
    closeClicked: jasmine.createSpy('closeClicked').and.returnValue(of(undefined))
}

  public static readonly authServiceStub = {
    onSessionResponse: new Subject<ISessionState>(),
    update: jasmine.createSpy('update'),
  } as unknown as AuthenticationService;

  public static registerDefaultMocks(): void {
    ngMocks.defaultMock(EuiSidesheetService, () => QbmDefaultMocks.sidesheetServiceStub);
    ngMocks.defaultMock(RouteGuardService, () => ({}));
    ngMocks.defaultMock(AuthenticationService, () => QbmDefaultMocks.authServiceStub);
    ngMocks.defaultMock(TranslateService, () => ({
      get: jasmine.createSpy('get').and.returnValue(of()),
    }));
    ngMocks.defaultMock(EuiSidesheetRef,()=> QbmDefaultMocks.sidesheetRefStub);
    ngMocks.defaultMock(CacheService, () => ({
      buildCache: (func) => {
        return new CachedPromise(func);
      }
    }));
  }
}
