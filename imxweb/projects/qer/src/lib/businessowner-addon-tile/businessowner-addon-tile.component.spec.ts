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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';

import { BusinessOwnerAddOnTileComponent } from './businessowner-addon-tile.component';
import { clearStylesFromDOM } from 'qbm';

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
  @Input() public actionText: String
  @Input() public size: 'Square' | 'Tile' | 'Addon-Tile' | 'Overview' | 'Dashboard' | 'Large-Overview';
  @Input() public highlight: boolean;
  @Input() public contentType: 'Text' | 'Image' | 'Container';
  @Output() public click: any = new EventEmitter<any>();
}

describe('BusinessOwnerAddOnTileComponent', () => {
  let component: BusinessOwnerAddOnTileComponent;
  let fixture: ComponentFixture<BusinessOwnerAddOnTileComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        BusinessOwnerAddOnTileComponent,
        MockTileComponent
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessOwnerAddOnTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should run Action2', () => {

    // Arrange
    const squareActionSpy = spyOn(component.squareAction, 'emit');

    // Act
    component.Action2();

    // Arrange
    expect(squareActionSpy).toHaveBeenCalled();

  });
});
