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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { of, Subject } from 'rxjs';

import { MastHeadComponent } from './mast-head.component';
import { AppConfigService } from '../appConfig/appConfig.service';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';
import { AuthenticationService } from '../authentication/authentication.service';
import { ISessionState } from '../session/session-state';
import { MessageDialogResult } from '../message-dialog/message-dialog-result.enum';
import { ConfirmationService } from '../confirmation/confirmation.service';

describe('MastHeadComponent', () => {
  let component: MastHeadComponent;
  let fixture: ComponentFixture<MastHeadComponent>;

  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  let result: MessageDialogResult;

  const mockDialog = {
    open: jasmine.createSpy('open').and.callFake(__ => ({
      afterClosed: () => of(result)
    }))
  };

  const authenticationServiceStub = new class {
    readonly onSessionResponse = new Subject<ISessionState>();
    readonly logout = jasmine.createSpy('logout');

    reset() {
      this.logout.calls.reset();
    }
  }();

  let confirm = true;
  const mockConfirmationService = {
    confirm: jasmine.createSpy('confirm')
      .and.callFake(() => Promise.resolve(confirm))
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [MastHeadComponent],
      imports: [
        EuiCoreModule,
        EuiMaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: MatDialog,
          useValue: mockDialog
        },
        {
          provide: ConfirmationService,
          useValue: mockConfirmationService
        },
        {
          provide: AppConfigService,
          useValue: {
            getImxConfig: () => Promise.resolve({}),
            Config: { Title: '' }
          }
        },
        {
          provide: AuthenticationService,
          useValue: authenticationServiceStub
        }
      ]
    });
  });

  beforeEach(waitForAsync(() => {
    authenticationServiceStub.reset();
    mockRouter.navigate.calls.reset();
    mockDialog.open.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MastHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the about-dialog', () => {
    component.openAboutDialog();
    expect(mockDialog.open).toHaveBeenCalled();
  });

  [
    { result: true },
    { result: false },
  ].forEach(testcase => {
    it(`can logout with result ${testcase.result}`, async () => {
      confirm = testcase.result;
      await component.logout();
      if (testcase.result) {
        expect(authenticationServiceStub.logout).toHaveBeenCalled();
      } else {
        expect(authenticationServiceStub.logout).not.toHaveBeenCalled();
      }
    });
  });
});
