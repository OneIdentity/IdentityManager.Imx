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

import { Input, Component, EventEmitter, Output, ViewChild, TemplateRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { Subject } from 'rxjs';

import { IClientProperty, TypedEntity, TypedEntityCollectionData } from 'imx-qbm-dbts';

import { DataTilesComponent } from './data-tiles.component';
import { mockDSTColumns } from '../testing/dst-mock-help.spec';
import { DataSourceToolbarSettings } from '../data-source-toolbar/data-source-toolbar-settings';
import { DataTileMenuItem } from './data-tile-menu-item.interface';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

const data = [['key1']].map(keys => ({ GetEntity: () => ({ GetKeys: () => keys })})) as TypedEntity[];

@Component({
  selector: 'imx-data-tile',
  template: '<p>MockDataTileComponent</p>'
})
class MockDataTileComponent {
  @Input() public typedEntity: TypedEntity;
  @Input() public isSelected = false;
  @Input() public isSelectable = false;
  @Input() public contentTemplate: TemplateRef<any>;
  @Input() public titleObject: IClientProperty;
  @Input() public subtitleObject: IClientProperty;
  @Input() public image: IClientProperty;
  @Input() public fallbackIcon: string;
  @Input() public icon: string;
  @Output() public selectionChanged = new EventEmitter<TypedEntity>();
  @Input() public actions = [];
  @Output() public actionSelected = new EventEmitter<DataTileMenuItem>();
  @Input() status: any;
  @Input() public useActionMenu: any;
  @Input() public width: any;
  @Input() public height: any;
}

@Component({
  selector: 'imx-data-source-toolbar',
  template: '<p>MockDataSourceToolbarComponent</p>'
})
class MockDataSourceToolbarComponent {
  @Input() public settings: DataSourceToolbarSettings;
  @Output() public settingsChanged = new EventEmitter<DataSourceToolbarSettings>();
  @Output() public dataSourceChanged = new EventEmitter<TypedEntityCollectionData<TypedEntity>>();

  selectionChanged = new Subject();

  isChecked = __ => false;

  toggle = __ => {};

  public internalDataSource = new MatTableDataSource(data);
}

@Component({
  template: `
  <imx-data-source-toolbar #dst [settings]="settings"></imx-data-source-toolbar>
  <imx-data-tiles [dst]="dst" [selectable]="true"></imx-data-tiles>
  `
})
class TestHostComponent {
  private readonly cols: IClientProperty[] = mockDSTColumns;

  public settings: DataSourceToolbarSettings = {
    dataSource: {
      totalCount: data.length,
      Data: data
    },
    navigationState: { StartIndex: 1, PageSize: 25 },
    entitySchema: {
      Columns: {
        'AutoUpdateLevel': this.cols[0],
        'BaseURL': this.cols[1],
        'IsDebug': this.cols[2],
        'IsPrivate': this.cols[3],
        'UID_DialogProduct': this.cols[4]
      }
    },
    displayedColumns: [this.cols[0], this.cols[1], this.cols[4]]
  };
  @ViewChild(DataTilesComponent, { static: true }) public component: DataTilesComponent;
  @ViewChild(MockDataSourceToolbarComponent, { static: true }) public toolbar: MockDataSourceToolbarComponent;
}

describe('DataTilesComponent', () => {
  let component: DataTilesComponent;
  let testHostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        DataTilesComponent,
        MockDataTileComponent,
        MockDataSourceToolbarComponent,
        TestHostComponent
      ],
      imports: [
        EuiCoreModule,
        EuiMaterialModule,
        MatCardModule,
        MatTooltipModule,
        MatButtonModule,
        NoopAnimationsModule
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    testHostComponent = fixture.componentInstance;
    component = testHostComponent.component;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call toggle on select', () => {
    const toggleSpy = spyOn(component.dst, 'toggle');
    const entity = testHostComponent.settings.dataSource.Data[0];
    component.selectable = true;

    component.onSelectionChanged(entity);
    fixture.detectChanges();
    expect(toggleSpy).toHaveBeenCalledWith(entity);
  })
});
