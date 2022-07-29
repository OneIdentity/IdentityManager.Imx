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

import { Component, Input, Output, EventEmitter, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatBadgeModule } from '@angular/material/badge';
import { EuiCoreModule, EuiLoadingService, EuiSidesheetRef, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { clearStylesFromDOM, MetadataService } from 'qbm';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { of } from 'rxjs';

import { EntitlementsAddComponent } from './entitlements-add.component';
import { EntitlementsService } from '../entitlements.service';
import { CollectionLoadParameters } from 'imx-qbm-dbts';
import { PortalEntitlementcandidatesEset, PortalEntitlementcandidatesUnsgroup } from 'imx-api-aob';
import { EntitlementsType } from '../entitlements.model';

@Component({
  selector: 'imx-data-source-toolbar',
  template: '<p>MockDataSourceToolbarComponent</p>'
})
class MockDataSourceToolbarComponent {
  @Input() public entitySchema: any;
  @Input() public settings: any;
  @Input() public hiddenElements: any;
}

@Component({
  selector: 'imx-data-table',
  template: '<p>MockDataTableComponent</p>'
})
class MockDataTableComponent {
  @Input() public dst: any;
  @Input() public dataSource: any;
  @Input() public navigationState: any;
  @Input() public displayedColumns: any;
  @Input() public entitySchema: any;
  @Input() public selectable: boolean;
  @Input() public detailViewTitle: string;
  @Input() detailViewVisible: any;

  @Output() public tableStateChanged = new EventEmitter<CollectionLoadParameters>();
  @Output() public selectionChanged: any = new EventEmitter<any>();
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

@Pipe({ name: 'ldsReplace' })
class MockLdsReplacePipe implements PipeTransform {
  transform() { }
}

describe('EntitlementsAddComponent', () => {
  let component: EntitlementsAddComponent;
  let fixture: ComponentFixture<EntitlementsAddComponent>;

  const mockEset = [
    { XObjectKey: { value: 'eset1' } },
    { XObjectKey: { value: 'eset2' } },
    { XObjectKey: { value: 'eset3' } }
  ];

  const mockUnsGroup = [
    { XObjectKey: { value: 'group1' } },
    { XObjectKey: { value: 'group2' } },
    { XObjectKey: { value: 'group3' } }
  ];

  const mockEntitlementsService = {
    entitlementcandidatesEsetSchema: PortalEntitlementcandidatesEset.GetEntitySchema(),
    entitlementcandidatesUnsgroupSchema: PortalEntitlementcandidatesUnsgroup.GetEntitySchema(),
    get: jasmine.createSpy('get').and.returnValue(Promise.resolve({ totalCount: 0, Data: [] })),
    getCandidatesEset: jasmine.createSpy('getCandidatesEset').and.returnValue(Promise.resolve({ totalCount: mockEset.length, Data: mockEset })),
    getCandidatesUnsgroup: jasmine.createSpy('getCandidatesUnsgroup').and.returnValue(Promise.resolve({ totalCount: mockUnsGroup.length, Data: mockUnsGroup })),
    candidateSchema: jasmine.createSpy('candidateSchema')
  }
  const data = { data: EntitlementsType.Eset,isSystemRolesEnabled: true };

  const mockSidesheetrefRef = {
    close: jasmine.createSpy('close')
  };

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const sidesheet = {
    open: jasmine.createSpy('open').and.returnValue({
      afterClosed: () => of({})
    })
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        EntitlementsAddComponent,
        MockDataTableComponent,
        MockDataTableColumnComponent,
        MockDataSourceToolbarComponent,
        MockDataSourcePaginatorComponent,
        MockLdsReplacePipe
      ],
      imports: [
        LoggerTestingModule,
        NoopAnimationsModule,
        EuiCoreModule,
        MatCardModule,
        MatSelectModule,
        MatFormFieldModule,
        MatBadgeModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
       })
      ],
      providers: [
        {
          provide: EuiSidesheetRef,
          useValue: mockSidesheetrefRef
        },
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: data
        },
        {
          provide: EntitlementsService,
          useValue: mockEntitlementsService
        },
        {
          provide: EuiSidesheetService,
          useValue: sidesheet
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: MetadataService,
          useValue: {
            updateTable: jasmine.createSpy('updateTable'),
            tables: {
              ESet: {Display: 'ESet'},
              UNSGroup: {Display: 'UNSGroup'},
              QERResource: {Display: 'QERResource'},
              RPSReport: {Display: 'RPSReport'},
              TSBAccountDef: {Display: 'TSBAccountDef'},
            }
          }
        }
      ]
    });
  });

  beforeEach(waitForAsync(() => {
    euiLoadingServiceStub.hide.calls.reset();
    euiLoadingServiceStub.show.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntitlementsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  
  it('can toggleView', async () =>{
    const test = spyOn<any>(component, 'useSource');
    await component.toggleView({value: EntitlementsType.Rpsreport} as MatSelectChange)
    expect (test).toHaveBeenCalledWith(EntitlementsType.Rpsreport);
  })

});
