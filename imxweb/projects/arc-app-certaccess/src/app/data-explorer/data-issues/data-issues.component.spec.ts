import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { IdentitiesWorkflowComponent } from './identities-workflow/identities-workflow.component';
import { DataIssuesService } from './data-issues.service';
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
import { ArcGovernanceTestBed } from 'projects/arc-app-certaccess/src/test/arc-governance-test-bed';
import { DataIssuesComponent } from './data-issues.component';
import { UserModelService } from 'qer';

describe('DataIssuesComponent', () => {
  let component: DataIssuesComponent;
  let fixture: ComponentFixture<DataIssuesComponent>;

  ArcGovernanceTestBed.configureTestingModule({
    declarations: [DataIssuesComponent, IdentitiesWorkflowComponent],
    providers: [DataIssuesService,UserModelService],
    imports: [NoopAnimationsModule],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('fixIdentities() should open a modal for identities workflow', () => {
    const dialog = TestBed.inject(MatDialog);
    const dialogOpenSpy = spyOn(dialog, 'open').and.callThrough();

    component.fixIdentities();

    expect(dialogOpenSpy).toHaveBeenCalledWith(IdentitiesWorkflowComponent, {
      width: '600px',
    });
  });

  it('viewIdentities() should redirect to data explorer identities page with issues filter', () => {
    const router = TestBed.inject(Router);
    const routerNavigateSpy = spyOn(router, 'navigate');

    component.viewIdentities();

    expect(routerNavigateSpy).toHaveBeenCalledWith(['data/explorer/identities/issues']);
  });

  it('fixAccounts() should redirect to data explorer accounts page with issues filter', () => {
    const router = TestBed.inject(Router);
    const routerNavigateSpy = spyOn(router, 'navigate');

    component.fixAccounts();

    expect(routerNavigateSpy).toHaveBeenCalledWith(['data/explorer/accounts/issues']);
  });

  it('fixAccountsManager() should redirect to data explorer accounts page with manager issues filter', () => {
    const router = TestBed.inject(Router);
    const routerNavigateSpy = spyOn(router, 'navigate');

    component.fixAccountsManager();

    expect(routerNavigateSpy).toHaveBeenCalledWith(['data/explorer/accounts/issues/manager']);
  });

  it('fixGroups() should redirect to data explorer groups page with issues filter', () => {
    const router = TestBed.inject(Router);
    const routerNavigateSpy = spyOn(router, 'navigate');

    component.fixGroups();

    expect(routerNavigateSpy).toHaveBeenCalledWith(['data/explorer/groups/issues']);
  });
});
