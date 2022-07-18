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

import { ErrorHandler, ViewContainerRef, ComponentRef, ComponentFactoryResolver, ComponentFactory } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import * as TypeMoq from 'typemoq';

import { EditDefaultComponent } from './edit-default/edit-default.component';
import { CdrEditorProvider } from './cdr-editor-provider.interface';
import { ColumnDependentReference } from './column-dependent-reference.interface';
import { CdrEditor } from './cdr-editor.interface';
import { CdrRegistryService } from './cdr-registry.service';

describe('CdrRegistryService', () => {
  const errorHandlerStub = {
    handleError: jasmine.createSpy('handleError')
  };

  let createdComponentFactory = TypeMoq.Mock.ofType<ComponentFactory<EditDefaultComponent>>().object;

  const componentFactoryResolverStub = {
    resolveComponentFactory: jasmine.createSpy('resolveComponentFactory').and.callFake(() => createdComponentFactory)
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [LoggerTestingModule],
      providers: [
        CdrRegistryService,
        { provide: ErrorHandler, useValue: errorHandlerStub },
        { provide: ComponentFactoryResolver, useValue: componentFactoryResolverStub }
      ]
    });
  });

  beforeEach(() => {
    errorHandlerStub.handleError.calls.reset();
    componentFactoryResolverStub.resolveComponentFactory.calls.reset();
  });

  it('should be created', () => {
    const service: CdrRegistryService = TestBed.get(CdrRegistryService);
    expect(service).toBeDefined();
  });

  it('should allow provider registration', () => {
    const service: CdrRegistryService = TestBed.inject(CdrRegistryService);

    const providerStub = {
      createEditor: jasmine.createSpy('createEditor')
    } as CdrEditorProvider;
    service.register(providerStub);

    const cdrStub = {} as ColumnDependentReference;
    service.createEditor(undefined, cdrStub);

    expect(providerStub.createEditor).toHaveBeenCalledWith(undefined, cdrStub);
  });

  it('should not be possible to register the same provider twice.', () => {
    const providerMock = TypeMoq.Mock.ofType<CdrEditorProvider>();
    const service: CdrRegistryService = TestBed.inject(CdrRegistryService);

    expect(() => service.register(providerMock.object)).not.toThrowError();
    expect(() => service.register(providerMock.object)).toThrowError();
  });

  it('should throw an error on attempt to register null provider', () => {
    const service: CdrRegistryService = TestBed.inject(CdrRegistryService);

    expect(() => service.register(null)).toThrowError();
  });

  it('should throw an error on attempt to register undefined provider', () => {
    const service: CdrRegistryService = TestBed.inject(CdrRegistryService);

    expect(() => service.register(undefined)).toThrowError();
  });

  it('should throw an error on attempt to create an editor for null column dependent reference', () => {
    const service: CdrRegistryService = TestBed.inject(CdrRegistryService);
    const parentMock = TypeMoq.Mock.ofType<ViewContainerRef>();
    expect(() => service.createEditor(parentMock.object, null)).toThrowError();
  });

  it('should throw an error on attempt to create an editor for undefined column dependent reference', () => {
    const service: CdrRegistryService = TestBed.inject(CdrRegistryService);
    const parentMock = TypeMoq.Mock.ofType<ViewContainerRef>();
    expect(() => service.createEditor(parentMock.object, undefined)).toThrowError();
  });

  // TODO: Ist beim Upgrade auf Angular v11 kaputgegangrn. Reactivate
  // it('should use injected ComponentFactoryResolver to create and return default editor'
  //   + ' on given parent when creating component and no providers have been registered.', () => {
  //     // Arrange
  //     const service: CdrRegistryService = TestBed.inject(CdrRegistryService);
  //     const editDefaultMock = TypeMoq.Mock.ofType<ComponentRef<EditDefaultComponent>>();
  //     const parentStub = { createComponent: _ => editDefaultMock.object } as ViewContainerRef;
  //     const parentCreateComponentSpy = spyOn(parentStub, 'createComponent').and.callThrough();

  //     // Act
  //     const editor = service.createEditor(parentStub, { } as ColumnDependentReference);

  //     // Assert
  //     expect(errorHandlerStub.handleError).not.toHaveBeenCalled();
  //     expect(editor.instance).toBeDefined();
  //     expect(componentFactoryResolverStub.resolveComponentFactory).toHaveBeenCalledTimes(1);
  //     expect(parentCreateComponentSpy).toHaveBeenCalledTimes(1);
  //   });

  it('should ask all providers once if none of them provides an editor', () => {
    // Arrange
    const service: CdrRegistryService = TestBed.get(CdrRegistryService);
    const providerMocks = [
      TypeMoq.Mock.ofType<CdrEditorProvider>(),
      TypeMoq.Mock.ofType<CdrEditorProvider>(),
      TypeMoq.Mock.ofType<CdrEditorProvider>()
    ];
    const parentMock = TypeMoq.Mock.ofType<ViewContainerRef>();
    const cdrMock = TypeMoq.Mock.ofType<ColumnDependentReference>();
    for (const providerMock of providerMocks) {
      service.register(providerMock.object);
    }

    // Act
    service.createEditor(parentMock.object, cdrMock.object);

    // Assert
    for (const providerMock of providerMocks) {
      providerMock.verify(p => p.createEditor(parentMock.object, cdrMock.object), TypeMoq.Times.once());
      providerMock.verify(p => p.createEditor(TypeMoq.It.isAny(), TypeMoq.It.isAny()), TypeMoq.Times.once());
    }
  });

  it('should stop asking the providers as soon as the first provider created a component', () => {
    // Arrange
    const service: CdrRegistryService = TestBed.get(CdrRegistryService);
    const providerMocks = [
      TypeMoq.Mock.ofType<CdrEditorProvider>(),
      TypeMoq.Mock.ofType<CdrEditorProvider>(),
      TypeMoq.Mock.ofType<CdrEditorProvider>()
    ];
    const parentMock = TypeMoq.Mock.ofType<ViewContainerRef>();
    const cdrMock = TypeMoq.Mock.ofType<ColumnDependentReference>();

    for (const providerMock of providerMocks) {
      service.register(providerMock.object);
    }

    providerMocks[1].setup(p => p.createEditor(TypeMoq.It.isAny(), TypeMoq.It.isAny()))
      .returns(() => TypeMoq.Mock.ofType<ComponentRef<CdrEditor>>().object);
    providerMocks[2].setup(p => p.createEditor(TypeMoq.It.isAny(), TypeMoq.It.isAny()))
      .returns(() => null);

    // Act
    service.createEditor(parentMock.object, cdrMock.object);

    // Assert
    providerMocks[2].verify(p => p.createEditor(parentMock.object, cdrMock.object), TypeMoq.Times.once());
    providerMocks[1].verify(p => p.createEditor(parentMock.object, cdrMock.object), TypeMoq.Times.once());
    providerMocks[0].verify(p => p.createEditor(parentMock.object, cdrMock.object), TypeMoq.Times.never());
  });

  it('should continue with the next providers if one of them throws an error', () => {
    // Arrange
    const service: CdrRegistryService = TestBed.get(CdrRegistryService);
    const providerMocks = [
      TypeMoq.Mock.ofType<CdrEditorProvider>(),
      TypeMoq.Mock.ofType<CdrEditorProvider>(),
      TypeMoq.Mock.ofType<CdrEditorProvider>()
    ];
    providerMocks[2].setup(p => p.createEditor(TypeMoq.It.isAny(), TypeMoq.It.isAny())).throws(new Error('dummy'));

    const cdrMock = TypeMoq.Mock.ofType<ColumnDependentReference>();
    const parentMock = TypeMoq.Mock.ofType<ViewContainerRef>();

    for (const providerMock of providerMocks) {
      service.register(providerMock.object);
    }

    // Act
    service.createEditor(parentMock.object, cdrMock.object);

    // Assert
    for (const providerMock of providerMocks) {
      providerMock.verify(p => p.createEditor(parentMock.object, cdrMock.object), TypeMoq.Times.once());
      providerMock.verify(p => p.createEditor(TypeMoq.It.isAny(), TypeMoq.It.isAny()), TypeMoq.Times.once());
    }
  });
});
