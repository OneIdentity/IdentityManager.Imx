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
 * Copyright 2024 One Identity LLC.
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
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { MockBuilder } from 'ng-mocks';
import { of } from 'rxjs';

import { ServiceitemListComponent } from './serviceitem-list.component';
import { ServiceItemsService } from '../service-items.service';
import { clearStylesFromDOM, MessageDialogComponent } from 'qbm';
import { PortalShopServiceitems } from '@imx-modules/imx-api-qer';
import { ServiceItemsModule } from '../service-items.module';

describe('ServiceitemListComponent', () => {
  let component: ServiceitemListComponent;
  let fixture: ComponentFixture<ServiceitemListComponent>;
  let getServiceItems: jasmine.Spy;
  let openDialog: jasmine.Spy;

  const serviceItems = {
    extendedData: { PeerGroupSize: 1 },
  };

  beforeEach(() => {
    getServiceItems = jasmine.createSpy('get').and.returnValue(Promise.resolve(serviceItems));
    openDialog = jasmine.createSpy('open');

    return MockBuilder(ServiceitemListComponent)
      .mock(ServiceItemsModule)
      .mock(MatDialog, { open: openDialog })
      .mock(TranslateService, {
        get: jasmine.createSpy('get').and.callFake((key: string) => of(key)),
      })
      .mock(ServiceItemsService, {
        PortalShopServiceItemsSchema: PortalShopServiceitems.GetEntitySchema(),
        get: getServiceItems,
        getDataModel: jasmine.createSpy('getDataModel').and.returnValue(Promise.resolve({})),
      });
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

  it('should not warn when adding products to a bundle without peer-group metadata', async () => {
    const data = {};
    component.patternItemsMode = true;
    getServiceItems.and.returnValue(Promise.resolve(data));

    await component.getData();

    expect(getServiceItems).toHaveBeenCalledWith(jasmine.objectContaining({ UID_PersonPeerGroup: undefined }));
    expect(component.dstSettings.dataSource).toBeDefined();
    expect(component.noDataText).toBe('#LDS#No data');
    expect(openDialog).not.toHaveBeenCalled();
  });

  [
    { description: 'missing extended data', data: {} },
    { description: 'missing peer-group size', data: { extendedData: {} } },
    { description: 'a zero peer-group size', data: { extendedData: { PeerGroupSize: 0 } } },
  ].forEach(({ description, data }) => {
    it(`should not warn during ordinary product selection with ${description}`, async () => {
      getServiceItems.and.returnValue(Promise.resolve(data));

      await component.getData();

      expect(component.peerGroupSize).toBe(0);
      expect(component.noDataText).toBe('#LDS#No data');
      expect(openDialog).not.toHaveBeenCalled();
    });
  });

  it('should not warn during reference-user selection without peer-group metadata', async () => {
    component.referenceUserUid = 'reference-user';
    getServiceItems.and.returnValue(Promise.resolve({}));

    await component.getData();

    expect(getServiceItems).toHaveBeenCalledWith(
      jasmine.objectContaining({ UID_PersonReference: 'reference-user', UID_PersonPeerGroup: undefined }),
    );
    expect(component.noDataText).toBe('#LDS#No data');
    expect(openDialog).not.toHaveBeenCalled();
  });

  it('should preserve the warning and heading for an explicitly selected empty peer group', async () => {
    component.uidPersonPeerGroup = 'peer-group-user';
    getServiceItems.and.returnValue(Promise.resolve({ extendedData: { PeerGroupSize: 0 } }));

    await component.getData();

    expect(getServiceItems).toHaveBeenCalledWith(jasmine.objectContaining({ UID_PersonPeerGroup: 'peer-group-user' }));
    expect(component.noDataText).toBe('#LDS#Heading Peer Group Is Empty');
    expect(openDialog).toHaveBeenCalledOnceWith(MessageDialogComponent, {
      data: {
        ShowOk: true,
        Title: '#LDS#Heading Peer Group Is Empty',
        Message: '#LDS#You cannot view products of your peer group. Your peer group is empty.',
      },
      panelClass: 'imx-messageDialog',
    });
  });

  it('should not warn for an explicitly selected nonempty peer group', async () => {
    component.uidPersonPeerGroup = 'peer-group-user';

    await component.getData();

    expect(component.peerGroupSize).toBe(1);
    expect(component.noDataText).toBe('#LDS#No data');
    expect(openDialog).not.toHaveBeenCalled();
  });

  it('should reset the peer-group heading when returning to ordinary product selection', async () => {
    component.uidPersonPeerGroup = 'peer-group-user';
    getServiceItems.and.returnValue(Promise.resolve({ extendedData: { PeerGroupSize: 0 } }));
    await component.getData();
    expect(component.noDataText).toBe('#LDS#Heading Peer Group Is Empty');
    expect(openDialog).toHaveBeenCalledTimes(1);

    component.uidPersonPeerGroup = undefined;
    getServiceItems.and.returnValue(Promise.resolve({}));
    openDialog.calls.reset();

    await component.getData();

    expect(component.noDataText).toBe('#LDS#No data');
    expect(openDialog).not.toHaveBeenCalled();
  });
});
