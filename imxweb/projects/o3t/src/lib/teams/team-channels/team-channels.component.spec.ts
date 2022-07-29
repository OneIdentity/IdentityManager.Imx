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
import { CollectionLoadParameters } from 'imx-qbm-dbts';
import { O3tCommonTestData } from 'projects/o3t/src/test/o3t-common-test-mocks';
import { O3tTestBed } from 'projects/o3t/src/test/o3t-test-bed';
import { TeamsService } from '../teams.service';
import { TeamChannelsComponent } from './team-channels.component';

describe('TeamChannelsComponent', () => {
  let component: TeamChannelsComponent;
  let fixture: ComponentFixture<TeamChannelsComponent>;

  const navigationState: CollectionLoadParameters = { StartIndex: 1, PageSize: 25 };
  const keyword = 'test-channel';

  O3tTestBed.configureTestingModule({
    declarations: [ TeamChannelsComponent ],
    providers: [
      {
        provide: TeamsService,
        useValue: O3tCommonTestData.mockTeamsService,
      }
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamChannelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change navigation state', async () => {
    await component.onNavigationStateChanged(navigationState);
    expect(component.navigationState).toEqual(navigationState);
  });

  it('should search and reset start index ', async () => {
    await component.onSearch(keyword);
    expect(component.navigationState.StartIndex).toEqual(0);
  });

  it('should search for keyword ', async () => {
    await component.onSearch(keyword);
    expect(component.navigationState.search).toEqual(keyword);
  });
});
