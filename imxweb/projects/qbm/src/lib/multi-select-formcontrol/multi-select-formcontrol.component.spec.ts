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

import { ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiCoreModule, EuiLoadingService } from '@elemental-ui/core';
import { IEntityColumn } from 'imx-qbm-dbts';
import { configureTestSuite } from 'ng-bullet';
import { MultiValueService } from '../multi-value/multi-value.service';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

import { MultiSelectFormcontrolComponent } from './multi-select-formcontrol.component';

describe('MultiSelectFormcontrolComponent', () => {
  let component: MultiSelectFormcontrolComponent;
  let fixture: ComponentFixture<MultiSelectFormcontrolComponent>;

  let multiVlaue = '';
  const mockMultiValueProvider = {
    getMultiValue: jasmine.createSpy('getMultiValue').and.callFake(() => Promise.resolve(multiVlaue))
  }

  const mockDetector = {
    detectChanges: jasmine.createSpy('detectChanges')
  }

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        EuiCoreModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        NoopAnimationsModule,
        ScrollingModule,
        MatListModule
      ],
      declarations: [MultiSelectFormcontrolComponent],
      providers: [
        {
          provide: MultiValueService,
          useValue: mockMultiValueProvider
        },
        {
          provide: ChangeDetectorRef,
          useValue: mockDetector
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        }
      ]
    })
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiSelectFormcontrolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('writes a value', () => {
    const dataSpy = jasmine.createSpy('Get').and.returnValue(Promise.resolve({ TotalCount: 0, Entities: [] }));
    const columnForTest = {
      GetMetadata: () => ({
        GetFkRelations: () => [{
          Get: dataSpy
        }]
      })
    } as unknown as IEntityColumn;

    component.writeValue(columnForTest);
    expect(component.entityColumn).toEqual(columnForTest);
    expect(dataSpy).toHaveBeenCalled();
  });

  it('registers an onChange method', () => {
    let col: IEntityColumn;
    component.registerOnChange((ecol: IEntityColumn) => col = ecol);

    const columnForTest = {} as IEntityColumn;
    component.onChange(columnForTest);
    expect(col).toEqual(columnForTest);
  });


  it('registers an onTouch method', () => {
    let col: IEntityColumn;
    component.registerOnTouched((ecol: IEntityColumn) => col = ecol);

    const columnForTest = {} as IEntityColumn;
    component.onTouch(columnForTest);
    expect(col).toEqual(columnForTest);
  });


  it('can handle changes', async () => {

    const dataSpy = jasmine.createSpy('Get').and.returnValue(Promise.resolve({ TotalCount: 0, Entities: [] }));
    component.entityColumn = {
      GetMetadata: () => ({
        GetFkRelations: () => [{
          Get: dataSpy
        }],
        GetDisplay: () => ''
      })
    } as unknown as IEntityColumn;

    await component.ngOnChanges();

    expect(dataSpy).toHaveBeenCalled();

  });


  for (const testcase of [true, false]) {
    it(`updates its selection ${testcase ? 'with' : 'without'} put`, async () => {
      component.registerOnChange(() => { });

      const spy = jasmine.createSpy('PutValue');
      component.selectedCandidates = [];
      component.entityColumn = {
        PutValue: spy
      } as unknown as IEntityColumn;

      component.pushMethod = testcase ? 'auto' : 'manual';

      await component.updateSelected({
        option: {
          value: {
            GetEntity: () => ({
              GetKeys: () => ['uid']
            }),
            Keys: ['uid']
          }
        }, source: null
      } as MatSelectionListChange);

      expect(component.selectedCandidates.length).toEqual(1);

      if (testcase) {
        expect(spy).toHaveBeenCalled();
      } else {
        expect(spy).not.toHaveBeenCalled();
      }

    });
  }

  for (const testcase of [true, false]) {
    it(`updates its selection ${testcase ? 'with' : 'without'} selected element`, async () => {
      component.registerOnChange(() => { });

      const spy = jasmine.createSpy('PutValue');
      component.entityColumn = {
        PutValue: spy
      } as unknown as IEntityColumn;

      component.pushMethod = 'auto';
      component.selectedCandidates = testcase ? [{
        Keys: ['uid']
      }] : [];

      await component.updateSelected({
        option: {
          value: {
            GetEntity: () => ({
              GetKeys: () => ['uid']
            }),
            Keys: ['uid']
          }
        }, source: null
      } as MatSelectionListChange);

      if (!testcase) {
        expect(spy).toHaveBeenCalled();
      } else {
        expect(spy).not.toHaveBeenCalled();
      }

    });

    it('can push value manually', async () => {
      component.registerOnChange(() => { });
      const spy = jasmine.createSpy('PutValue');
      component.entityColumn = {
        PutValue: spy
      } as unknown as IEntityColumn;

      await component.pushValue();
      expect(spy).toHaveBeenCalled();
    });

    it('updates value changes', fakeAsync(() => {

      component.ngOnChanges();
      component.searchControl.setValue('sometest');
      expect(component.candidates).toEqual([]);

      const dataSpy = jasmine.createSpy('Get').and.returnValue(Promise.resolve({ TotalCount: 0, Entities: [] }));
      component.entityColumn = {
        GetMetadata: () => ({
          GetFkRelations: () => [{
            Get: dataSpy
          }],
          GetDisplay: () => ''
        })
      } as unknown as IEntityColumn;

      component.searchControl.setValue('sometest');

      tick(1000);

      expect(dataSpy).toHaveBeenCalledWith({ StartIndex: 0, PageSize: 20, search: 'sometest' });
    }))
  }

  it('has a valid life cycle', async () => {
    await component.ngOnChanges();
    await component.ngAfterViewInit();
    return component.ngOnDestroy();
  });


  for (const testcase of [true, false]) {
    it(`removes all elements ${testcase ? 'with' : 'without'} put`, async () => {

      component.selectedCandidates = [
        { Display: 'candidate1' },
        { Display: 'candidate2' },
        { Display: 'candidate3' }
      ];
      component.registerOnChange(() => { });
      const spy = jasmine.createSpy('PutValue');
      component.entityColumn = {
        PutValue: spy
      } as unknown as IEntityColumn;
      component.pushMethod = testcase ? 'auto' : 'manual';

      await component.clearSelection();

      expect(component.selectedCandidates.length).toEqual(0);
      if (testcase) {
        expect(spy).toHaveBeenCalled();
      } else {
        expect(spy).not.toHaveBeenCalled();
      }
    });
  }

  for (const testcase of [true, false]) {
    it(`removes an element ${testcase ? 'with' : 'without'} put`, async () => {

      component.selectedCandidates = [
        { Display: 'candidate1', Keys: ['c1'] },
        { Display: 'candidate2', Keys: ['c2'] },
        { Display: 'candidate3', Keys: ['c3'] }
      ];
      component.registerOnChange(() => { });
      const spy = jasmine.createSpy('PutValue');
      component.entityColumn = {
        PutValue: spy
      } as unknown as IEntityColumn;
      component.pushMethod = testcase ? 'auto' : 'manual';

      await component.removeSelectedAtIndex(1);

      expect(component.selectedCandidates.length).toEqual(2);
      expect(component.selectedCandidates).toEqual([
        { Display: 'candidate1', Keys: ['c1'] },
        { Display: 'candidate3', Keys: ['c3'] }
      ]);
      if (testcase) {
        expect(spy).toHaveBeenCalled();
      } else {
        expect(spy).not.toHaveBeenCalled();
      }
    });
  }

  /*
  it('', () => { });
  it('', async () => { });
  it('', fakeAsync(()=>{}))
  for (const testcase of []) {
    it('', () => { });
  }
  for (const testcase of []) {
    it('', async() => { });
  }
  for (const testcase of []) {
    it('', fakeAsync(()=>{}))
  }
  */

});
