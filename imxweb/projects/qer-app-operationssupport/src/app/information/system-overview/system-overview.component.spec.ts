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
import { Pipe, PipeTransform } from '@angular/core';
import { MatTreeModule } from '@angular/material/tree';
import { EuiCoreModule, EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import * as TypeMoq from 'typemoq';

import { OpsupportSystemoverview } from 'imx-api-qbm';
import { TypedEntityCollectionData } from 'imx-qbm-dbts';
import { SystemOverviewService } from './system-overview.service';
import { SystemTreeNode } from './system-tree/system-tree-node';
import { SystemOverviewComponent } from './system-overview.component';
import { UserActionService, CreateIReadValue, clearStylesFromDOM } from 'qbm';
import { SystemTreeDatabase } from './system-tree/system-tree-database';


@Pipe({ name: 'ldsReplace' })
class MockLdsReplacePipe implements PipeTransform {
  transform() { }
}

describe('SystemOverviewComponent', () => {
  let component: SystemOverviewComponent;
  let fixture: ComponentFixture<SystemOverviewComponent>;
  let response: Promise<TypedEntityCollectionData<OpsupportSystemoverview>>;

  const dummyExport = 'dummyExport';
  const dbExportSpy = jasmine.createSpy('export').and.returnValue(dummyExport);

  const copySpy = jasmine.createSpy('copy2Clipboard');
  const downloadSpy = jasmine.createSpy('downloadData');

  const dummyTresholdsCounter = 10;

  let sysOverviewArray: OpsupportSystemoverview[];

  const sysOverviewObjMock1 = TypeMoq.Mock.ofType<OpsupportSystemoverview>();
    sysOverviewObjMock1.setup(d => d.UID_QBMVSystemOverview).returns(() => CreateIReadValue('14AA3338-8EEF-2ECE-9C85-D12E0E4CE3ED'));
    sysOverviewObjMock1.setup(d => d.Value).returns(() => CreateIReadValue('CustomerName'));

    const sysOverviewObjMock2 = TypeMoq.Mock.ofType<OpsupportSystemoverview>();
    sysOverviewObjMock2.setup(d => d.UID_QBMVSystemOverview).returns(() => CreateIReadValue('D2E0BA98-C79F-8A5F-3F69-0FECCC8055AF'));
    sysOverviewObjMock2.setup(d => d.Value).returns(() => CreateIReadValue('CustomerMail'));
    sysOverviewObjMock2.setup(d => d.QualityOfValue).returns(() => CreateIReadValue(0.1));

    sysOverviewArray = new Array<OpsupportSystemoverview>();
    sysOverviewArray.push(sysOverviewObjMock1.object);
    sysOverviewArray.push(sysOverviewObjMock2.object);

    const sysOverviewObjMock3 = TypeMoq.Mock.ofType<OpsupportSystemoverview>();
    sysOverviewObjMock3.setup(d => d.Value).returns(() => CreateIReadValue('dummyValue'));
    sysOverviewObjMock3.setup(d => d.QualityOfValue).returns(() => CreateIReadValue(0.1));

    for (let i = 0; i++; i < dummyTresholdsCounter) {
      sysOverviewArray.push(sysOverviewObjMock3.object);
    }

    response = Promise.resolve({
      tableName: '',
      totalCount: 1,
      Data: sysOverviewArray
    } as TypedEntityCollectionData<OpsupportSystemoverview>);

    const node = TypeMoq.Mock.ofType<SystemTreeNode>();
    node.setup(n => n.name).returns(() => 'dummyName');
    const nodes = new Array<SystemTreeNode>();
    nodes.push(node.object);

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        SystemOverviewComponent,
        MockLdsReplacePipe
      ],
      imports: [
        EuiCoreModule,
        LoggerTestingModule,
        MatTreeModule
      ],
      providers: [
        {
          provide: SystemOverviewService,
          useClass: class {
            ItemsProvider = jasmine.createSpy('ItemsProvider').and.returnValue(response);
          }
        },
        {
          provide: UserActionService,
          useClass: class {
            downloadData = downloadSpy;
            copy2Clipboard = copySpy;
          }
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        },
        {
          provide: SystemTreeDatabase,
          useClass: class {
            initialize = jasmine.createSpy('initialize').and.returnValue(nodes);
            ExceededTresholdsCounter = dummyTresholdsCounter;
            CustomerName = 'CustomerName';
            CustomerEmail = 'CustomerMail';
            export = dbExportSpy;
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();

    response.then(() => {
      expect(component.systemEmail).toBe('CustomerMail');
      expect(component.systemName).toBe('CustomerName');
    });
  });

  it('get level of the treenode', () => {
    const node = TypeMoq.Mock.ofType<SystemTreeNode>();
    node.setup(n => n.level).returns(() => 999);

    expect(component.getLevel(node.object)).toBe(999);
  });

  it('should check if node is expandable', () => {
    const node = TypeMoq.Mock.ofType<SystemTreeNode>();
    node.setup(n => n.expandable).returns(() => true);

    expect(component.isExpandable(node.object)).toBeTruthy();
  });

  it('should return the corresponding cssClass for the qualityOfValue', () => {
    const exceededNode = TypeMoq.Mock.ofType<OpsupportSystemoverview>();
    exceededNode.setup(n => n.QualityOfValue).returns(() => CreateIReadValue(0.1));
    expect(component.qualityOfValueClass(exceededNode.object)).toBe('imx-treshold-exceeded');

    const notRecommendedNode = TypeMoq.Mock.ofType<OpsupportSystemoverview>();
    notRecommendedNode.setup(n => n.QualityOfValue).returns(() => CreateIReadValue(0.4));
    expect(component.qualityOfValueClass(notRecommendedNode.object)).toBe('imx-recommendedValue-exceeded');

    const perfectNode = TypeMoq.Mock.ofType<OpsupportSystemoverview>();
    perfectNode.setup(n => n.QualityOfValue).returns(() => CreateIReadValue(0.6));
    expect(component.qualityOfValueClass(perfectNode.object)).toBe('');
  });

  it('should disabling the tooltip if the recommended value is empty ', () => {
    const emptyRecommendedValue = TypeMoq.Mock.ofType<OpsupportSystemoverview>();
    emptyRecommendedValue.setup(n => n.RecommendedValue).returns(() => CreateIReadValue(''));
    expect(component.disableTooltip(emptyRecommendedValue.object)).toBeTruthy();

    const specifiedRecommendedValue = TypeMoq.Mock.ofType<OpsupportSystemoverview>();
    specifiedRecommendedValue.setup(n => n.RecommendedValue).returns(() => CreateIReadValue('Not empty'));
    expect(component.disableTooltip(specifiedRecommendedValue.object)).toBeFalsy();
  });

  it('should return exceededTresholdsCounter from database', () => {
    expect(component.exceededTresholdsCounter).toBe(dummyTresholdsCounter);
  });

  it('should get the dataexport from database', () => {
    dbExportSpy.calls.reset();

    // first get from db
    expect(component.getExportedData()).toBe(dummyExport);
    expect(dbExportSpy).toHaveBeenCalled();

    // second get from cache
    dbExportSpy.calls.reset();
    expect(component.getExportedData()).toBe(dummyExport);
    expect(dbExportSpy).not.toHaveBeenCalled();
  });

  it('should copy exported data to clipboard', () => {
    expect(() => {
      component.copy2Clipboard();
      expect(copySpy).toHaveBeenCalled();
    }).not.toThrowError();
  });

  it('should download the exported data', () => {
    expect(() => {
      component.export2CSV();
      expect(downloadSpy).toHaveBeenCalled();
    }).not.toThrowError();
  });
});
