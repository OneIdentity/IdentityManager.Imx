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


import { Input, Output, Component, EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';

import { ChartTileComponent } from './chart-tile.component';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

@Component({
  selector: 'imx-tile',
  template: '<p>MockTileComponent</p>'
})
class MockTileComponent {
  @Input() public caption: string;
  @Input() public value: string;
  @Input() public imageType: 'Url' | 'IconFont';
  @Input() public identifier: string;
  @Input() public image: String
  @Input() public size: 'Square' | 'Tile' | 'Addon-Tile' | 'Overview' | 'Dashboard' | 'Large-Overview';
  @Input() public highlight: boolean;
  @Input() public contentType: 'Text' | 'Image' | 'Container';
  @Output() public click: any = new EventEmitter<any>();
}

describe('ChartTileComponent', () => {
  let component: ChartTileComponent;
  let fixture: ComponentFixture<ChartTileComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ChartTileComponent,
        MockTileComponent
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the chart', () => {
    // Arrange
    const clickSpy = spyOn(component.actionClick, 'emit');

    // Act
    component.openChart();

    // Assert
    expect(clickSpy).toHaveBeenCalled();
  });
});
