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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiCoreModule, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { of } from 'rxjs';

import { TypedEntity } from 'imx-qbm-dbts';
import { clearStylesFromDOM } from '../../testing/clear-styles.spec';
import { TypedEntitySelectComponent } from './typed-entity-select.component';
import { TypedEntitySelectionData } from './typed-entity-selection-data.interface';

describe('TypedEntitySelectComponent', () => {
  let component: TypedEntitySelectComponent;
  let fixture: ComponentFixture<TypedEntitySelectComponent>;

  const sidesheetService = new class {
    selectedItems;
    readonly open = jasmine.createSpy('open').and.callFake(() => ({
      afterClosed: () => of(this.selectedItems)
    }))
  }();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        TypedEntitySelectComponent
      ],
      imports: [
        EuiCoreModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        NoopAnimationsModule,
        MatInputModule
      ],
      providers: [
        {
          provide: EuiSidesheetService,
          useValue: sidesheetService
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TypedEntitySelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', async () => {
    const data = {
      valueWrapper: {
        display: 'some display'
      },
      getInitialDisplay: () => 'some entity display',
      getSelected: () => Promise.resolve([{ GetEntity: () => ({ GetDisplay: () => 'some entity display' }) } as TypedEntity]),
    }as unknown as TypedEntitySelectionData;

    component.data = data;

    await component.ngOnInit();

    expect(component.control.value).toEqual('some entity display');
  });

  it('edits assigment and emits selection', async () => {
    // Arrange:
    const selectionChangedSpy = spyOn(component.selectionChanged, 'emit');

    sidesheetService.selectedItems = [{ GetEntity: () => ({ GetDisplay: () => 'some display' }) }];

    component.data = {
      title: 'some title',
      valueWrapper: {
        canEdit: true
      },
      getInitialDisplay: ()=>'',
      getSelected: () => Promise.resolve([{ GetEntity: () => ({ GetDisplay: () => 'some entity display' }) } as TypedEntity]),
    } as unknown as TypedEntitySelectionData;

    component.control.setValue(undefined, { emitEvent: false });

    // Act:
    await component.editAssignment();

    // Assert:
    expect(selectionChangedSpy).toHaveBeenCalledWith(sidesheetService.selectedItems);

    expect(component.control.value).toEqual('some display');
  });

  it('edits assigment and does not emit on cancel', async () => {
    // Arrange:
    const selectionChangedSpy = spyOn(component.selectionChanged, 'emit');

    sidesheetService.selectedItems = undefined; // simulates that user cancelled

    component.data = {
      title: 'some title',
      valueWrapper: {
        canEdit: true
      },
      getInitialDisplay: ()=>'',
      getSelected: () => Promise.resolve([{ GetEntity: () => ({ GetDisplay: () => 'some entity display' }) } as TypedEntity]),
    } as unknown as TypedEntitySelectionData;

    component.control.setValue('some display', { emitEvent: false });

    // Act:
    await component.editAssignment();

    // Assert:
    expect(selectionChangedSpy).not.toHaveBeenCalled();

    expect(component.control.value).toEqual('some display');
  });
});
