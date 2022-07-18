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
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { configureTestSuite } from 'ng-bullet';

import { ServiceIssuesComponent } from './service-issues.component';
import { ServiceIssuesService } from './service-issues.service';
import { AppConfigService, clearStylesFromDOM } from 'qbm';

describe('imx_ServiceIssuesComponent', () => {
  let component: ServiceIssuesComponent;
  let fixture: ComponentFixture<ServiceIssuesComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        MatCardModule,
        MatGridListModule
      ],
      declarations: [
        ServiceIssuesComponent
      ],
      providers: [
        {
          provide: ServiceIssuesService,
          useClass: class {
            updateItems = jasmine.createSpy('updateIssues');
            items = [
              {
                title: 'test',
                text: 'testText',
                icon: 'Icon',
                severityClass: 'severityClass',
                action: {
                  caption: 'test',
                  action: () => {
                    throw new Error('Called');
                  }
                }
              }
            ];
            subscribe = jasmine.createSpy('subscribe');
            unsubscribe = jasmine.createSpy('unsubscribe');
          }
        },
        {
          provide: AppConfigService,
          useClass: class {
            Config = {
              NotificationUpdateInterval: 60
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
    fixture = TestBed.createComponent(ServiceIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should have issues ', () => {
    fixture.detectChanges();
    expect(component.issues.length).toBe(1);
  });

  it('action is called ', () => {
    fixture.detectChanges();
    try {
      component.issues[0].action.action();
    } catch (e) {
      expect(e.message).toBe('Called');
    }
  });

  it('could be initialized by angular', fakeAsync(() => {
    expect(() => {
      component.ngOnInit();
      tick(3001);
    }).not.toThrowError();
    discardPeriodicTasks();
  }));

  it('could be destroyed by angular', () => {
    expect(() => {
      component.ngOnDestroy();
    }).not.toThrowError();
  });
});
