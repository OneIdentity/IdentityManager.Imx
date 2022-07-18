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

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { CdkTableModule } from '@angular/cdk/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from 'ng-bullet';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ImxMatColumnComponent } from './MatColumn';
import { QbmModule } from '../qbm.module';
import { ImxExpandableItem } from './imx-data-source';

describe('imx_MatColumn', () => {
  let component: ImxMatColumnComponent<any>;
  let fixture: ComponentFixture<ImxMatColumnComponent<any>>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        LoggerTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        QbmModule,
        NoopAnimationsModule,
        MatTableModule,
        MatPaginatorModule,
        CdkTableModule
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImxMatColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  }));

  it('.getData with accessor is working', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    component.field = 'test';
    component.dataAccessor = (val: any, index: number, name: string) => {
      return val[name] + ' ' + name;
    };

    const value = component.getData(new ImxExpandableItem({ test: 'versuch' }, null, 0), 0);
    expect(value).toBe('versuch test');
  }));

  it('.getData without accessor is workin', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    component.field = 'test';
    const value = component.getData(new ImxExpandableItem({ test: 'versuch' }, null, 0), 0);
    expect(value).toBe('versuch');
  }));

  it('is calling events', () => {
    const test = new ImxExpandableItem({ test: 'versuch' }, null, 0);

    spyOn(component.itemExpanded, 'emit');
    spyOn(component.itemCollapsed, 'emit');
    component.buttonClicked(test);
    expect(component.itemExpanded.emit).toHaveBeenCalledWith(test);
    component.buttonClicked(test);
    expect(component.itemCollapsed.emit).toHaveBeenCalledWith(test);
  });

  it('is using right iconclass', () => {
    const test1 = new ImxExpandableItem({ test: 'Wurzeldummy' }, null, 0);
    const test2 = new ImxExpandableItem({ test: 'Normales Item' }, null, 1);

    // Wurzelknoten ist immer expandiert
    expect(component.ButtonClass(test1)).toBe('imx-small-right-margin cux-icon cux-icon--caret-right');

    // Im default fall wird die leere Klasse angezeigt
    expect(component.ButtonClass(test2)).toBe('imx-small-right-margin k-sprite');

    component.hasChildrenProvider = (date: any) => true;

    // Das Icon zum expandieren wird angezeigt
    expect(component.ButtonClass(test2)).toBe('imx-small-right-margin cux-icon cux-icon--caret-right');
    // anklicken simulieren
    component.buttonClicked(test2);
    // das Icon zum zusammenklappen wird angezeigt
    expect(component.ButtonClass(test2)).toBe('imx-small-right-margin cux-icon cux-icon--caret-down');
  });
});
