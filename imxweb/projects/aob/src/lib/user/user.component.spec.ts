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
import { MatIconModule } from '@angular/material/icon';
import { configureTestSuite } from 'ng-bullet';
import { TranslateService } from '@ngx-translate/core';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { of } from 'rxjs';

import { UserComponent } from './user.component';
import { IReadValue } from 'imx-qbm-dbts';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [UserComponent],
      imports: [
        LoggerTestingModule,
        MatIconModule
      ],
      providers: [
        {
          provide: TranslateService,
          useValue: {
            get: jasmine.createSpy('get').and.callFake(key => of(key.replace('#LDS#','')))
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    component.uid = { Column: { GetDisplayValue: () => '' } } as IReadValue<any>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  [
    { noUserText: '', uid: '', expect: { noUserText: '(not assigned)', primValue: '', secValue: '(not assigned)' } },
    { noUserText: 'dummyNoUserText', uid: undefined, expect: { noUserText: 'dummyNoUserText', primValue: '', secValue: 'dummyNoUserText' } },
    { noUserText: 'image', uid: '5642', expect: { noUserText: 'image', primValue: '5642', secValue: 'dummyRole' } },
  ].forEach(testcase =>
    it('should refresh when ngOnChanges calls', () => {
      // Arrange
      component.noUserText = testcase.noUserText;
      component.uid = {
        value: testcase.uid,
        Column: { GetDisplayValue: () => testcase.uid }
      } as IReadValue<string>;
      component.role = 'dummyRole';

      // Act
      component.ngOnChanges();

      // Assert
      expect(component.noUserText).toContain(testcase.expect.noUserText);
      expect(component.primaryValue).toBe(testcase.expect.primValue);
      expect(component.secondaryValue).toBe(testcase.expect.secValue);
    })
  );
});
