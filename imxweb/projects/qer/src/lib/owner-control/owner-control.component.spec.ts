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

import { UntypedFormControl } from '@angular/forms';
import { MockBuilder, MockRender } from 'ng-mocks';

import { clearStylesFromDOM, CdrEditorComponent } from 'qbm';
import { OwnerCandidateOptions } from './owner.model';
import { OwnerControlComponent } from './owner-control.component';
import { OwnerControlModule } from './owner-control.module';
import { OwnerControlService } from './owner-control.service';

describe('OwnerControlComponent', () => {
  let component: OwnerControlComponent;

  beforeEach(() =>{
    return MockBuilder(OwnerControlComponent, OwnerControlModule)
    .mock(CdrEditorComponent)
    .mock(OwnerControlService);
  });

  beforeEach(()=>{
    component = MockRender(OwnerControlComponent).point.componentInstance;
  })

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should be created', () => {
    expect(component).toEqual(jasmine.any(OwnerControlComponent));
  });

  for (const testcase of [
    { options: OwnerCandidateOptions.people, createHandler: true },
    { options: OwnerCandidateOptions.people, createHandler: false },
    { options: OwnerCandidateOptions.roles, createHandler: true },
    { options: OwnerCandidateOptions.roles, createHandler: false },
  ]) {
    it('calls right editor', () => {
      const control = new UntypedFormControl('');
      component.onFormControlCreated(control, testcase.options, testcase.createHandler);

      expect(() => {
        component.onFormControlCreated(control, testcase.options, testcase.createHandler);
      }).not.toThrowError();
    });
  }
});
