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

import { NavigationEnd, NavigationStart } from '@angular/router';
import { of } from 'rxjs';

export class RoutingMock {
  public navigate = jasmine.createSpy('navigate');
  public events = of(new NavigationEnd(0, '', ''), new NavigationStart(1, ''));

  public static GetActiveRouteMock(spyResult?: any, queryParams?: { [key: string]: any }, queryParamsMap?: any): any {
    return {
      snapshot: {
        paramMap: {
          get: spyResult != null ? jasmine.createSpy('get').and
            .returnValue(spyResult) : jasmine.createSpy('get').and.callFake((key: string) => key)
        },
        queryParamMap: {
          get: jasmine.createSpy('get').and.returnValue(queryParamsMap)
        }
      },
      queryParams
    };
  }

  public reset(): void {
    this.navigate.calls.reset();
  }
}
