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

import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'ng-bullet';
import { Subject } from 'rxjs';

import { clearStylesFromDOM, ConfirmationService } from 'qbm';
import { ApplicationCreateComponent } from './application-create.component';

@Component({
  selector: 'imx-application-image-select',
  template: '<p>MockAppImageSelect</p>'
})
class MockAppImageSelect {
  @Input() column: any;
}

@Component({
  selector: 'imx-cdr-editor',
  template: '<p>MockCdrEditorComponent</p>'
})
class MockCdrEditorComponent {
  @Input() cdr: any;
}

describe('ApplicationCreateComponent', () => {
  let component: ApplicationCreateComponent;
  let fixture: ComponentFixture<ApplicationCreateComponent>;

  const sidesheetData = {
    application: {
      JPegPhoto: {},
      Ident_AOBApplication: {},
      Description: {},
      UID_AccProductGroup: {},
      UID_PersonHead: {},
      UID_AERoleOwner: {}
    }
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ApplicationCreateComponent,
        MockAppImageSelect,
        MockCdrEditorComponent
      ],
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: sidesheetData
        },
        {
          provide: EuiSidesheetRef,
          useValue: {
            closeClicked: () => new Subject(),
            close: __ => {}
          }
        },
        {
          provide: ConfirmationService,
          useValue: {}
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * const mockAobApplicationNew = new PortalApplicationNew(new ReadWriteEntity(PortalApplicationNew.GetEntitySchema(), { Columns: {} }, new FkCandidateProvider(mockFkProviderItems)));
   * 
   * 
   *   [
    new PortalApplicationNew(createEntity()),
    new PortalApplication(createEntity())
  ].forEach(mockApp =>
  it('submits AobApplicationNew', async () => {
    const commitSpy = spyOn(mockApp.GetEntity(), 'Commit');

    let application: TypedEntity;
    const subscription = component.changesSubmitted.subscribe(a => application = a);

    component.application = component.aobApplicationNew = mockApp;

    await component.update();

    component.applicationForm.markAsDirty();

    expect(component.applicationForm.dirty).toBeTruthy();

    await component.submitData();

    expect(commitSpy).toHaveBeenCalledTimes(1);
    expect(component.applicationForm.dirty).toBeFalsy();
    expect(application).toBeDefined();

    expect(euiLoadingServiceStub.show).toHaveBeenCalled();
    expect(snackBarServiceStub.open).toHaveBeenCalled();

    subscription.unsubscribe();
  }));
   */
});
