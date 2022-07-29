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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EuiCoreModule } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { Subject } from 'rxjs';

import { UserMessageComponent } from './user-message.component';
import { UserMessageService } from './user-message.service';
import { Message } from './message.interface';

describe('UserMessageComponent', () => {
  let component: UserMessageComponent;
  let fixture: ComponentFixture<UserMessageComponent>;

  const userMessageServiceStub = {
    subject: new Subject<Message>()
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [UserMessageComponent],
      imports: [
        EuiCoreModule,
        LoggerTestingModule
      ],
      providers: [
        {
          provide: UserMessageService,
          useValue: userMessageServiceStub
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserMessageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('could be initialized by angular', () => {
    fixture.detectChanges();
    expect(userMessageServiceStub.subject.observers.length).toEqual(1);
  });

  it('unsubscribes on destroy', () => {
    fixture.detectChanges();
    expect(userMessageServiceStub.subject.observers.length).toEqual(1);

    component.ngOnDestroy();
    expect(userMessageServiceStub.subject.observers.length).toEqual(0);
  });

  it('starts eui-alert as dismissed', ()=>{
    fixture.detectChanges();
    expect(component.alert.isDismissed).toBeTruthy();
  });

  it('set alert as not dismissed, when a message comes in ', () => {
    fixture.detectChanges();
    expect(component.alert.isDismissed).toBeTruthy();

    const message = {
      type: 'success',
      text: 'success'
    } as Message;

    userMessageServiceStub.subject.next(message);
    expect(component.alert.isDismissed).toBeFalsy();

    component.alert.dismiss(null);
    expect(component.alert.isDismissed).toBeTruthy();
    userMessageServiceStub.subject.next(message);
    expect(component.alert.isDismissed).toBeFalsy();
  });
});
