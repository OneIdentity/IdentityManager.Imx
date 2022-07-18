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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EuiCoreModule, EuiSidesheetRef, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { IForeignKeyInfo, TypedEntity } from 'imx-qbm-dbts';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM } from 'qbm';
import { TypedEntitySelectorComponent } from './typed-entity-selector.component';

@Component({
  selector: 'imx-fk-candidates',
  template: '<p>MockServiceItemSelect</p>',
})
class MockFkCandidates {
  @Input() data: any;
  @Input() selectedFkTable: any;
  @Input() showLongdisplay: any;
  @Input() showSelectedItemsMenu: any;
}

@Component({
  selector: 'imx-fk-table-select',
  template: '<p>MockFkTableSelectComponent</p>',
})
class MockFkTableSelectComponent {
  @Input() fkTables: any;
  @Input() preselectedTableName: any;
}

describe('TypedEntitySelectorComponent', () => {
  let component: TypedEntitySelectorComponent;
  let fixture: ComponentFixture<TypedEntitySelectorComponent>;

  const sidesheetData = new class {
    readonly tableName = 'some table name';
    readonly fkTables = [{ TableName: 'some table name' } as IForeignKeyInfo];
    readonly preselectedEntities = [{ }];
  }();

  const sidesheetRef = {
    close: jasmine.createSpy('close')
  };

  const sidesheetService = new class {
    readonly open = jasmine.createSpy('open')
  }();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        TypedEntitySelectorComponent,
        MockFkCandidates,
        MockFkTableSelectComponent
      ],
      imports: [
        EuiCoreModule
      ],
      providers: [
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: sidesheetData
        },
        {
          provide: EuiSidesheetRef,
          useValue: sidesheetRef
        },
        {
          provide: EuiSidesheetService,
          useValue: sidesheetService
        }
      ]
    });
  });

  beforeEach(() => {
    sidesheetRef.close.calls.reset();

    fixture = TestBed.createComponent(TypedEntitySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component.fkRelationData).toBeDefined();

    expect(component.selectedItems.length).toEqual(sidesheetData.preselectedEntities.length);

    expect(component.selectedFkTable.TableName).toEqual(sidesheetData.tableName);
  });

  it('selection changed', () => {
    component.selectedItems = undefined;

    const items = [{} as TypedEntity];

    component.selectionChanged(items);

    expect(component.selectedItems).toEqual(items);
  });

  it('applies the provided item by setting the selected items and closing the sidesheet', () => {
    component.selectedItems = undefined;

    const item = {} as TypedEntity;

    component.applySelection(item);

    expect(component.selectedItems).toEqual([item]);

    expect(sidesheetRef.close).toHaveBeenCalledWith([item]);
  });

  it('updates the selected table variable', () => {
    component.selectedFkTable = undefined;

    component.tableSelectionChanged(sidesheetData.tableName);

    expect(component.selectedFkTable.TableName).toEqual(sidesheetData.tableName);
  });
});
