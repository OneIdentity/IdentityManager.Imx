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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EuiLoadingService } from '@elemental-ui/core';
import { TypedEntityCollectionData } from 'imx-qbm-dbts';
import { GroupsService } from '../../groups.service';

import { ChildSystemEntitlementsComponent } from './child-system-entitlements.component';

function mockGetGroups(): TypedEntityCollectionData<any> {
  return {totalCount: 100, Data: ['1', '2']};
}

describe('ChildSystemEntitlementsComponent', () => {
  let component: ChildSystemEntitlementsComponent;
  let fixture: ComponentFixture<ChildSystemEntitlementsComponent>;

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ChildSystemEntitlementsComponent],
      providers: [
        {
        provide: EuiLoadingService,
        useValue: euiLoadingServiceStub
      },
      {
        provide: GroupsService,
        useValue: {
          getDataModel:jasmine.createSpy('getDataModel').and.returnValue(Promise.resolve({})),
          getGroupsGroupMembers: jasmine.createSpy('getGroupsGroupMembers').and.returnValue(Promise.resolve(mockGetGroups())),
          UnsGroupMembersSchema: {
            Columns: {
              __Display: { ColumnName: '__Display' },
              UID_UNSGroupChild: { ColumnName: 'UID_UNSGroupChild' },
              XDateInserted: { ColumnName: 'XDateInserted' }
            }
          }
        }
      }
    ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildSystemEntitlementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
