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
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiLoadingService, EuiCoreModule, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { ServiceCategoriesComponent } from './service-categories.component';
import { ServiceCategoriesService } from './service-categories.service';
import { clearStylesFromDOM, ConfirmationService, SnackBarService } from 'qbm';
import { IEntity, IEntityColumn } from 'imx-qbm-dbts';
import { ServiceCategoryChangedType } from './service-category-changed.enum';
import { PortalServicecategories } from 'imx-api-qer';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { ServiceItemsService } from '../service-items/service-items.service';

@Component({
  selector: 'imx-service-category',
  template: '<p>MockServiceCategoryComponent</p>'
})
class MockServiceCategoryComponent {
}

@Component({
  selector: 'imx-data-tree',
  template: '<p>MockDataTreeComponent</p>'
})
class MockDataTreeComponent {
  @Input() database: any;
  @Input() selectedEntities: any;
  @Input() withMultiSelect: any;
  @Input() emptyNodeCaption: any;
}

describe('ServiceCategoriesComponent', () => {
  let component: ServiceCategoriesComponent;
  let fixture: ComponentFixture<ServiceCategoriesComponent>;

  function createColumn(value?: any, canEdit = true): IEntityColumn {
    return {
      GetMetadata: () => ({ CanEdit: () => canEdit }),
      GetValue: () => value
    } as IEntityColumn;
  }

  function createEntity(columns: { [name: string]: IEntityColumn } = {}, key?: string, diffData = []): IEntity {
    return {
      GetDisplay: () => '',
      GetColumn: name => columns[name] || createColumn(),
      GetKeys: () => [key],
      GetDiffData: () => ({ Data: diffData }),
      Commit: __ => Promise.resolve()
    } as unknown as IEntity;
  }

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const serviceCategoriesServiceStub = new class {
    private readonly sc = {
      GetEntity: () => createEntity({}, 'some key'),
      UID_AccProductGroupParent: { Column: { } }
    } as PortalServicecategories;

    get = jasmine.createSpy('get').and.returnValue(Promise.resolve({}));

    getById = jasmine.createSpy('getById').and.callFake(__ => ({ Data: [this.sc] }));

    createEntity = jasmine.createSpy('createEntity').and.returnValue(this.sc);

    hasAccproductparamcategoryCandidates =
      jasmine.createSpy('hasAccproductparamcategoryCandidates').and.returnValue(Promise.resolve(true));

    create = jasmine.createSpy('create').and.callFake(item => ({ Data: [item] }));

    delete = jasmine.createSpy('delete').and.returnValue(Promise.resolve({}));
  }();

  let confirm = true;
  const mockConfirmationService = {
    confirmLeaveWithUnsavedChanges: jasmine.createSpy('confirmLeaveWithUnsavedChanges')
      .and.callFake(() => Promise.resolve(confirm))
  };

  const sidesheet = new class {
    change: ServiceCategoryChangedType;
    readonly open = jasmine.createSpy('open').and.callFake(() => ({afterClosed: () => of(this.change)}))
  }();

  const serviceItemsService = new class {
    serviceItems = [];
    get = jasmine.createSpy('get').and.callFake(() => Promise.resolve({ totalCount: this.serviceItems.length, Data: this.serviceItems }));
    updateServiceCategory = jasmine.createSpy('updateServiceCategory');
  }();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ServiceCategoriesComponent,
        MockDataTreeComponent,
        MockServiceCategoryComponent
      ],
      imports: [
        EuiCoreModule,
        MatCardModule,
        TranslateModule.forRoot({}),
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: ServiceCategoriesService,
          useValue: serviceCategoriesServiceStub
        },
        {
          provide: ConfirmationService,
          useValue: mockConfirmationService
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: ProjectConfigurationService,
          useValue: {
            getConfig: __ => Promise.resolve({})
          }
        },
        {
          provide: EuiSidesheetService,
          useValue: sidesheet
        },
        {
          provide: ServiceItemsService,
          useValue: serviceItemsService
        },
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        }
      ]
    });
  });

  beforeEach(() => {
    serviceCategoriesServiceStub.get.calls.reset();
    serviceCategoriesServiceStub.hasAccproductparamcategoryCandidates.calls.reset();
    sidesheet.open.calls.reset();
    serviceCategoriesServiceStub.delete.calls.reset();
    serviceCategoriesServiceStub.create.calls.reset();
    serviceCategoriesServiceStub.createEntity.calls.reset();

    fixture = TestBed.createComponent(ServiceCategoriesComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    
    expect(component).toBeDefined();
  }));

  it('should create a new service category ', async () => {
    const initializeTreeSpy = spyOn<any>(component, 'initializeTree');

    sidesheet.change = ServiceCategoryChangedType.Change;

    await component.addServiceCategory();

    expect(serviceCategoriesServiceStub.createEntity).toHaveBeenCalled();
    expect(serviceCategoriesServiceStub.create).toHaveBeenCalled();
    expect(initializeTreeSpy).toHaveBeenCalled();
  });

  for (const testcase of
    [
      { description: 'changed' },
      { description: 'parentChanged', parentChanged: true }
    ]) {
    it(`should update when a service category changed (${testcase.description})`, async () => {
      sidesheet.change = ServiceCategoryChangedType.Change;

      const entity = createEntity({}, 'some key', testcase.parentChanged ? [{}] : []);

      await component.onServiceCategorySelected(entity);

      expect(sidesheet.open).toHaveBeenCalled();
    });
  }

  it(`should update when a service category was deleted`, async () => {
    const entityKey = 'some key';

    const initializeTreeSpy = spyOn<any>(component, 'initializeTree');

    sidesheet.change = ServiceCategoryChangedType.Delete;

    const entity = createEntity({}, entityKey);

    await component.onServiceCategorySelected(entity);

    expect(serviceCategoriesServiceStub.delete).toHaveBeenCalledWith(entityKey);

    expect(component.selectedEntities.length).toEqual(0);
    expect(initializeTreeSpy).toHaveBeenCalled();
  });
});
