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
 * Copyright 2023 One Identity LLC.
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

import { Pipe, PipeTransform, Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { HttpClientModule } from '@angular/common/http';
import { EuiCoreModule } from '@elemental-ui/core';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

import { LifecycleActionComponent } from './lifecycle-action.component';
import { LdsReplacePipe, clearStylesFromDOM, MetadataService } from 'qbm';
import { LifecycleAction } from './lifecycle-action.enum';
import { AobApiService } from '../aob-api-client.service';
import { PortalApplication, PortalEntitlement } from 'imx-api-aob';

const mockMatDialogRef = {
  close: jasmine.createSpy('close')
};

@Pipe({ name: 'ldsReplace' })
class MockLdsReplacePipe implements PipeTransform {
  transform() { }
}

const mockLdsReplacePipe = {
  transform: jasmine.createSpy('transform').and.callFake((value: string) => value)
};

@Component({
  selector: 'imx-data-source-toolbar',
  template: '<p>MockDataSourceToolbarComponent</p>'
})
class MockDataSourceToolbarComponent {
  @Input() public dst: any;
  @Input() public hiddenElements: any;
  @Input() public settings: any;
}

@Component({
  selector: 'imx-data-table',
  template: '<p>MockDataTableComponent</p>'
})
class MockDataTableComponent {
  @Input() public dst: any;
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

describe('LifecycleActionComponent', () => {
  let component: LifecycleActionComponent;
  let fixture: ComponentFixture<LifecycleActionComponent>;

  const getTableMetadataSpy = jasmine.createSpy('GetTableMetadata').and.returnValue(
    Promise.resolve({
      Columns: {},
      Display: 'tableDisplayDummy',
      DisplaySingular: 'tableDisplaySingularDummy',
      ImageId: '',
      IsDeactivated: false,
      IsMAllTable: false,
      IsMNTable: false
    })
  );

  const moduleDef = {
    declarations: [
      LifecycleActionComponent,
      MockDataSourceToolbarComponent,
      MockDataTableComponent,
      MockDataTableColumnComponent,
      MockLdsReplacePipe
    ],
    imports: [
      EuiCoreModule,
      FormsModule,
      HttpClientModule,
      LoggerTestingModule,
      MatButtonModule,
      MatCardModule,
      MatDialogModule,
      MatDatepickerModule,
      MatFormFieldModule,
      MatRadioModule,
      ReactiveFormsModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateFakeLoader
        }
      })
    ],
    providers: [
      {
        provide: MatDialogRef,
        useValue: mockMatDialogRef
      },
      {
        provide: MAT_DIALOG_DATA,
        useValue: { action: LifecycleAction.Publish, elements: [], shops: [], type: 'AobApplication' }
      },
      {
        provide: LdsReplacePipe,
        useValue: mockLdsReplacePipe
      },
      {
        provide: AobApiService,
        useValue: {
          typedClient: {
            PortalApplication: {
              GetSchema: () => PortalApplication.GetEntitySchema()
            },
            PortalEntitlement: {
              GetSchema: () => PortalEntitlement.GetEntitySchema()
            }
          }
        }
      },
      {
        provide: MetadataService,
        useClass: class {
          GetTableMetadata = getTableMetadataSpy;
        }
      }
    ]
  };

  beforeEach(waitForAsync(() => {
    mockMatDialogRef.close.calls.reset();
  }));

  afterAll(() => {
    clearStylesFromDOM();
  });

  function initComponent(): void {
    TestBed.configureTestingModule(moduleDef).compileComponents();
    fixture = TestBed.createComponent(LifecycleActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', fakeAsync(() => {
    initComponent();

    expect(getTableMetadataSpy).toHaveBeenCalled();

    tick();

    expect(component.dstSettings.dataSource).toBeTruthy();
  }));

  [
    {
      whenToPublish: 'now',
      expectedIsInActive: false
    },
    {
      whenToPublish: 'future',
      expectedIsInActive: false
    }
  ].forEach(testcase =>
    it('should return publishData of entitlements in publish mode', () => {
      initComponent();
      component.data.action = LifecycleAction.Publish;
      component.data.elements = [];
      component.whenToPublish = testcase.whenToPublish as ('now' | 'future');
      component.submitData();
      expect(mockMatDialogRef.close).toHaveBeenCalledWith({ publishFuture: testcase.expectedIsInActive, date: component.datepickerFormControl.value.toDate() });
    }));

  [
    {
      action: LifecycleAction.Unassign,
      mode: 'Unassign'
    },
    {
      action: LifecycleAction.Unpublish,
      mode: 'Unpublish'
    }
  ].forEach(testcase =>
    it(`should return true in ${testcase.mode} mode`, () => {
      initComponent();
      component.data.action = testcase.action;
      component.data.elements = [];
      component.submitData();
      expect(mockMatDialogRef.close).toHaveBeenCalledWith(true);
    })
  );


  [
    {
      type: 'AobApplication' as 'AobEntitlement' | 'AobApplication'
    },
    {
      type: 'AobEntitlement' as 'AobEntitlement' | 'AobApplication'
    }
  ].forEach(maintestcase =>
    [
      {
        action: LifecycleAction.Unassign,
        mode: 'Unassign',
        entitlementsCount: 1
      },
      {
        action: LifecycleAction.Unassign,
        mode: 'Unassign',
        entitlementsCount: 2
      },
      {
        action: LifecycleAction.Publish,
        mode: 'Publish',
        entitlementsCount: 1
      },
      {
        action: LifecycleAction.Publish,
        mode: 'Publish',
        entitlementsCount: 2
      },
      {
        action: LifecycleAction.Unpublish,
        mode: 'Unpublish',
        entitlementsCount: 1
      },
      {
        action: LifecycleAction.Unpublish,
        mode: 'Unpublish',
        entitlementsCount: 2
      }
    ].forEach(testcase =>
      it(`should init the component with mode=${testcase.mode} and ${testcase.entitlementsCount} entitlements`, () => {

        let dummyEntitlements = [];
        for (let n = 0; n < testcase.entitlementsCount; n++) {
          dummyEntitlements.push({});
        }

        moduleDef.providers[1] = {
          provide: MAT_DIALOG_DATA,
          useValue: { action: testcase.action, elements: dummyEntitlements, shops: [], type: (maintestcase.type as 'AobEntitlement' | 'AobApplication') }
        };

        TestBed.configureTestingModule(moduleDef).compileComponents();

        fixture = TestBed.createComponent(LifecycleActionComponent);
        component = fixture.componentInstance;

        expect(component.dialogTitle.length).toBeGreaterThan(0);
        expect(component.actionButtonText.length).toBeGreaterThan(0);

        expect(component.isApplication()).toBe(maintestcase.type == 'AobApplication');
        expect(component.isEntitlement()).toBe(maintestcase.type == 'AobEntitlement');

        expect(component.isUnassign()).toBe(testcase.action === LifecycleAction.Unassign);
        expect(component.isPublish()).toBe(testcase.action === LifecycleAction.Publish);
        expect(component.isUnpublish()).toBe(testcase.action === LifecycleAction.Unpublish);
      })));


});
