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
import { NgModule, Component, Input, Output, EventEmitter } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiLoadingComponent, EuiCoreModule, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { TranslateModule } from '@ngx-translate/core';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { PortalPersonAll } from 'imx-api-qer';
import { clearStylesFromDOM } from 'qbm';

import { AddressbookComponent } from './addressbook.component';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { AddressbookService } from './addressbook.service';

@NgModule({
  imports: [EuiCoreModule],
  exports: [EuiLoadingComponent],
})
class EuiLoadingModule { }

@Component({
  selector: 'imx-data-source-toolbar',
  template: '<p>MockDataSourceToolbarComponent</p>'
})
class MockDataSourceToolbarComponent {
  @Input() public settings: any;
  @Input() public hiddenElements: any;

  @Output() public navigationStateChanged = new EventEmitter<any>();
  @Output() public search = new EventEmitter<any>();
}

@Component({
  selector: 'imx-data-table',
  template: '<p>MockDataTableComponent</p>'
})
class MockDataTableComponent {
  @Input() public dst: any;
  @Input() public detailViewVisible: any;
  @Input() public groupData: any;

  @Output() public highlightedEntityChanged = new EventEmitter<any>();
}

@Component({
  selector: 'imx-data-source-paginator',
  template: '<p>MockDataSourcePaginatorComponent</p>'
})
class MockDataSourcePaginatorComponent {
  @Input() public dst: any;
}

describe('AddressbookComponent', () => {
  let component: AddressbookComponent;
  let fixture: ComponentFixture<AddressbookComponent>;

  const sidesheet = {
    open: jasmine.createSpy('open')
  };

  const mockConfigService = {
    getConfig: jasmine.createSpy('getConfig')
      .and
      .returnValue(Promise.resolve({
        PersonConfig: {
          VI_MyData_WhitePages_ResultAttributes: ['col1', 'col2'],
          VI_MyData_WhitePages_DetailAttributes: ['col1', 'col2']
        }
      }))
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        AddressbookComponent,
        MockDataSourceToolbarComponent,
        MockDataTableComponent,
        MockDataSourcePaginatorComponent
      ],
      imports: [
        EuiLoadingModule,
        TranslateModule,
        LoggerTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: AddressbookService,
          useValue: {
            createDataSourceWrapper: jasmine.createSpy('createDataSourceWrapper'),
            getDetail: (__0, __1) => Promise.resolve({})
          }
        },
        {
          provide: ProjectConfigurationService,
          useValue: mockConfigService
        },
        {
          provide: EuiSidesheetService,
          useValue: sidesheet
        }
      ]
    });
  });

  beforeEach(() => {
    sidesheet.open.calls.reset();

    fixture = TestBed.createComponent(AddressbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should highlight a person',  async () => {
    const person = {
      GetEntity: () => ({
        GetDisplay: () => { return 'Display value'; },
        GetKeys: () => { return ['1']; }
      }),
    } as PortalPersonAll;

    await component.onHighlightedEntityChanged(person);
    expect(sidesheet.open).toHaveBeenCalled();
  });
});
