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

import {
  Component,
  ViewChild,
  AfterViewInit,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChildren,
  QueryList
} from '@angular/core';
import { MatAutocompleteTrigger, MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatCheckboxChange, MatCheckbox } from '@angular/material/checkbox';
import { PageEvent } from '@angular/material/paginator';
import { UntypedFormControl, AbstractControl, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map, debounceTime } from 'rxjs/operators';

import { ClassloggerService } from '../classlogger/classlogger.service';
import { SelectDataSource } from './select-data-source';
import { SelectContentProvider } from './select-content-provider.interface';

@Component({
  selector: 'imx-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss']
})
export class AutocompleteComponent<T> implements AfterViewInit, OnChanges {
  /** Reference to the autocomplete component. */
  public readonly autocompleteCtrl = new UntypedFormControl('', this.checkAutocompleteValidator());

  /** Height of an item in the dropdown panel in px. Needed for virtual scrolling.   */
  public readonly itemSize = 48;

  /** Needed fpr search if the component uses a local datasource */
  public filteredDatasource: Observable<any[]>;

  /** The candidate list for the selection */
  @Input() public items: T[] = [];

  /** The datasource of the component */
  @Input() public dataSource: SelectDataSource;

  /** The name of icon for the items shown in the autocomplete control. */
  @Input() public itemIcon: string;

  /** The label of the input box */
  @Input() public label = '';

  /** Flag for multi select mode */
  @Input() public multi = false;

  /** Selected items */
  @Input() public itemsSelected: T[] = [];

  /** Indicates if Datasource is remote or local. */
  @Input() public isLocalDatasource = false;

  /** Provides methods for displaying the item content */
  @Input() public contentProvider: SelectContentProvider<T>;

  @Input() public pageSize = 50;

  @Input() public totalCount = 0;

  /** validation error message */
  @Input() public errorMessage: string;

  /** Fires when the form needs a refresh. */
  @Output() public refreshForm: EventEmitter<any> = new EventEmitter();

  /** Fires when the user types in the autocomplete input control. */
  @Output() public autocompleteValueChanged: EventEmitter<string> = new EventEmitter();

  /** Fires when the component needs a reset, e.g. user selects an entry. */
  @Output() public needReset: EventEmitter<boolean> = new EventEmitter();

  /** Indicates that the component wants to close */
  @Output() public closing: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('auto', { static: true }) public autocomplete: MatAutocomplete;

  /** Reference to the {@link MatAutocompleteTrigger} */
  @ViewChild('trigger', { static: true }) public autocompleteTrigger: MatAutocompleteTrigger;

  /** Reference to the input control. */
  @ViewChild('inputCtrl', { static: true }) public inputCtrl: ElementRef;

  @ViewChildren(MatCheckbox) public checkboxCtrls: QueryList<MatCheckbox>;

  private readonly debounceTime = 500;

  constructor(private logger: ClassloggerService) {
    this.autocompleteCtrl.valueChanges.pipe(debounceTime(this.debounceTime)).subscribe(value => {

      if (!this.isLocalDatasource) {
        this.dataSource.reset();
      }

      this.autocompleteValueChanged.emit(value);
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {

    if (changes['items'] && changes['items'].currentValue) {
      this.dataSource.setData(this.items);

      if (this.isLocalDatasource) {
        this.totalCount = this.dataSource.rawData.length;
        this.filteredDatasource = this.autocompleteCtrl.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filter(value))
          );
      }
    }
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      this.autocompleteTrigger.openPanel();
      this.inputCtrl.nativeElement.focus();
    });

  }

  public onChecked(event: MatCheckboxChange, selectedItem: T): void {
    this.applyMultiSelect(event.checked, selectedItem);
  }

  public onCheckboxClicked(event: MouseEvent): void {
    event.stopPropagation();
  }

  public onPage(event: PageEvent): void {
    this.dataSource.getData(event.pageIndex * event.pageSize);
  }

  public onCancel(): void {
    this.close();
  }

  public onFocusout(event: FocusEvent): void {
    if (!this.autocomplete.isOpen) {
      this.close();
      return;
    }
  }

  /**
   * Called when an item was selected, to push this item to the selection list.
   * @param event the caller
   */
  public selectSingleItem(event: MatAutocompleteSelectedEvent): void {
    this.applySingleSelect(event.option.value);
  }

  public panelClosing(): void {
    this.close();
  }

  public itemSelected(selectedItem: T): boolean {
    return this.itemsSelected.findIndex(item => this.contentProvider.key(item) === this.contentProvider.key(selectedItem)) >= 0;
  }

  private close(): void {
    this.closing.emit(true);
    this.autocompleteValueChanged.emit('');
    this.inputCtrl.nativeElement.click();
  }

  private applySingleSelect(selectedItem: T): void {
    if (selectedItem == null || typeof (selectedItem) === 'string' || this.multi) {
      return;
    }

    if (this.itemsSelected.findIndex(item => this.contentProvider.key(selectedItem) === this.contentProvider.key(item)) < 0) {
      this.itemsSelected.splice(0);
      this.itemsSelected.push(selectedItem);
      this.refreshForm.emit();

      if (!this.isLocalDatasource) {
        this.dataSource.reset();
      }
    }

    this.clearAutocompleteCtrl();
  }

  private applyMultiSelect(checked: boolean, selectedItem: T): void {
    if (selectedItem == null || typeof (selectedItem) === 'string') {
      return;
    }

    const index = this.itemsSelected
      .findIndex(item => this.contentProvider.key(selectedItem) === this.contentProvider.key(item));

    if (index === -1 && checked) {
      this.itemsSelected.push(selectedItem);
    } else if (index >= 0 && !checked) {
      this.itemsSelected.splice(index, 1);
    }
    this.inputCtrl.nativeElement.click();
    this.refreshForm.emit();
  }

  private clearAutocompleteCtrl(): void {
    this.inputCtrl.nativeElement.value = '';
    this.autocompleteCtrl.setValue(undefined);
  }

  private filter(value: string | T): T[] {

    if (typeof (value) !== 'string') {
      return;
    }

    return this.dataSource.rawData.filter(option => this.contentProvider.display(option).toLowerCase().includes(value.toLowerCase()));
  }

  private checkAutocompleteValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (control == null || control.value == null || this.dataSource == null) {
        return null;
      }

      if (this.dataSource.rawData != null && this.dataSource.rawData.length > 0) {
        return null;
      }

      return { checkAutocomplete: true };
    };
  }

}
