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

import { TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EuiCoreModule } from '@elemental-ui/core';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { ImageSelectorDialogComponent } from './image-selector-dialog.component';
import { configureTestSuite } from 'ng-bullet';
import { ImageSelectorDialogParameter } from './image-selector-dialog-parameter.interface';
import { Base64ImageService, clearStylesFromDOM, FileSelectorService } from 'qbm';

describe('ImageSelectorDialogComponent', () => {
  const mockMatDialogRef = {
    close: jasmine.createSpy('close')
  };

  const dialogData: ImageSelectorDialogParameter = {
    title: 'some title',
    icons: {
      database: 'testUrl',
      application: 'some Url'
    },
    defaultIcon: 'database'
  };

  const fileSelector = {
    emitFiles: jasmine.createSpy('emitFiles'),
    fileFormatError: new Subject(),
    fileSelected: new Subject<string>(),
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        EuiCoreModule,
        MatCardModule,
        LoggerTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockMatDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData
        },
        {
          provide: FileSelectorService,
          useValue: fileSelector
        },
        {
          provide: Base64ImageService,
          useValue: {
            addBase64Prefix: jasmine.createSpy('addBase64Prefix')
          }
        }
      ],
      declarations: [
        ImageSelectorDialogComponent
      ]
    });
  });

  beforeEach(() => {
    fileSelector.emitFiles.calls.reset();
    mockMatDialogRef.close.calls.reset();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  function createComponentUnderTest() {
    const fixture = TestBed.createComponent(ImageSelectorDialogComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return component;
  }

  it('should provide the url for the selected icon and close the dialog on save', () => {
    const component = createComponentUnderTest();

    // Arrange
    component.selectIcon('application');

    // Act
    component.onSave();

    // Assert
    expect(mockMatDialogRef.close).toHaveBeenCalledWith({
      file: 'some Url'
    });
  });

  [
    {
      imageUrl: undefined,
      expected: { selectedIconName: dialogData.defaultIcon, selectedIcon: { iconName: dialogData.defaultIcon, url: dialogData.icons.database } }
    },
    {
      imageUrl: 'myUrl',
      expected: { selectedIcon: { url: 'myUrl' }, uploadedImageUrl: 'myUrl'  }
    }
  ].forEach(testcase =>
    it('should init', () => {
      // Arrange
      dialogData.imageUrl = testcase.imageUrl;

      // Act
      const component = createComponentUnderTest();

      // Assert
      expect(component['selectedIconName']).toEqual(testcase.expected.selectedIconName);
      expect(component.imageUrl).toBe(testcase.expected.uploadedImageUrl);
    }));

  it('should say if an icon is selected', () => {
    // Arrange
    const component = createComponentUnderTest();

    component.selectIcon('some iconName');

    // Act
    const isSelected = component.iconIsSelected('some iconName');

    // Assert
    expect(isSelected).toEqual(true);
  });

  it('should return true if the uploaded image is selected', () => {
    // Arrange
    const component = createComponentUnderTest();

    component.imageUrl = 'some url';

    component.selectImage();

    // Act
    const isSelected = component.imageIsSelected;

    // Assert
    expect(isSelected).toEqual(true);
  });

  it('should return false if the uploaded image is not selected', () => {
    // Arrange
    const component = createComponentUnderTest();

    component.imageUrl = 'some url';

    component.selectIcon('some iconName');

    // Act
    const isSelected = component.imageIsSelected;

    // Assert
    expect(isSelected).toEqual(false);
  });

  it('should select the provided image', () => {
    // Arrange
    const component = createComponentUnderTest();

    // Act
    component.selectImage('some url');

    // Assert
    expect(component.imageIsSelected).toEqual(true);
  });

  it('should select the provided icon', () => {
    // Arrange
    const component = createComponentUnderTest();

    // Act
    component.selectIcon('application');

    // Assert
    expect(component.iconIsSelected('application')).toEqual(true);
  });

  it('emitFiles calls ImageUploadService emitFiles', () => {
    const component = createComponentUnderTest();

    // Act
    component.emitFiles({} as FileList);

    // Assert
    expect(fileSelector.emitFiles).toHaveBeenCalled();
  });

  it('has a method that resets the file format error state', () => {
    const component = createComponentUnderTest();

    component.fileFormatError = true;

    // Act
    component.resetFileFormatErrorState();

    // Assert
    expect(component.fileFormatError).toEqual(false);
  });
});
