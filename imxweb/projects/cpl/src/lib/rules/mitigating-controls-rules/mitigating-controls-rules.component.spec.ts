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

import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { EuiLoadingService, EuiSidesheetRef } from '@elemental-ui/core';
import { MockBuilder, MockedComponentFixture, MockRender } from 'ng-mocks';
import { clearStylesFromDOM, ConfirmationService, SnackBarService,  } from 'qbm';

import { MitigatingControlsRulesComponent } from './mitigating-controls-rules.component';
import { MitigatingControlsRulesService } from './mitigating-controls-rules.service';
import { RulesMitigatingControls } from './rules-mitigating-controls';



describe('MitigatingControlsRulesComponent', () => {
  let component: MitigatingControlsRulesComponent;
  let fixture: MockedComponentFixture<any>;

  const mockedControl = {
    propertyInfo: [{}],
    GetEntity: () => ({
      GetKeys: () => [''],
      GetColumn: (column: string) => {
        return {GetValue: () => ''}
      }
    }),
    UID_ComplianceRule: {},
    UID_MitigatingControl: {},
    UID_NonCompliance: {},
  }

  beforeEach(() => {
    return MockBuilder([MitigatingControlsRulesComponent, UntypedFormBuilder, ChangeDetectorRef])
      .mock(MitigatingControlsRulesService, {
        createControl: jasmine.createSpy('createControl').and.returnValue(mockedControl),
        postControl: jasmine.createSpy('postControl').and.resolveTo({}),
        getControls: jasmine.createSpy('getControls').and.resolveTo({
          Data: [mockedControl]
        })
      })
      .mock(EuiLoadingService)
      .mock(SnackBarService)
      .mock(ConfirmationService)
      .beforeCompileComponents(testBed => {
        testBed.configureTestingModule({
          schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
      });
  });

  beforeEach(() => {
    fixture = MockRender(MitigatingControlsRulesComponent, {
      isMControlPerViolation: true,
      uidNonCompliance: '',
      uidCompliance: '',
      mControls: [],
      sidesheetRef: new EuiSidesheetRef(null)
    });
    component = fixture.point.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create two duplicates and not save', async () => {
    component.onCreateControl();
    component.onCreateControl();
    expect(component.mControls.length).toBe(2);

    await component.onSave();
    expect(fixture.point.injector.get(MitigatingControlsRulesService).postControl).not.toHaveBeenCalled();
  })

  it('should create a control, save, and then delete', async () => {
    component.onCreateControl();
    expect(component.mControls.length).toBe(1);

    // Force array to be dirty
    component.formArray.push(new UntypedFormControl());
    component.formArray.controls[0].markAsDirty();

    await component.onSave();
    expect(fixture.point.injector.get(MitigatingControlsRulesService).postControl).toHaveBeenCalled();

    await component.onDelete(mockedControl as RulesMitigatingControls, 0);
    expect(component.mControls.length).toBe(0);
  })
});
