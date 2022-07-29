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

import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { configureTestSuite } from 'ng-bullet';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { SnackBarService } from './snack-bar.service';
import { LdsReplacePipe } from '../lds-replace/lds-replace.pipe';

describe('SnackBarService', () => {

  let service: SnackBarService;

  const matSnackBarStub = {
    open: jasmine.createSpy('open'),
    dismiss: jasmine.createSpy('dismiss')
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({

      providers: [
        {
          provide: MatSnackBar,
          useValue: matSnackBarStub
        },
        {
          provide: TranslateService,
          useValue: {
            get: key => of(key + '_übersetzt')
          }
        },
        {
          provide: LdsReplacePipe,
          useValue: {}
        }
      ]
    })
  });

  beforeEach(() => {
    matSnackBarStub.open.calls.reset();
    service = TestBed.get(SnackBarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be trigger open of MatSnackBar with a predifined config', () => {
    service.open({ key: 'TestMessage' });

    expect(matSnackBarStub.open).toHaveBeenCalledWith('TestMessage_übersetzt', '#LDS#Close_übersetzt', { duration: 5000, verticalPosition: 'top' });
  });

  it('should be trigger open of MatSnackBar with custom action text and a predifined config', () => {
    service.open({ key: 'TestMessage' }, 'Action');

    expect(matSnackBarStub.open).toHaveBeenCalledWith('TestMessage_übersetzt', 'Action_übersetzt', { duration: 5000, verticalPosition: 'top' });
  });

  it('should be trigger open of MatSnackBar at the bottom', () => {
    service.openAtTheBottom({ key: 'TestMessage' });

    expect(matSnackBarStub.open).toHaveBeenCalledWith('TestMessage_übersetzt', '#LDS#Close_übersetzt', { duration: 10000, verticalPosition: 'bottom' });
  });

  it('should be trigger dismiss of MatSnackBar', () => {
    service.dismiss();

    expect(matSnackBarStub.dismiss).toHaveBeenCalled();
  });

});
