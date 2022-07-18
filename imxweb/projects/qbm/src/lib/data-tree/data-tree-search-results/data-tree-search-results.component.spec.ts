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

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatListModule, MatSelectionListChange } from "@angular/material/list";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSelectModule } from "@angular/material/select";
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from "ngx-logger/testing";
import { BehaviorSubject } from "rxjs";

import { CollectionLoadParameters, IEntity } from "imx-qbm-dbts";
import { clearStylesFromDOM } from 'qbm';
import { TreeDatabase } from "../tree-database";
import { TreeNodeResultParameter } from "../tree-node-result-parameter.interface";
import { DataTreeSearchResultsComponent } from "./data-tree-search-results.component";

class MockDataTreeService extends TreeDatabase {

  dataReloaded$ = new BehaviorSubject(undefined);
  constructor(private readonly entities: IEntity[]) {
    super();
  }

  public async getData(showLoading: boolean, parameter: CollectionLoadParameters = {})
    : Promise<TreeNodeResultParameter> {
      return {
        entities:
          this.entities.filter(elem => elem.GetDisplay() === parameter.search)
        , canLoadMore: false, totalCount: this.entities.length
      };
  }

}

describe('DataTreeSearchResultsComponent', () => {
  let component: DataTreeSearchResultsComponent;
  let fixture: ComponentFixture<DataTreeSearchResultsComponent>;
  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule,
        MatSelectModule,
        MatListModule,
        MatPaginatorModule
      ],
      declarations: [DataTreeSearchResultsComponent],
      providers: [

      ]
    });
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(DataTreeSearchResultsComponent);
    component = fixture.componentInstance;
  });


  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  for (const testcase of [
    { value: '', expectedLength: 0 }, // by default
    { value: 'dummy', expectedLength: 1 },
    { value: 'test', expectedLength: 0 }] // because not findable
  ) {
    it('reloads data', async () => {
      const data = new MockDataTreeService([
        { GetDisplay: () => 'dummy', GetKeys: () => ['k1'] } as IEntity,
        { GetDisplay: () => 'not a dummy', GetKeys: () => ['k2'] } as IEntity
      ]);
      component.database = data;
      component.navigationState= {StartIndex:0, search:testcase.value};
      await component.reload();

      expect(component.searchResults.length).toEqual(testcase.expectedLength);

    })
  }

  for (const testcase of [
    { selected: [{ GetKeys: () => ['element1'] }], isMulti: false, element: { GetKeys: () => ['element1'] }, expect: true },
    { selected: [{ GetKeys: () => ['element1'] }], isMulti: false, element: { GetKeys: () => ['element2'] }, expect: false },
    { selected: [{ GetKeys: () => ['element3'] }], isMulti: true, element: { GetKeys: () => ['element3'] }, expect: false },
  ]) {
    it(`checks if element ${testcase.element.GetKeys()[0]} is selected`, () => {
      component.selectedEntities = testcase.selected as IEntity[];
      component.withMultiSelect = testcase.isMulti;

      expect(component.isSelected(testcase.element as IEntity)).toEqual(testcase.expect);
    });
  }

  for (const testcase of [
    { selected: [], isMulti: true, element: { GetKeys: () => ['element2'] }, isSelected: true },
    { selected: [{ GetKeys: () => ['element3'] }], isMulti: true, element: { GetKeys: () => ['element3'] }, isSelected: false },
  ]) {
    it(`handles selection for element ${testcase.element.GetKeys()[0]}`, () => {
      component.selectedEntities = testcase.selected as IEntity[];
      component.withMultiSelect = testcase.isMulti;

      const eventArg = { source: undefined, options: [{ value: testcase.element, selected: testcase.isSelected } ]} as MatSelectionListChange;
      const methodSpy = testcase.isMulti ? spyOn(component.checkedNodesChanged, 'emit') : spyOn(component.nodeSelected, 'emit');

      component.onSelectionChanged(eventArg);


      if (testcase.isMulti) {
        expect(methodSpy).toHaveBeenCalled();
        if (testcase.isSelected) {
          expect(component.selectedEntities.length).toEqual(1);
        } else {
          expect(component.selectedEntities.length).toEqual(0);
        }
      } else {
        expect(methodSpy).toHaveBeenCalledWith(eventArg.options[0].value);
      }
    });
  }
});
