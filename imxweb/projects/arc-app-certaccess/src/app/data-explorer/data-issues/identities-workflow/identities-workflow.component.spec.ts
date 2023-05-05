import { Resolve } from '@angular/router';
import { fakeAsync, flush } from '@angular/core/testing';
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
 * Copyright 2021 One Identity LLC.
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

import { ArcGovernanceTestBed } from 'projects/arc-app-certaccess/src/test/arc-governance-test-bed';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentitiesWorkflowComponent } from './identities-workflow.component';
import { MatDialogRef } from '@angular/material/dialog';
import { DataIssuesService } from '../data-issues.service';

describe('IdentitiesWorkflowComponent', () => {
  let component: IdentitiesWorkflowComponent;
  let fixture: ComponentFixture<IdentitiesWorkflowComponent>;

  const workflowSpy = jasmine.createSpy('startIdentitiesManagerWorkflow').and.returnValue(Promise.resolve());  
  const closeSpy = jasmine.createSpy('close');

  ArcGovernanceTestBed.configureTestingModule({
    declarations: [IdentitiesWorkflowComponent],
    providers: [
      {
        provide: MatDialogRef,
        useValue: { close: closeSpy },
      },
      {
        provide: DataIssuesService,
        useValue: { startIdentitiesManagerWorkflow: workflowSpy },
      },
    ],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentitiesWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('start() should start identities manager workflow and then close modal', fakeAsync(() => {
    component.start();

    flush();

    expect(workflowSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  }));
});
