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
import { configureTestSuite } from 'ng-bullet';

import { MasterDetailComponent } from './master-detail.component';
import { DeviceStateService } from '../services/device-state.service';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

describe('MasterDetailComponent', () => {
  let component: MasterDetailComponent;
  let fixture: ComponentFixture<MasterDetailComponent>;

  let deviceType = 'desktop';

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [MasterDetailComponent],
      providers: [
        {
          provide: DeviceStateService,
          useClass: class {
            get deviceState(): string {
              return deviceType;
            }
            isPhoneDevice = jasmine.createSpy('isPhoneDevice').and.callFake(() => deviceType === 'mobile');
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the detailpane on phone devices', () => {
    spyOn(component, 'isPhoneDevice').and.returnValue(true);
    spyOn(component, 'toggleDetailPane').and.callThrough();
    component.ngOnInit();
    expect(component.toggleDetailPane).toHaveBeenCalledWith(false);
  });

  it('should call toggleDetailPane if isPhoneDevice() returns true', () => {
    spyOn(component, 'isPhoneDevice').and.returnValue(true);
    spyOn(component, 'toggleDetailPane');
    component.openDetailPane();
    expect(component.isPhoneDevice).toHaveBeenCalled();
    expect(component.toggleDetailPane).toHaveBeenCalledWith(false);
  });

  it('should not call toggleDetailPane if isPhoneDevice() returns false', () => {
    spyOn(component, 'isPhoneDevice').and.returnValue(false);
    spyOn(component, 'toggleDetailPane');
    component.openDetailPane();
    expect(component.isPhoneDevice).toHaveBeenCalled();
    expect(component.toggleDetailPane).not.toHaveBeenCalled();
  });

  it('should getting devicestate from service when calling getDeviceState()', () => {
    expect(component.getDeviceState()).toEqual(deviceType);
  });

  it('should toggle detail', () => {
    component.detailClosed = true;

    component.toggleDetailPane();
    expect(component.detailClosed).toBeFalsy();

    component.toggleDetailPane(false);
    expect(component.detailClosed).toBeFalsy();

    component.toggleDetailPane();
    expect(component.detailClosed).toBeTruthy();

    component.toggleDetailPane(true);
    expect(component.detailClosed).toBeTruthy();

    component.toggleDetailPane(false);
    expect(component.detailClosed).toBeFalsy();
  });

  it('has a method checkMode that sets isSinglePanel to true when deviceType is mobile', () => {
    deviceType = 'mobile';
    component.checkMode();
    expect(component.isSinglePanel).toEqual(true);
  });

  it('has a method checkMode that sets isSinglePanel to false when deviceType is not mobile', () => {
    deviceType = 'desktop';
    component.checkMode();
    expect(component.isSinglePanel).toEqual(false);
  });
});
