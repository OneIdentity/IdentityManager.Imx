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
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiCoreModule, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { PortalServicecategories } from 'imx-api-qer';
import { clearStylesFromDOM, ConfirmationService } from 'qbm';
import { ServiceCategoryComponent } from './service-category.component';
import { ServiceCategoryChangedType } from './service-category-changed.enum';

@Component({
  selector: 'imx-cdr-editor',
  template: '<p>MockCdrEditorComponent</p>',
})
class MockCdrEditorComponent {
  @Input() cdr: any;
}

@Component({
  selector: 'imx-service-item-select',
  template: '<p>MockServiceItemSelect</p>',
})
class MockServiceItemSelect {
  @Input() display: any;
  @Input() selected: any;
  @Input() data: any;
}

function createServiceCategory(serviceCategoryTestdata = { keys: undefined, values: undefined }) {
  return {
    UID_AccProductGroupParent: createProperty('UID_AccProductGroupParent'),
    UID_AccProductGroup: createProperty('UID_AccProductGroup'),
    UID_AccProductParamCategory: createProperty(),
    UID_OrgAttestator: createProperty(),
    UID_OrgRuler: createProperty(),
    UID_PWODecisionMethod: createProperty(),
    Description: createProperty(),
    SortOrder: createProperty(),
    Ident_AccProductGroup: createProperty(),
    HasChildren: createProperty(serviceCategoryTestdata.values['HasChildren']),
    JPegPhoto: createProperty(),
    GetEntity: () => ({
      GetKeys: () => serviceCategoryTestdata.keys,
      GetDisplay: () => undefined,
      GetDisplayLong: () => undefined,
      Commit: (_) => { },
      DiscardChanges:  (_) => { }
    }),
  } as PortalServicecategories;
}

function createProperty<T>(value?: T): any {
  return {
    value,
    Column: { GetDisplayValue: () => value + '(display)' },
    GetMetadata: () => ({
      CanEdit: () => undefined,
      GetDisplay: () => undefined,
      GetMaxLength: () => undefined,
      GetFkRelations: () => [
        {
          Get: () => ({ Entities: [] }),
        },
      ],
    }),
  };
}

const serviceCategoryTestdata = new class {
  values;
  keys = [];

  constructor() {
    this.init();
  }

  init() {
    this.values = {};
    this.keys = [];
  }
}();

describe('ServiceCategoryComponent', () => {
  let confirm = true;
  const mockConfirmationService = {
    confirm: jasmine.createSpy('confirm')
      .and.callFake(() => Promise.resolve(confirm))
  }

  const sidesheetData = new class {
    editMode = false;
    serviceCategory = createServiceCategory(serviceCategoryTestdata);
    serviceItemData = {};
    hasAccproductparamcategoryCandidates = true;
  }();

  const sidesheetRef = {
    closeClicked: () => new Subject(),
    close: jasmine.createSpy('close')
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        MockCdrEditorComponent,
        MockServiceItemSelect,
        ServiceCategoryComponent
      ],
      imports: [
        EuiCoreModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({})
      ],
      providers: [
        {
          provide: ConfirmationService,
          useValue: mockConfirmationService
        },
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: sidesheetData
        },
        {
          provide: EuiSidesheetRef,
          useValue: sidesheetRef
        }
      ]
    });
  });

  beforeEach(() => {
    sidesheetRef.close.calls.reset();
    serviceCategoryTestdata.init();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    const component = TestBed.createComponent(ServiceCategoryComponent).componentInstance;
    expect(component).toBeDefined();
  });

  for (const testcase of [
    { editMode: true, keys: ['012-'], expected: false },
    { editMode: true, keys: ['012x'], expected: true },
    { editMode: true, keys: ['012'], expected: true },
    { editMode: true, keys: ['CCC-'], expected: true },
    { editMode: true, hasServiceItems: true, keys: ['CCC-'], expected: false },
    { editMode: true, hasChildren: true, keys: ['CCC-'], expected: false },
    { keys: ['CCC-'], expected: false }
  ]) {
    it('should check if user can delete', async () => {
      sidesheetData.serviceCategory = createServiceCategory({
        keys: testcase.keys,
        values: { HasChildren: testcase.hasChildren }
      });
      sidesheetData.editMode = testcase.editMode || false;
      sidesheetData.serviceItemData = {
        selected: testcase.hasServiceItems ? [{} as any] : undefined
      };

      const component = TestBed.createComponent(ServiceCategoryComponent).componentInstance;

      expect(component.canDelete).toEqual(testcase.expected);
    });
  }

  for (const testcase of [
    { description: '', confirm: true },
    { description: 'not', confirm: false },
  ]) {
    it(`should ${testcase.description} close the sidesheet with type delete because the user ${testcase.confirm ? 'confirmed' : 'cancelled'} the deletion`, async () => {
      const component = TestBed.createComponent(ServiceCategoryComponent).componentInstance;

      serviceCategoryTestdata.keys = ['uid'];

      confirm = testcase.confirm;

      await component.delete();

      if (testcase.confirm) {
        expect(sidesheetRef.close).toHaveBeenCalledWith(ServiceCategoryChangedType.Delete);
      } else {
        expect(sidesheetRef.close).not.toHaveBeenCalled();
      }
    });
  }
});
