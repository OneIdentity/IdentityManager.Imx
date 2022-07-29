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

import { Component, ViewChild, Input } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from 'ng-bullet';
import { TranslateModule } from '@ngx-translate/core';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { EuiLoadingService } from '@elemental-ui/core';

import { EntitlementEditComponent } from './entitlement-edit.component';
import { DisableControlModule, clearStylesFromDOM } from 'qbm';
import { ServiceItemTagsService } from 'qer';

@Component({
  selector: 'imx-service-item-tags',
  template: '<p>MockServiceItemTagsComponent</p>'
})
class MockServiceItemTagsComponent {
  @Input() public selected: any;
}

@Component({
  selector: 'imx-entity-column-editor',
  template: '<p>MockEntityColumnEditorComponent</p>'
})
class MockEntityColumnEditorComponent {
  @Input() column: any;
}

@Component({
  template: `
  <imx-entitlement-edit
    [entitlement]="entitlement"
    [serviceItem]="serviceItem"
    >
  </imx-entitlement-edit>
  `
})
class TestHostComponent {
  @ViewChild(EntitlementEditComponent, { static: true }) readonly component: EntitlementEditComponent;
  readonly entitlement = {
    Ident_AOBEntitlement: TestHostComponent.createProperty('id'),
    Description: TestHostComponent.createProperty('desc'),
    UID_AERoleOwner: TestHostComponent.createProperty(),
    UID_AccProduct: TestHostComponent.createProperty(),
    ObjectKeyAdditionalApprover: TestHostComponent.createProperty(),
    GetEntity: () => ({ Commit: _ => { this.commitCalledEntitlement = true; } })
  };
  readonly serviceItem = {
    UID_OrgRuler: TestHostComponent.createProperty(),
    UID_PWODecisionMethod: TestHostComponent.createProperty(),
    UID_QERTermsOfUse: TestHostComponent.createProperty(),
    UID_AccProductParamCategory: TestHostComponent.createProperty(),
    ProductURL: TestHostComponent.createProperty('url'),
    IsApproveRequiresMfa: TestHostComponent.createProperty(true),
    GetEntity: () => ({ Commit: _ => { this.commitCalledServiceItem = true; } })
  };

  private commitCalledEntitlement = false;
  private commitCalledServiceItem = false;

  reset(): void {
    this.commitCalledEntitlement = this.commitCalledServiceItem = false;
  }

  verify(): boolean {
    return this.commitCalledEntitlement && this.commitCalledServiceItem;
  }

  private static createProperty<T>(value?: T): any {
    return {
      value,
      Column: { GetDisplayValue: () => undefined },
      GetMetadata: () => ({
        CanEdit: () => undefined,
        GetDisplay: () => undefined,
        GetMaxLength: () => undefined,
        GetFkRelations: () => [{
          Get: () => ({
            Entities: [{ Columns: { XObjectKey: {} } }]
          })
        }]
      })
    }
  }
}

describe('EntitlementEditComponent', () => {
  let component: EntitlementEditComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        EntitlementEditComponent,
        MockEntityColumnEditorComponent,
        MockServiceItemTagsComponent,
        TestHostComponent
      ],
      imports: [
        DisableControlModule,
        FormsModule,
        LoggerTestingModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ServiceItemTagsService,
          useValue: {
            getTags: jasmine.createSpy('getTags').and.returnValue(Promise.resolve({ TotalCount: 0, Data: [] })),
            updateTags: jasmine.createSpy('updateTags')
          }
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.reset();
    component = fixture.componentInstance.component;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // TODO #227277 fix unittests after update on Angular V9
  xit('should update the form on changes', fakeAsync(() => {
    fixture.detectChanges();

    tick();

    expect(component.form.get('name').value).toEqual(fixture.componentInstance.entitlement.Ident_AOBEntitlement.value);
    expect(component.form.get('description').value).toEqual(fixture.componentInstance.entitlement.Description.value);

    expect(component.form.get('ownerServiceItem').value).toBeDefined();
  }));

  // TODO #227277 fix unittests after update on Angular V9
  xit('should save the entitlement', fakeAsync(() => {
    // Arrange
    fixture.detectChanges();

    tick();

    component.form.markAsDirty();

    // Act
    component.save();

    tick();

    // Assert
    expect(fixture.componentInstance.verify()).toBeTruthy();
    expect(component.form.dirty).toBeFalsy();
  }));
});
