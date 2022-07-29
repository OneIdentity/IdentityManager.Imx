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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IEntity, TypedEntity } from 'imx-qbm-dbts';
import { RequestsEntitySelectorComponent } from './requests-entity-selector.component';
import { RequestsConfigurationTestBed } from '../test/requests-configuration-test-bed';
import { RequestsConfigurationCommonMocks } from '../test/requests-configuration-mocks';

function getMockEntity(entity: IEntity) {
  return { GetEntity: () => entity };
}

describe('RequestsEntitySelectorComponent', () => {
  let component: RequestsEntitySelectorComponent;
  let fixture: ComponentFixture<RequestsEntitySelectorComponent>;

  const mockSelectedEntities: TypedEntity[] = [
    getMockEntity({ GetKeys: () => ['test-item-1'] } as IEntity),
    getMockEntity({ GetKeys: () => ['test-item-2'] } as IEntity),
  ] as TypedEntity[];

  RequestsConfigurationTestBed.configureTestingModule({
    declarations: [ RequestsEntitySelectorComponent ],
    imports: [],
    providers: [
      {
        provide: MatDialogRef,
        useValue: { close: () => {} },
      },
      {
        provide: MAT_DIALOG_DATA,
        useValue: {
          get: (params) =>  Promise.resolve([]),
          isMultiValue: true
        },
      },
    ]
  });;

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestsEntitySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selectionChanged() tests', () => {
    it('should assign the supplied items as selected', () => {
      const mockItems = [
        {  GetEntity: () => RequestsConfigurationCommonMocks.mockEntity },
        {  GetEntity: () => RequestsConfigurationCommonMocks.mockEntity }
      ] as TypedEntity[];
      component.selectedItems = undefined;
      component.selectionChanged(mockItems);
      expect(component.selectedItems).toEqual(mockItems);
    });
  });

  describe('applySelection() tests', () => {
    let dialogRefCloseSpy: jasmine.Spy;
    beforeEach(() => {
      dialogRefCloseSpy = spyOn(component.dialogRef, 'close');
    });
    describe('when called with an entity' , () => {
      it(`it should set the 'selectedItems' to just the item supplied and
      return a stirng array consisting of just the key for that one item `, () => {
        component.selectedItems = undefined;
        const expectedValues = ['test-item-1'];
        component.applySelection(mockSelectedEntities[0]);
        expect(dialogRefCloseSpy).toHaveBeenCalledWith(expectedValues)
      });
    });
    describe('when called without an entity' , () => {
      it(`it should process the 'selectedItems' and
      return a string array of all the keys of the items selected`, () => {
        component.selectedItems = mockSelectedEntities;
        const expectedValues = ['test-item-1', 'test-item-2'];
        component.applySelection();
        expect(dialogRefCloseSpy).toHaveBeenCalledWith(expectedValues);
      });
    });
  });
});
