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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { PortalTargetsystemTeams } from 'imx-api-o3t';
import { O3tCommonTestData } from 'projects/o3t/src/test/o3t-common-test-mocks';
import { O3tTestBed } from 'projects/o3t/src/test/o3t-test-bed';
import { GroupsService } from 'tsb';
import { TeamsService } from '../teams.service';
import { TeamDetailsComponent } from './team-details.component';

describe('TeamDetailsComponent', () => {
  let component: TeamDetailsComponent;
  let fixture: ComponentFixture<TeamDetailsComponent>;

  O3tTestBed.configureTestingModule({
    declarations: [ TeamDetailsComponent ],
    imports: [
      FormsModule,
      ReactiveFormsModule,
      NoopAnimationsModule
    ],
    providers: [
      {
        provide: EUI_SIDESHEET_DATA,
        useValue: O3tCommonTestData.mockTeam
      },
      {
        provide: TeamsService,
        useValue: O3tCommonTestData.mockTeamsService
      },
      {
        provide: GroupsService,
        useValue: {
          getGroupDetails: jasmine.createSpy('getGroupDetails').and.returnValue(Promise.resolve({})),
          getGroupServiceItem: jasmine.createSpy('getGroupServiceItem').and.returnValue(Promise.resolve({})),
        }
      }
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('saveGroup() tests', () => {
    it('should call saveChanges with the correct parameters', async () => {
      const snackBarOpenSpy = spyOn<any>(component['snackbar'], 'open');
      const commitSpy = spyOn(O3tCommonTestData.mockTeam.GetEntity(), 'Commit');
      await component.saveChanges();
      expect(snackBarOpenSpy).toHaveBeenCalledTimes(1);
      expect(commitSpy).toHaveBeenCalledWith(true);
    });
  });

  describe('cancel() tests', () => {
    it('should make a call to close the sidesheet', () => {
      const sidesheetCloseSpy = spyOn<any>(component['sidesheet'], 'close');
      component.cancel();
      expect(sidesheetCloseSpy).toHaveBeenCalledTimes(1);
    });
  });
});
