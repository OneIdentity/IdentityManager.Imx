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
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { configureTestSuite } from 'ng-bullet';

import { ObjectHistoryTimelineComponent } from './object-history-timeline.component';
import { ImxTranslationProviderService } from '../../translation/imx-translation-provider.service';
import { clearStylesFromDOM } from '../../testing/clear-styles.spec';

describe('ObjectHistoryTimelineComponent', () => {
  let component: ObjectHistoryTimelineComponent;
  let fixture: ComponentFixture<ObjectHistoryTimelineComponent>;

  const historyDataDummy = [
    {
      ChangeTime: new Date(2017, 4, 23),
      Property: 'Herr Nilsson',
      LongDisplay: 'Conversation',
      ChangeType: 'Added'
    },
    {
      ChangeTime: new Date(2017, 5, 1),
      Property: 'Kurt Olsson',
      LongDisplay: 'Mail from boss',
      ChangeType: 'Updated'
    }
  ];

  const objectHistoryGetSpy = jasmine.createSpy('Get').and.returnValue(Promise.resolve(historyDataDummy));

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ObjectHistoryTimelineComponent
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: jasmine.createSpy('get').and.callFake((key: string) => key)
              }
            }
          }
        },
        {
          provide: ImxTranslationProviderService,
          useClass: class {
            init = jasmine.createSpy('init');
            MultiLanguageCaptions = {};
          }
        }
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectHistoryTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('does not call service Get when Refresh is called with argument', () => {
    objectHistoryGetSpy.calls.reset();
    component.historyData = [];
    component.ngOnChanges({
      historyData: {
        currentValue: ''
      } as SimpleChange
    });
    expect(objectHistoryGetSpy).not.toHaveBeenCalled();
  });
});

function findInHTML(elements: HTMLCollectionOf<Element>, texts: string[]): boolean {
  for (const element of elements as any) {
    if (texts.filter(text => (element as Element).innerHTML.indexOf(text) > -1).length === texts.length) {
      return true;
    }
  }
  return false;
}
