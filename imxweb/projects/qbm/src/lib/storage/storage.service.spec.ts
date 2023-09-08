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

import { TestBed } from '@angular/core/testing';

import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isHelperAlertDismissed() tests', () => {
    let sessionStorageGetItemSpy: jasmine.Spy;
    beforeEach(() => {
      sessionStorageGetItemSpy = spyOn(sessionStorage, 'getItem');
    });
    it(`should return true when the supplied key matches an entry in the
    sessionStorage that has a value of 'true'`, () => {
      sessionStorageGetItemSpy.and.returnValue('true');
      expect(service.isHelperAlertDismissed('testKey')).toEqual(true);
    });
    it(`should return false when the supplied key matches an entry in the
    sessionStorage but has a value not matching 'true'`, () => {
      sessionStorageGetItemSpy.and.returnValue('false');
      expect(service.isHelperAlertDismissed('testKey')).toEqual(false);
    });
    it(`should return false when the supplied key doesn't match an entry in the
    sessionStorage`, () => {
      sessionStorageGetItemSpy.and.returnValue('false');
      expect(service.isHelperAlertDismissed('testUnknownKey')).toEqual(false);
    });
  });

  describe('storeHelperAlertDismissal() tests', () => {
    it(`should make a call to store the supplied key in the sessionStorage with the value
    of 'true`, () => {
      const sessionStorageSetItemSpy = spyOn(sessionStorage, 'setItem');
      const mockKey = 'testHelperKey';
      service.storeHelperAlertDismissal(mockKey);
      expect(sessionStorageSetItemSpy).toHaveBeenCalledWith(mockKey, 'true');
    });
  });

});
