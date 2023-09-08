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
 * Copyright 2023 One Identity LLC.
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

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MockBuilder } from 'ng-mocks';

import { ServiceitemListComponent } from './serviceitem-list.component';
import { ServiceItemsService } from '../service-items.service';
import { clearStylesFromDOM } from 'qbm';
import { PortalShopServiceitems } from 'imx-api-qer';
import {ServiceItemsModule} from '../service-items.module';

describe('ServiceitemListComponent', () => {
  let component: ServiceitemListComponent;
  let fixture: ComponentFixture<ServiceitemListComponent>;

  const serviceItems = {
    extendedData: { PeerGroupSize: 1 }
  };

  beforeEach(()=>{
    return MockBuilder(ServiceitemListComponent)
    .mock(ServiceItemsModule)
    .mock(ServiceItemsService,{
                PortalShopServiceItemsSchema: PortalShopServiceitems.GetEntitySchema(),
                get: jasmine.createSpy('get').and.returnValue(Promise.resolve(serviceItems)),
                getDataModel: jasmine.createSpy('getDataModel').and.returnValue(Promise.resolve({}))
              })
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceitemListComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(component.dstSettings).toBeDefined();
    expect(component.peerGroupSize).toEqual(serviceItems.extendedData.PeerGroupSize);
  }));
});
