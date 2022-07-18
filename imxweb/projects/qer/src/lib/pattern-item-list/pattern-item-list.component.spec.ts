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

import { Component, Input, Output } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { EuiLoadingService } from '@elemental-ui/core';
import { PortalItshopPatternRequestable } from 'imx-api-qer';
import { clearStylesFromDOM, SettingsService } from 'qbm';

import { PatternItemListComponent } from './pattern-item-list.component';
import { PatternItemService } from './pattern-item.service';

@Component({
  selector: 'imx-data-source-toolbar',
  template: '<p>MockDataSourceToolbarComponent</p>'
})
class MockDataSourceToolbarComponent {
  @Input() public entitySchema: any;
  @Input() public settings: any;
  @Input() public hiddenElements: any;
  @Input() public hideCustomToolbar: any;
  @Input() public keywords: any;
  @Input() itemStatus: any;
  @Input() alwaysVisible: any;
  @Input() initalView: any;
}

@Component({
  selector: 'imx-data-source-paginator',
  template: '<p>MockDataSourcePaginatorComponent</p>'
})
class MockDataSourcePaginatorComponent {
  @Input() public dst: any;
}

@Component({
  selector: 'imx-data-table',
  template: '<p>MockDataTableComponent</p>'
})
export class MockDataTableComponent {
  @Input() public dst: any;
  @Input() public dataSource: any;
  @Input() public navigationState: any;
  @Input() public displayedColumns: any;
  @Input() public entitySchema: any;
  @Input() public mode: 'auto' | 'manual' = 'auto';
  @Input() public selectable: boolean;
  @Input() public showSelectAllOption: boolean;
  @Input() detailViewVisible: any;
  @Input() showSelectedItemsMenu: any;

  @Output() public tableStateChanged: any;
}

@Component({
  selector: 'imx-data-table-column',
  template: '<p>MockDataTableColumnComponent</p>'
})
class MockDataTableColumnComponent {
  @Input() public entityColumn: any;
  @Input() public entitySchema: any;
  @Input() public columnLabel: string;
}

@Component({
  selector: 'imx-data-table-generic-column',
  template: '<p>MockDataTableGenericColumnComponent</p>'
})
class MockDataTableGenericColumnComponent {
  @Input() public columnLabel: any;
  @Input() public columnName: any;
}

@Component({
  selector: 'imx-data-source-toolbar-custom',
  template: '<p>MockDataSourceToolbarCustomComponent</p>'
})
class MockDataSourceToolbarCustomComponent {
  @Input() public customContentTemplate: any;
}

@Component({
  selector: 'imx-data-tiles',
  template: '<p>MockDataTilesComponent</p>'
})
class MockDataTilesComponent {
  @Input() public dst: any;
  @Input() public useActionMenu: any;
  @Input() public selectable: any;
  @Input() public actions: any;
  @Input() public titleObject: any;
  @Input() public subtitleObject: any;
  @Input() public contentTemplate: any;
}
// TODO: Fix Tests
xdescribe('PatternItemListComponent', () => {
  let component: PatternItemListComponent;
  let fixture: ComponentFixture<PatternItemListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        PatternItemListComponent,
        MockDataSourceToolbarComponent,
        MockDataSourceToolbarCustomComponent,
        MockDataSourcePaginatorComponent,
        MockDataTableComponent,
        MockDataTableColumnComponent,
        MockDataTableGenericColumnComponent,
        MockDataTilesComponent
      ],
      providers: [
        {
          provide: PatternItemService,
          useValue: {
            PortalShopServiceItemsSchema: PortalItshopPatternRequestable.GetEntitySchema(),
            get: jasmine.createSpy('get')
          }
        },
        {
          provide: EuiLoadingService,
          useValue: {
            show: jasmine.createSpy('show'),
            hide: jasmine.createSpy('hide')
          }
        },
        {
          provide: SettingsService,
          useValue: {
            DefaultPageSize: 1
          }
        }
      ]    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatternItemListComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    // expect(component.dstSettings).toBeDefined();
  }));
});
