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
import { Pipe, PipeTransform, Component, Input, Output } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { EuiLoadingService, EuiCoreModule } from '@elemental-ui/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AboutComponent } from './About.component';
import { AboutService } from './About.service';
import { ExtService } from '../ext/ext.service';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';
import { AppConfigService } from '../appConfig/appConfig.service';
import { ImxSysteminfoThirdparty } from 'imx-api-qbm';

@Pipe({ name: 'ldsReplace' })
class MockLdsReplacePipe implements PipeTransform {
  transform() { }
}
@Component({
  selector: 'imx-data-source-toolbar',
  template: '<p>MockDataSourceToolbarComponent</p>'
})
class MockDataSourceToolbarComponent {
  @Input() public dst: any;
  @Input() public hiddenElements: any;
  @Input() public settings: any;
  @Output() public navigationStateChanged: any;
}

@Component({
  selector: 'imx-data-source-toolbar-custom',
  template: '<p>MockDataSourceToolbarCustomComponent</p>'
})
class MockDataSourceToolbarCustomComponent {
  @Input() public customContentTemplate: any;
}

@Component({
  selector: 'imx-data-table',
  template: '<p>MockDataTableComponent</p>'
})
class MockDataTableComponent {
  @Input() public dst: any;
  @Input() public detailViewTitle: any;
}

@Component({
  selector: 'imx-data-table-column',
  template: '<p>MockDataTableColumnComponent</p>'
})
class MockDataTableColumnComponent {
  @Input() public entityColumn: any;
  @Input() public entitySchema: any;
}


@Component({
  selector: 'imx-data-source-paginator',
  template: '<p>MockDataSourcePaginatorComponent</p>'
})
class MockDataSourcePaginatorComponent {
  @Input() public dst: any;
}

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;
  const closeSpy = jasmine.createSpy('close');

  let extRegistry: any;
  const aboutServiceStub = {
    EntitySchema: ImxSysteminfoThirdparty.GetEntitySchema(),
    get: jasmine.createSpy('get').and.returnValue(Promise.resolve({}))
  };
  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatDialogModule,
        MatCardModule,
        MatTabsModule,
        EuiCoreModule,
        LoggerTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })
      ],
      declarations: [
        AboutComponent,
        MockLdsReplacePipe,
        MockDataSourcePaginatorComponent,
        MockDataSourceToolbarComponent,
        MockDataSourceToolbarCustomComponent,
        MockDataTableComponent,
        MockDataTableColumnComponent,
      ],
      providers: [
        {
          provide: MatDialogRef,
          useClass: class {
            public close = closeSpy;
          }
        },
        {
          provide: ExtService,
          useClass: class {
            public Registry = jasmine.createSpy('hh').and.callFake(() => {
              return extRegistry;
            });
          }
        },
        {
          provide: AboutService,
          useValue: aboutServiceStub
        },
        {
          provide: AppConfigService,
          useValue: {
            getImxConfig: jasmine.createSpy('getImxConfig').and.returnValue(Promise.resolve({ProductName: null}))
          }
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
  
  it('should show or hide the systemoverviewtab', () => {
    expect(component.ShowSystemOverviewTab()).toBeFalsy();
  });
});
