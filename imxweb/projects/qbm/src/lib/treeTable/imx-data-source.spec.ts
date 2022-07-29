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

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CdkTableModule } from '@angular/cdk/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from 'ng-bullet'
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { Subject } from 'rxjs';

import { ImxExpandableItem, ImxDataSource } from './imx-data-source';
import { Test } from './tableTestClasses.spec';
import { QbmModule } from '../qbm.module';;

describe('imx_DataSource', () => {
  let component: ImxDataSource<any>;
  const treeItems = ['x', 'y', 'z'];

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        QbmModule,
        NoopAnimationsModule,
        CdkTableModule
      ]
    });
  });

  beforeEach(() => {
    component = new Test(treeItems);
  });

  it('is defined correctly', () => {
    expect(component.childItemsProvider).toBeDefined();
    expect(component.itemsProvider).toBeDefined();
    expect(component.hasChildrenProvider).toBeDefined();
  });

  it('loads its items', fakeAsync(() => {
    component.LoadItems();
    tick();
    expect(component.data.length).toBe(treeItems.length);
    expect(component.expandableData.length).toBe(treeItems.length);
  }));

  it('loads and removes subitems', fakeAsync(() => {
    component.LoadItems();
    tick();
    component.SetRoot(component.data[0]);
    tick();
    component.LoadChildItems(component.expandableData[0], false);
    tick();
    expect(component.expandableData.length).toBe(treeItems.length);
    component.RemoveChildItems(component.expandableData[0]);
    tick();
    expect(component.expandableData.length).toBe(treeItems.length);
  }));

  it('buildRows', () => {
    const test = component.getRows(
      [Test.buildSingleObject('uidTest1'), Test.buildSingleObject('uidTest2'), Test.buildSingleObject('uidTest3')],
      null,
      0
    );
    expect(test.length).toBe(3);
    expect(test[0].data.Uid_Tree).toBe('uidTest1');
    expect(test[1].data.Uid_Tree).toBe('uidTest2');
    expect(test[2].data.Uid_Tree).toBe('uidTest3');
  });

  it('connects subject', fakeAsync(() => {
    component.LoadItems();
    tick();
    component.SetRoot(component.data[0]);
    tick();
    const realData = component.connect();

    realData.subscribe((elem: any) => {
      expect(elem.length).toBe(2); // die Wurzel wird jetzt immer doppelt geladen,
    });
  }));

  it('disconnects subject', fakeAsync(() => {
    component.LoadItems();
    tick();
    component.SetRoot(component.data[0]);
    tick();
    const subject = component.connect() as Subject<any>;
    expect(subject.observers.length).toEqual(1);
    component.disconnect();
    expect(subject.observers.length).toEqual(0);
  }));

  it('hasparent worked', () => {
    const item1 = new ImxExpandableItem<string>('item1', null, 0);
    const item2 = new ImxExpandableItem<string>('item2', item1, 0);
    const item3 = new ImxExpandableItem<string>('item3', item2, 0);
    const item4 = new ImxExpandableItem<string>('item5', item1, 0);

    expect(component.ElementHasParent(item3, item2)).toBe(true);
    expect(component.ElementHasParent(item3, item1)).toBe(true);
    expect(component.ElementHasParent(item4, item2)).toBe(false);
  });

  [null, undefined].forEach(provider =>
    it('should throw error if LoadItems is called when itemsProvider is undefined', () => {
      component.itemsProvider = provider;
      expect(() => component.LoadItems()).toThrowError('The accessor "itemsProvider" is undefined ');
    })
  );

  [null, undefined].forEach(provider =>
    it('should throw error if LoadChildItems is called when childItemsprovider is undefined', () => {
      component.childItemsProvider = provider;
      expect(() => component.LoadChildItems(null, false)).toThrowError('The accessor "childItemsprovider" is undefined');
    })
  );

  it('provides a SetRoot method', () => {
    expect(() => component.SetRoot(null)).not.toThrow();
  });

  it('provides an ExpandRoot method', () => {
    component.expandableData = [];
    component.SetRoot({});
    expect(() => component.ExpandRoot()).not.toThrow();
  });

  it('provides a CollapseRoot method', () => {
    component.expandableData = [];
    component.SetRoot({});
    expect(() => component.CollapseRoot()).not.toThrow();
  });

  [{ isExpanded: true, expected: true }, { isExpanded: false, expected: true }].forEach(testcase =>
    it('can expand all nodes', () => {
      const data = 1;
      component.expandableData = [
        {
          data,
          parent: null,
          level: 0,
          isExpanded: testcase.isExpanded,
          isRoot: true
        }
      ];
      component.SetRoot(data);
      component.ExpandAll();
      expect(component.expandableData[0].isExpanded).toEqual(testcase.expected);
    })
  );
});
