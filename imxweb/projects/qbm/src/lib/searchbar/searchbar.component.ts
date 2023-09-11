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
 * Copyright 2023 One Identity LLC.
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

import { OverlayRef } from '@angular/cdk/overlay';
import {
  Component,
  OnInit, Input, ContentChild, TemplateRef, ElementRef, ViewChild, Output, EventEmitter, OnDestroy
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';
import { EuiLoadingService } from '@elemental-ui/core';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

import { TypedEntity } from 'imx-qbm-dbts';
import { imx_ISearchService } from './iSearchService';
import { Subscription } from 'rxjs';

@Component({
  selector: 'imx-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss']
})
export class SearchBarComponent implements OnInit, OnDestroy {

  public get autoCompleteIsFocused(): boolean {
    return this.autocompleteFocus;
  }
  public get filterIsFocused(): boolean {
    return this.filterFocus;
  }

  public readonly filterComponentId =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  public noEntriesVisible = false;
  public tableList: TypedEntity[] = [];
  public tables = new UntypedFormControl();
  public selectedTables: string[];
  public searchResults: any[] = [];

  @Input() public searchService: imx_ISearchService;
  @Input() public debounce = false;
  @Input() public debounceTime = 300;
  @Input() public watermark = '#LDS#Insert Text';
  @Output() public selectionChange = new EventEmitter<any>();

  @ContentChild('imxResultTemplate', /* TODO: add static flag */ {}) public resultTemplate: TemplateRef<ElementRef>;
  @ViewChild('tableSelect', { static: true }) public tableSelect: MatSelect;
  @ViewChild(MatAutocompleteTrigger, { static: true }) public autoCompleteTrigger: MatAutocompleteTrigger;

  private autocompleteFocus = false;
  private filterFocus = false;
  private term = '';
  private readonly subscriptions: Subscription[] = [];

  constructor(private busyService: EuiLoadingService) {
  }

  public async ngOnInit(): Promise<void> {
    let result: TypedEntity[];
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());

    try {
      result = await this.searchService.getIndexedTables();
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
    this.tableList = result;

    this.subscriptions.push(this.searchService.searchTermStream
      .pipe(
        debounceTime(this.debounceTime),
        distinctUntilChanged()
      )
      .subscribe(async (term: string) => {
        this.term = term;
        await this.searchInternal(term);
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  public search(term: string, evt?: KeyboardEvent): void {
    // trigger search after debounce or with Enter-Key
    if ((evt !== undefined && evt.key.toLocaleLowerCase() === 'enter') || this.debounce) {
      this.searchService.searchTermStream.next(term);
    }
  }

  public handleSelection(dataitem: MatAutocompleteSelectedEvent): void {
    this.selectionChange.emit(dataitem.option.value);
  }

  public ToJson(link: any): string {
    let json = JSON.stringify(link);

    if (json !== '{}') {
      return json;
    }

    json = '';
    Object.keys(link).forEach(key => (json += key + ': ' + link[key] + '\n'));

    return json.substring(0, json.length - 1);
  }

  public displayItem(item?: any): string | undefined {
    return item ? item.Display : undefined;
  }

  /* *** Event handling *** */

  public async searchInternal(item: string): Promise<void> {
    const selectedtables = this.selectedTables !== undefined && this.selectedTables.length > 0 ? this.selectedTables.join(',') : '';

    let result: TypedEntity[];
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());

    try {
      result = await this.searchService.search(item, selectedtables);
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
    this.searchResults = result;
    this.setNoEntriesVisibility();
  }

  public async selectedTableChanges(): Promise<void> {
    return this.searchInternal(this.term);
  }

  public onComponentLostFocus(_: FocusEvent): void {
    setTimeout(() => {
      if (!this.autocompleteFocus && !this.filterFocus && document.activeElement.id !== this.filterComponentId) {
        this.noEntriesVisible = false;
      }
    });
  }

  public onInputFocus(): void {
    setTimeout(() => {
      this.autocompleteFocus = true;

      this.setNoEntriesVisibility();
    });
  }

  public onInputLostFocus(): void {
    setTimeout(() => {
      this.autocompleteFocus = false;
    });
  }

  public onSelectFocus(): void {
    setTimeout(() => {
      this.filterFocus = true;
    });
  }

  public onSelectLostFocus(): void {
    setTimeout(() => {
      this.filterFocus = false;
    });
  }

  private setNoEntriesVisibility(): void {
    if (this.searchResults && this.searchResults.length > 0) {
      this.noEntriesVisible = false;
    } else if (this.term && this.term.length > 0) {
      this.noEntriesVisible = true;
    }
  }
}
