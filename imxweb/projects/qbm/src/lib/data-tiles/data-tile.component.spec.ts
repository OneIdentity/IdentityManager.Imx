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
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By, SafeUrl } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiCoreModule } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { TypedEntity, IClientProperty, ValType } from 'imx-qbm-dbts';

import { DataTileComponent } from './data-tile.component';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';
import { Base64ImageService } from '../images/base64-image.service';
import { DataSourceItemStatus } from '../data-source-toolbar/data-source-item-status.interface';

const titleColumn = 'ApplicationName';
const subtitleColumn = 'LogonUser';
const tileTitle = 'ImxClient';
const tileSubtitle = 'IIS APPPOOL AppServer_POOL';

describe('DataTileComponent', () => {
  let component: DataTileComponent;
  let fixture: ComponentFixture<DataTileComponent>;
  let debug: DebugElement;

  let titleObject: IClientProperty = {
    ColumnName: titleColumn,
    Type: 6
  };

  let subtitleObject: IClientProperty = {
    ColumnName: subtitleColumn,
    Type: 6
  };

  const imageService = new class {
    imageUrl;
    readonly addBase64Prefix = __ => this.imageUrl;
  }();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [DataTileComponent],
      imports: [
        EuiCoreModule,
        MatBadgeModule,
        MatCardModule,
        MatTooltipModule,
        MatMenuModule,
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: Base64ImageService,
          useValue: imageService
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataTileComponent);
    component = fixture.componentInstance;

    component.typedEntity =
      {
        GetEntity: () => (
          {
            GetColumn: (colName: string) => (
              {
                GetDisplayValue: (builder) => {
                  switch (colName) {
                    case titleColumn: return tileTitle;
                    case subtitleColumn: return tileSubtitle;
                  }
                },
                GetValue: () => "value"
              }),
            GetDisplay: () => "Display value"
          })
      } as TypedEntity;

    debug = fixture.debugElement;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return a title', () => {
    let titleElement = debug.query(By.css('.imx-data-tile-title'));
    expect(titleElement).toBeNull();
    component.titleObject = titleObject;
    fixture.detectChanges();
    titleElement = debug.query(By.css('.imx-data-tile-title'));
    expect(titleElement.nativeElement.innerText).toEqual(tileTitle);
  });

  it('should return a subtitle', () => {
    let subtitleElement = debug.query(By.css('.imx-data-tile-subtitle'));
    expect(subtitleElement).toBeNull();
    component.subtitleObject = subtitleObject;
    fixture.detectChanges();
    subtitleElement = debug.query(By.css('.imx-data-tile-subtitle'));
    expect(subtitleElement.nativeElement.innerText).toEqual(tileSubtitle);
  });

  it('should toggle the selection', () => {
    spyOn(component.selectionChanged, 'emit');
    component.isSelectable = true;
    component.toggleSelection();
    fixture.detectChanges();
    expect(component.selectionChanged.emit).toHaveBeenCalledWith(component.typedEntity);
  });

  it('should not be selectable', () => {
    spyOn(component.selectionChanged, 'emit');
    component.isSelectable = false;
    component.toggleSelection();
    fixture.detectChanges();
    expect(component.selectionChanged.emit).toHaveBeenCalledTimes(0);
  });

  it('should not show the menu', () => {
    component.actions = null;
    fixture.detectChanges();
    let menuButtonElement = debug.query(By.css('button[mat-icon-button]'));
    expect(menuButtonElement).toBeNull();
  });

  it('should show the menu', () => {
    component.actions = [{ description: 'Action 1', name: 'action1' }];
    fixture.detectChanges();
    let menuButtonElement = debug.query(By.css('button[mat-icon-button]'));
    expect(menuButtonElement).toBeDefined();
  });

  for (const testcase of [
    {
      imageColumnName: 'bla',
      imageUrl: 'test.png',
      expectedImageUrl: 'test.png'
    },
    {
      imageColumnName: 'bla'
    },
    {
      imageUrl: 'test.png'
    }
  ]) {
    it(`should return the image ${testcase.expectedImageUrl}`, async () => {
      imageService.imageUrl = testcase.imageUrl;

      component.image = {
        Type: ValType.Binary,
        ColumnName: testcase.imageColumnName,
        IsValidColumnForFiltering: true,
      };

      await component.ngOnInit();

      expect(component.imageUrl).toEqual(testcase.expectedImageUrl);
    });
  }

  describe('should check if it has an image (or a fallback icon) - ', () => {
    [
      { description: 'has nothing', expected: false },
      { description: 'has an empty status', status: {}, expected: false },
      { description: 'has a status with an imagepath', status: { getImagePath: {} }, expected: true },
      { description: 'has an image', image: {}, expected: true },
      { description: 'has a fallback icon', fallbackIcon: 'some icon', expected: true }
    ].forEach(testcase =>
      it(`${testcase.description}`, () => {
       component.image = testcase.image as IClientProperty;
        component.status = testcase.status as DataSourceItemStatus;
       component.fallbackIcon = testcase.fallbackIcon;

        expect(component.hasImage).toEqual(testcase.expected);
      }));
  });


});
