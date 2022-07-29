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
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { configureTestSuite } from 'ng-bullet';
import { EuiCoreModule } from '@elemental-ui/core';
import * as CadenceIcons from '@elemental-ui/cadence-icon/codepoints';

import { FilterTileComponent } from './filter-tile.component';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

describe('FilterTileComponent', () => {
  let component: FilterTileComponent;
  let fixture: ComponentFixture<FilterTileComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatCardModule,
        MatCheckboxModule,
        EuiCoreModule
      ],
      declarations: [
        FilterTileComponent
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterTileComponent);
    component = fixture.componentInstance;
    component.icon = Object.keys(CadenceIcons)[0];
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('can toggle checked', () => {
    const checkSpy = spyOn(component.checkedChanged, 'emit');
    expect(component.isChecked).toBe(false); // Ist zu beginn nicht ausgewählt

    component.cardSelected(); // Selektieren
    fixture.detectChanges();
    expect(component.isChecked).toBe(true); // ist jetzt selektiert
    expect(component.cardClass).toBe('mat-card FilterMatCardChecked');
    expect(component.contentClass).toBe('FilterContentClassChecked');

    component.cardSelected(); // erneut selektieren
    fixture.detectChanges();
    expect(component.isChecked).toBe(false); // ist nicht mehr selektiert
    expect(component.cardClass).toBe('mat-card FilterMatCard');
    expect(component.contentClass).toBe('FilterContentClass');

    expect(checkSpy).toHaveBeenCalledTimes(2);
  });
});
