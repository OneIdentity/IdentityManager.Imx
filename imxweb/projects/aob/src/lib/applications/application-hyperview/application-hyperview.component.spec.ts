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
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { EuiLoadingService, EuiCoreModule } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { HyperViewModule, clearStylesFromDOM } from 'qbm';
import { ApplicationHyperviewComponent } from './application-hyperview.component';
import { ApplicationHyperviewService } from './application-hyperview.service';

describe('ApplicationHyperviewComponent', () => {
  let component: ApplicationHyperviewComponent;
  let fixture: ComponentFixture<ApplicationHyperviewComponent>;

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        EuiCoreModule,
        HyperViewModule,
        LoggerTestingModule,
        TranslateModule,
        MatDialogModule,
        MatButtonModule
      ],
      declarations: [ApplicationHyperviewComponent],
      providers: [
        {
          provide: ApplicationHyperviewService,
          useValue: {
            get: jasmine.createSpy('get').and.returnValue([])
          }
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        }
      ]
    });
  });

  beforeEach(waitForAsync(() => {
    euiLoadingServiceStub.hide.calls.reset();
    euiLoadingServiceStub.show.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationHyperviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('fetches shapes', async () => {
    await component.ngOnChanges();
    expect(component.shapes.length).toEqual(0);
  });

});
