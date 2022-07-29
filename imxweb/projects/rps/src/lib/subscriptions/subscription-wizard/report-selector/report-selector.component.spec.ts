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

import { ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiCoreModule } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM } from 'qbm';
import { ReportSubscriptionService } from '../../report-subscription/report-subscription.service';
import { ReportSelectorComponent } from './report-selector.component';

describe('ReportTableComponent', () => {
  let component: ReportSelectorComponent;
  let fixture: ComponentFixture<ReportSelectorComponent>;

  let reportData = { totalCount: 0, Data: [] };
  const mockReportSubscriptionservice = {
    getReportCandidates: jasmine.createSpy('getReportCandidates').and.callFake(() => Promise.resolve(reportData))
  }

  const mockDetector = {
    detectChanges: jasmine.createSpy('detectChanges')
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        EuiCoreModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        NoopAnimationsModule,
        ScrollingModule,
        MatListModule
      ],
      declarations: [ReportSelectorComponent],
      providers: [
        {
          provide: ReportSubscriptionService,
          useValue: mockReportSubscriptionservice
        },
        {
          provide: ChangeDetectorRef,
          useValue: mockDetector
        }
      ]
    })
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('writes a value', () => {
    component.writeValue('test');
    expect(component.uidReport).toEqual('test');
  });

  it('registers an onChange method', () => {
    let val = '';
    component.registerOnChange((str: string) => val = str);

    component.onChange('a value');
    expect(val).toEqual('a value');
  });

  it('registers an onTouched method', () => {
    let val = '';
    component.registerOnTouched((str) => val = str);

    component.onTouch('a value');
    expect(val).toEqual('a value');
  });

  it('updates its selection', () => {
    let val = '';
    component.registerOnChange((str: string) => val = str);

    component.updateSelected({
      option: {
        value: {
          GetEntity: () => ({
            GetKeys: () => ['uid']
          })
        }
      }, source: null
    } as MatSelectionListChange)

    expect(val).toEqual('uid');
    expect(component.uidReport).toEqual('uid');
  });

  it('updates value changes', fakeAsync(() => {
    component.ngOnInit();
    tick(1000);

    component.searchControl.setValue('test');

    tick(1000);
    expect(mockReportSubscriptionservice.getReportCandidates).toHaveBeenCalled();
  }))

  it('has a valid life cycle', async () => {
    expect(async () => {
      await component.ngOnInit();
      await component.ngAfterViewInit();
      return component.ngOnDestroy();
    }).not.toThrowError();
  });
});
