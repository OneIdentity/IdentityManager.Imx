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

import { Component, Input } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { EuiCoreModule, EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { PortalAttestationRun } from 'imx-api-att';
import { clearStylesFromDOM } from 'qbm';
import { ApiService } from '../../api.service';
import { RunsService } from '../runs.service';

import { RunsGridComponent } from './runs-grid.component';
import { PermissionsService } from '../../admin/permissions.service';


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
export class MockDataTableComponent {
  @Input() public dst: any;
  @Input() detailViewVisible: any;
  @Input() selectable: any;
}

@Component({
  selector: 'imx-data-source-paginator',
  template: '<p>MockDataSourcePaginatorComponent</p>',
})
export class MockDataSourcePaginatorComponent {
  @Input() public dst: any;
}

describe('RunsGridComponent', () => {
  let component: RunsGridComponent;
  let fixture: ComponentFixture<RunsGridComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        RunsGridComponent,
        MockDataSourceToolbarComponent,
        MockDataTableComponent,
        MockDataSourcePaginatorComponent
      ],
      imports: [
        MatExpansionModule,
        EuiCoreModule
      ],
      providers: [
        {
          provide: EuiSidesheetService,
          useValue: {}
        },
        {
          provide: EuiLoadingService,
          useValue: {
            show: jasmine.createSpy('show'),
            hide: jasmine.createSpy('hide')
          }
        },
        {
          provide: ApiService,
          useValue: {
            client: {
              portal_attestation_config_get: () => ({})
            },
            typedClient: {
              PortalAttestationRun: {
                GetSchema: () => PortalAttestationRun.GetEntitySchema(),
                Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ }))
              }
            }
          }
        },
        {
          provide: RunsService,
          useValue: {
            getDataModel: () => Promise.resolve({})
          }
        },
        {
          provide: PermissionsService,
          useValue: {
            canSeeAttestationPolicies: () => true
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RunsGridComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  
  it('should init dstSettings', async() => {
    await component.ngOnInit();
    const entitySchema = PortalAttestationRun.GetEntitySchema();
    expect(component.dstSettings.displayedColumns).toContain(entitySchema.Columns.PendingCases);
    expect(component.dstSettings.displayedColumns).toContain(entitySchema.Columns.ClosedCases);
    expect(component.dstSettings.displayedColumns).toContain(entitySchema.Columns.RunCategory);
  });

  it('does not overwrite the orderby setting', async () => {
    await component.getData({});
    expect(component.dstSettings.navigationState.OrderBy).toEqual('PolicyProcessed desc');
  });
});
