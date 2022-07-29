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
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { configureTestSuite } from 'ng-bullet';

import { NotificationsComponent } from './notifications.component';
import { NotificationsService } from './notifications.service';
import { AppConfigService, clearStylesFromDOM } from 'qbm';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        NotificationsComponent
      ],
      providers: [
        {
          provide: NotificationsService,
          useClass: class {
            items = [
              {
                title: 'test',
                text: 'testText',
                icon: 'Icon',
                action: {
                  caption: 'test',
                  action: () => {
                    throw new Error('Called');
                  }
                }
              }
            ];
            updateItems = jasmine.createSpy('updateItems');
            subscribe = jasmine.createSpy('subscribe');
            unsubscribe = jasmine.createSpy('unsubscribe');
          }
        },
        {
          provide: AppConfigService,
          useClass: class {
            Config = {
              NotificationUpdateInterval: 1000
            };
          }
        }
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
