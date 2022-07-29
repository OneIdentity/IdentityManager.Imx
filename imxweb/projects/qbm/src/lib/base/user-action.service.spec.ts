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
 * Copyright 2022 One Identity LLC.
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

import { TestBed, inject } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';

import { UserActionService } from './user-action.service';

describe('UserActionService', () => {

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [UserActionService]
    });
  });

  it('copy data to clipBoard', inject([UserActionService], (service: UserActionService) => {
    const copySpy = spyOn(document, 'execCommand');
    service.copy2Clipboard('foo');
    expect(copySpy).toHaveBeenCalledWith('copy');
  }));

  it('downloadsData', inject([UserActionService], (service: UserActionService) => {
    expect(() => {
      service.downloadData('foo', 'foo', 'text');
    }).not.toThrowError();
  }));
});
