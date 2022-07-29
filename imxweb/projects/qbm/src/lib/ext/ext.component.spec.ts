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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { configureTestSuite } from 'ng-bullet';
import * as TypeMoq from 'typemoq';

import { ExtComponent } from './ext.component';
import { ExtService } from './ext.service';
import { IExtension } from './extension';
import { ExtDirective } from './ext.directive';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

describe('ExtComponent', () => {
  let component: ExtComponent;
  let fixture: ComponentFixture<ExtComponent>;

  const dummyRegistry = { 123: [TypeMoq.Mock.ofType<IExtension>().object] };

  const resolveComponentFactorySpy = jasmine.createSpy('resolveComponentFactory');

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ExtComponent],
      providers: [
        {
          provide: ExtService,
          useClass: class {
            public Registry = dummyRegistry;
          }
        },
        {
          provide: ComponentFactoryResolver,
          useClass: class {
            public resolveComponentFactory = resolveComponentFactorySpy;
          }
        }
      ]
    });
  });

  beforeEach(waitForAsync(() => {
    resolveComponentFactorySpy.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('could be initialized by angular', () => {
    component.id = '';
    component.ngOnInit();

    expect(resolveComponentFactorySpy).not.toHaveBeenCalled();
  });

  it('could be initialized by angular with a registered component', () => {
    const viewContainerRef = TypeMoq.Mock.ofType<ViewContainerRef>();
    viewContainerRef.setup(item => item.clear());
    viewContainerRef.setup(item => item.createComponent(TypeMoq.It.isAny())).returns(() => TypeMoq.Mock.ofType<ComponentRef<any>>().object);
    component.directive = new ExtDirective(viewContainerRef.object);
    component.id = Object.keys(dummyRegistry)[0];
    component.ngOnInit();

    expect(resolveComponentFactorySpy).toHaveBeenCalled();
  });
});
