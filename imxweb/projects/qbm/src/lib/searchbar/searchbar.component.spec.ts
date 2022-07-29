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

import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { EuiCoreModule } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { SearchBarComponent } from './searchbar.component';
import { imx_ISearchService } from './iSearchService';
import { TypedEntity } from 'imx-qbm-dbts';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

@Injectable()
class TestSearchService implements imx_ISearchService {
  readonly searchTermStream = new Subject<string>();

  search(term: string, tables: string): Promise<any[]> {
    return Promise.resolve([term, tables]);
  }
  getIndexedTables(): Promise<TypedEntity[]> {
    return Promise.resolve([]);
  }

  GetTableDisplay(table: any): string {
    return table.DisplayNameSingular.value;
  }

  GetTableValue(table: any): string {
    return table.Display;
  }
}

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        }),
        NoopAnimationsModule,
        EuiCoreModule,
        MatIconModule,
        MatCardModule,
        MatListModule,
        MatAutocompleteModule,
        MatSelectModule,
        ReactiveFormsModule
      ],
      declarations: [SearchBarComponent]
    })
  });

  beforeEach(() => {
    const search = new TestSearchService();
    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    component.searchService = search;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('Search for "Versuch"', fakeAsync(() => {
    component.ngOnInit();
    tick(1000);
    fixture.detectChanges();
    component.debounce = true;
    component.search('Versuch');
    fixture.detectChanges();
    tick(component.debounceTime);
    fixture.detectChanges();
    expect(component.searchResults.length).toBeGreaterThan(0);
  }));

  it('Search for "Versuch with false Event keycode"', fakeAsync(() => {
    component.debounce = false;
    const evt = new KeyboardEvent('', { code: '14' });

    component.search('Versuch', evt);
    fixture.detectChanges();
    tick(component.debounceTime);
    fixture.detectChanges();
    expect(component.searchResults.length).toEqual(0);
  }));

  it('Has results after search', waitForAsync(() => {
    component.searchInternal('Versuch');
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.searchResults.length).toBeGreaterThan(0);
    });
  }));

  it('trigger search after the table selections changes', async () => {
    spyOn(component.searchService, 'search').and.callThrough();
    await component.selectedTableChanges();
    expect(component.searchService.search).toHaveBeenCalled();
  });

  it('trigger selectionChange-Event after select one item from the result dropdown', waitForAsync(() => {
    spyOn(component.selectionChange, 'emit');
    const expectedValue = 'bla';

    const selectedEventStub = {
      option: {
        value: expectedValue
      }
    } as MatAutocompleteSelectedEvent;
    component.handleSelection(selectedEventStub);
    expect(component.selectionChange.emit).toHaveBeenCalledWith(expectedValue);
  }));

  it('Build json string', () => {
    expect(component.ToJson({ test: 'test', versuch: 'versuchen' })).toBe('{"test":"test","versuch":"versuchen"}');
  });

  it('Build json string empty', () => {
    expect(component.ToJson({})).toBe('');
  });

  it('onComponentLostFocus remove focus from component', fakeAsync(() => {
    component.onComponentLostFocus(null);
    tick();
    expect(component.autoCompleteIsFocused).toBeFalsy();
  }));

  it('onInputFocus focuses input and autocomplete', fakeAsync(() => {
    component.onInputFocus();
    tick();
    expect(component.autoCompleteIsFocused).toBeTruthy();
  }));

  it('onInputLostFocus removes focus from component', fakeAsync(() => {
    component.onInputLostFocus();
    tick();
    expect(component.autoCompleteIsFocused).toBeFalsy();
  }));

  it('onSelectFocus', fakeAsync(() => {
    component.onSelectFocus();
    tick();
    expect(component['filterFocus']).toBeTruthy();
  }));

  it('onSelectLostFocus removes focus from filter', fakeAsync(() => {
    component.onSelectLostFocus();
    tick();
    expect(component.filterIsFocused).toBeFalsy();
  }));

  it('subscribes to the searchTermStream subject', async () => {
    expect(component.searchService.searchTermStream.observers.length).toEqual(0);
    await component.ngOnInit();
    fixture.detectChanges();
    expect(component.searchService.searchTermStream.observers.length).toEqual(1);
  });

  it('unsubscribes to the searchTermStream subject on destroy', async () => {
    await component.ngOnInit();
    expect(component.searchService.searchTermStream.observers.length).toEqual(1);

    component.ngOnDestroy();
    expect(component.searchService.searchTermStream.observers.length).toEqual(0);
  });
});
