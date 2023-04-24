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
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { configureTestSuite } from 'ng-bullet';
import { of } from 'rxjs';

import { ObjectHistoryService } from './object-history.service';
import { ObjectHistoryComponent } from './object-history.component';
import { EuiLoadingService } from '@elemental-ui/core';
import { ImxTranslationProviderService } from '../translation/imx-translation-provider.service';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';
import { DateAdapter } from '@angular/material/core';

describe('ObjectHistoryComponent', () => {
  let component: ObjectHistoryComponent;
  let fixture: ComponentFixture<ObjectHistoryComponent>;

  const objectHistoryGetSpy = jasmine.createSpy('get').and.returnValue(Promise.resolve({}));

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ObjectHistoryComponent
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        {
          provide: ObjectHistoryService,
          useClass: class {
            get = objectHistoryGetSpy;
          }
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        },
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
            multilanguageTranslationDict = {};
            Translate = jasmine.createSpy('Translate').and.callFake((key: string) => of(key));
          }
        },
        {
          provide: DateAdapter,
          useValue: {
            setLocale: jasmine.createSpy('setLocale')
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('could be initialized by angular', () => {
    expect(() => {
      component.ngOnInit();
      expect(objectHistoryGetSpy).toHaveBeenCalled();
    }).not.toThrowError();
  });

  it('calls service Get when user clicks Refresh', async () => {
    await component.refresh();
    expect(objectHistoryGetSpy).toHaveBeenCalled();
  });
});
