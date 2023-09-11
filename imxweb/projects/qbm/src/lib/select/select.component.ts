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
  Input,
  EventEmitter,
  Output,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  HostListener
} from '@angular/core';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { AbstractControl, UntypedFormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ClassloggerService } from '../classlogger/classlogger.service';
import { SelectContentProvider } from './select-content-provider.interface';
import { SelectDataSource } from './select-data-source';
import { DataNavigationParameters } from './data-navigation-parameters.interface';

/**
 * A component for selecting a single or multiple items from a candidate list using an autocomplete control.
 * The selected object(s)  is/are displayed as Mat-Chip(s) and can be removed using a remove icon.
 */
@Component({
  selector: 'imx-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent<T> implements AfterViewInit, OnChanges, OnDestroy {
  public readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  public readonly chipListCtrl = new UntypedFormControl('');
  public dataSource: SelectDataSource;
  public autocompleteVisible = false;

  /** Flag for multi select mode */
  @Input() public multi = false;

  /** The name of icon for the items shown in the autocomplete control. */
  @Input() public itemIcon: string;

  /** The candidate list for the selection */
  @Input() public items: T[] = [];

  /** The selected items */
  @Input() public itemsSelected: T[] = [];

  /** The text for the mat-label of the formcontrol */
  @Input() public label: string;

  /** The placeholder text of the autocomplete control */
  @Input() public placeholder: string;

  /** validation error message */
  @Input() public errorMessage: string;

  /** The form control of the component. */
  @Input() public formCtrl: AbstractControl;

  /** Provides methods for displaying the item content */
  @Input() public contentProvider: SelectContentProvider<T>;

  /** Indicates if data is loading and shows/hides the spinner. */
  @Input() public loading = false;

  /** @deprecated Not in use. Will be removed.
   * The virtual page size.
   * Must be set for calculating the height of the virtual sroll container.
   */
  @Input() public pageSize = 50;

  /** Indicates if Datasource is remote or local. */
  @Input() public isLocalDatasource = false;

  /** Indicates if the component is disabled = readonly */
  @Input() public disabled = false;

  @Input() public totalCount = 0;

  @Input() public labelAutoComplete: string;

  /** @deprecated Use needMoreData instead. Will be removed.
   * Fires when the component need new data, e.g. user scrolls to the end of the container.
   */
  @Output() public needData: EventEmitter<number> = new EventEmitter();

  /** Fires when the component need new data, e.g. user scrolls to the end of the container. */
  @Output() public needMoreData: EventEmitter<DataNavigationParameters> = new EventEmitter();

  /** @deprecated Will be removed.
   * Fires when the user types in the autocomplete input control.
   */
  @Output() public autocompleteValueChanged: EventEmitter<string> = new EventEmitter();

  private subscriptions: Subscription[] = [];
  private parameters: DataNavigationParameters = { navigation: { StartIndex: 0, PageSize: this.pageSize}};
  private originalItemsSelected: T[] = [];
  private canceling = false;

  constructor(private logger: ClassloggerService) {
    this.dataSource = new SelectDataSource(this.logger);
  }

  public ngAfterViewInit(): void {
    this.subscriptions.push(this.dataSource.needData.subscribe((startIndex: number) => {
      this.parameters.navigation.StartIndex = startIndex;
      this.needMoreData.emit(this.parameters);
      this.needData.emit(this.parameters.navigation.StartIndex);
    }));
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['itemsSelected'] && changes['itemsSelected'].currentValue && this.multi) {
      this.originalItemsSelected = this.itemsSelected.slice();
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Removes the specified item from the selection list.
   * @param item the item to remove.
   */
  public removeItem(item: T, event?: MouseEvent, ): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.disabled) {
      return;
    }

    let index = -1;

    if (this.contentProvider && this.contentProvider.key) {
      const itemKey = this.contentProvider.key(item);
      index = this.itemsSelected.findIndex(itemSelected => this.contentProvider.key(itemSelected) === itemKey);
    } else {
      index = this.itemsSelected.indexOf(item);
    }

    if (index >= 0) {
      this.logger.debug(this, 'Selection list, remove', item);
      this.itemsSelected.splice(index, 1);
      this.refreshFormControl();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  public onDocumentCancel(event: KeyboardEvent): void {
    if (this.multi) {
      this.itemsSelected = this.originalItemsSelected.slice();
      this.canceling = true;
    }
  }

  public showAutocomplete(): void {
    if (!this.disabled) {
      this.autocompleteVisible = true;
    }
  }

  public onAutocompleteValueChanged(event: string): void {
    if (event == null) {
      this.parameters.navigation.StartIndex = 0;
      this.parameters.navigation.filter = undefined;
      this.parameters.navigation.search = undefined;
    }

    this.parameters.keyword = event;
    this.needMoreData.emit(this.parameters);
    this.autocompleteValueChanged.emit(this.parameters.keyword);
  }

  public onAutocompleteClosing(): void {
    this.autocompleteVisible = false;
    this.dataSource.reset();
    this.parameters.keyword = '';
    this.parameters.navigation.StartIndex = 0;
    this.parameters.navigation.filter = undefined;
    this.parameters.navigation.search = undefined;

    if (this.multi && !this.canceling) {
      this.originalItemsSelected = this.itemsSelected.slice();
    }

    this.canceling = false;
  }

  public refreshFormControl(): void {
    this.formCtrl.setValue(this.itemsSelected);
    this.formCtrl.markAsDirty();
  }
}
