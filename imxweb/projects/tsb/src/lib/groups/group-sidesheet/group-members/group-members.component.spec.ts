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
import { EuiSidesheetService } from '@elemental-ui/core';
import { TypedEntityCollectionData } from 'imx-qbm-dbts';
import { of } from 'rxjs';
import { TsbTestBed } from '../../../test/tsb-test-bed.spec';
import { GroupsService } from '../../groups.service';
import { GroupMembersComponent } from './group-members.component';
import { NewMembershipService } from './new-membership/new-membership.service';

function mockGetMembers(): TypedEntityCollectionData<any> {
  return {totalCount: 0, Data: []};
}

describe('GroupMembersComponent', () => {
  let component: GroupMembersComponent;
  let fixture: ComponentFixture<GroupMembersComponent>;

  let onShelfSidesheetClose = () => ({DataValue:'id', DisplayValue: 'display'});


  TsbTestBed.configureTestingModule({
    declarations: [GroupMembersComponent],
    providers: [
      {
        provide: GroupsService,
        useValue: {
          getGroupDirectMembers: jasmine.createSpy('getGroupDirectMembers').and.returnValue(Promise.resolve(mockGetMembers())),
          getGroupNestedMembers: jasmine.createSpy('getGroupNestedMembers').and.returnValue(Promise.resolve(mockGetMembers())),
          UnsGroupDirectMembersSchema: {
            Columns: {
              UID_Person: { ColumnName: 'UID_Person' },
              UID_UNSAccount: { ColumnName: 'UID_UNSAccount' },
              XDateInserted: { ColumnName: 'XDateInserted' },
              OrderState: { ColumnName: 'OrderState' },
              ValidUntil: { ColumnName: 'ValidUntil' },
              XMarkedForDeletion: { ColumnName: 'XMarkedForDeletion' },
            }
          },
          UnsGroupNestedMembersSchema: {
            Columns: {
              UID_Person: { ColumnName: 'UID_Person' },
              UID_UNSGroupChild: { ColumnName: 'UID_UNSGroupChild' },
              XMarkedForDeletion: { ColumnName: 'XMarkedForDeletion' },
            }
          }
        }
      },
      {
        provide: NewMembershipService,
        useValue: {
          requestGroupMembership: jasmine.createSpy('requestGroupMembership').and.returnValue(Promise.resolve())
        }
      },
      {
        provide: EuiSidesheetService,
        useValue: {
          open: jasmine.createSpy('open').and.returnValue({
            afterClosed: () => of(onShelfSidesheetClose())
          })
        }
      }
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should intialise the component correctly', async () => {
    const navigateSpy = spyOn<any>(component, 'navigateDirect').and.returnValue(Promise.resolve({}));
    component.unsGroupDbObjectKey = { Keys: [], TableName: '' };
    await component.ngOnInit();
    expect(component['displayedColumns'].length).toEqual(8);
    expect(component['nestedDisplayColumns'].length).toEqual(4);
    expect(navigateSpy).toHaveBeenCalled();
  });

  describe('isMobile get tests', () => {
    it('should return false when the documents body offsetWidth is greater than 768', () => {
      spyOnProperty(document.body, 'offsetWidth').and.returnValue(1080);
      expect(component.isMobile).toEqual(false);
    });

    it('should return true when the documents body offsetWidth is less than or equal to 768', () => {
      spyOnProperty(document.body, 'offsetWidth').and.returnValue(480);
      expect(component.isMobile).toEqual(true);
    });
  });
});
