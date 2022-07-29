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

import { DeviceStateService } from './device-state.service';
import { TestBed, inject } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';


describe('DeviceStateService', () => {

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [DeviceStateService]
    })
  });

  it('should be created', inject([DeviceStateService], (service: DeviceStateService) => {
    expect(service).toBeTruthy();
  }));

  it('has a method isPhoneDevice', inject([DeviceStateService], (service: DeviceStateService) => {
    expect(() => service.isPhoneDevice()).not.toThrow();
  }));

  it('has a property deviceState', inject([DeviceStateService], (service: DeviceStateService) => {
    expect(() => service.deviceState).not.toThrow();
  }));
});
