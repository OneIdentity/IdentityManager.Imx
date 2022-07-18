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

import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from 'ng-bullet';
import { of } from 'rxjs';

import { MessageDialogResult } from '../message-dialog/message-dialog-result.enum';

import { ConfirmationService } from './confirmation.service';

describe('ConfirmationService', () => {

  let result: any;
  const mockMatDialog = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(result) }),
    closeAll: jasmine.createSpy('closeAll')
  };


  let service: ConfirmationService;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatDialogModule
      ],
      providers: [
        {
          provides: MatDialog,
          useValue: mockMatDialog
        }
      ]
    })
  });

  it('should be created', () => {
    service = TestBed.inject(ConfirmationService);
    expect(service).toBeTruthy();
  });

  for (const testcase of [
    { result: MessageDialogResult.YesResult, expect: true },
    { result: MessageDialogResult.NoResult, expect: false }
  ]) {
    it('confirmed changes', fakeAsync(() => {
      service = TestBed.inject(ConfirmationService);
      result = testcase.result;
  
      service.confirmLeaveWithUnsavedChanges().then(
        res => expect(res).toEqual(testcase.expect)
      );
      tick(1000);
  
    }));
  }

  for (const testcase of [
    { result: MessageDialogResult.YesResult, expect: true },
    { result: MessageDialogResult.NoResult, expect: false }
  ]) {
    it('confirmed something', fakeAsync(() => {
      service = TestBed.inject(ConfirmationService);
      result = testcase.result;
  
      service.confirm({
        Title: 'Title',
        Message: 'Message',
        identifier: 'Identifier'
      }).then(
        res => expect(res).toEqual(testcase.expect)
      );
      tick(1000);
  
    }));
  }
  
});
