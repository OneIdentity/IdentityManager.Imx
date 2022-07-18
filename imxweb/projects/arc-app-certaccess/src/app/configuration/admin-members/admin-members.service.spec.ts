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

import { TestBed } from '@angular/core/testing';
import { EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { PortalAdminApplicationroleMembers } from 'imx-api-qer';
import { AdminMembersService } from './admin-members.service';
import { ArcApiService } from '../../services/arc-api-client.service';


describe('AdminMembersService', () => {
  let service: AdminMembersService;

  const roleMembersStub = new class {
    groups = {};

    readonly Get = (uidAeRole, parameters) =>
      Promise.resolve({ Data: this.groups[uidAeRole]?.filter(uid => uid === parameters?.filter?.[0].Value1)});

    readonly Post = jasmine.createSpy('Post');

    readonly createEntity = () => {
      return {
        UID_Person: { Column: { PutValue: _value => Promise.resolve() } }
      };
    }
  }();

  const membersDeleteSpy = jasmine.createSpy('delete');

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminMembersService,
        {
          provide: ArcApiService,
          useValue: {
            typedClient: {
              PortalAdminApplicationroleMembers: roleMembersStub
            },
            client: {
              portal_admin_applicationrole_members_delete: membersDeleteSpy
            }
          }
        },
        {
          provide: EuiLoadingService,
          useValue: {
            show: __ => {},
            hide: __ => {}
          }
        }
      ]
    });
    service = TestBed.inject(AdminMembersService);

    roleMembersStub.groups = {};
    roleMembersStub.Post.calls.reset();
    membersDeleteSpy.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('checks if the currently logged on user is member of the group with a certain id', async () => {
    const uidAeRole = 'some group id';
    const UserUid = 'some user id';

    roleMembersStub.groups[uidAeRole] = [UserUid];

    expect(await service.userIsMember(uidAeRole, { IsLoggedIn: true, UserUid })).toEqual(true);
    expect(await service.userIsMember(uidAeRole, { IsLoggedIn: true, UserUid: 'some other user id' })).toEqual(false);
  });

  it('adds', async () => {
    const membersToAdd = ['person1', 'person2'];

    await service.add('some group id', membersToAdd);

    expect(roleMembersStub.Post).toHaveBeenCalledTimes(membersToAdd.length);
  });

  it('deletes', async () => {
    const membersToDelete = [{ UID_Person: {} }, { UID_Person: {} }] as PortalAdminApplicationroleMembers[];

    await service.delete('some group id', membersToDelete);

    expect(membersDeleteSpy).toHaveBeenCalledTimes(membersToDelete.length);
  });
});
