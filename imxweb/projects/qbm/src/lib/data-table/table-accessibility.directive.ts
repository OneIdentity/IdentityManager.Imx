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

import { AfterViewChecked, AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[tableAccessiblility]',
})
export class TableAccessiblilityDirective implements AfterViewChecked, AfterViewInit {
  private maxrow: number;
  private maxcol: number;
  constructor(private el: ElementRef) {}

  ngAfterViewChecked(): void {
    this.setTabindex();
    this.updateCellData();
  }

  ngAfterViewInit(): void {
    this.addKeydownEventListener();
  }

  // Set data-row and data-col attribute to all selectable cells
  private updateCellData(): void {
    const tableRows = this.el.nativeElement.querySelectorAll('tbody tr');
    let row = 0;
    let col = 0;
    this.maxrow = tableRows.length - 1;
    this.maxcol = 0;

    tableRows.forEach((gridrow) => {
      gridrow.querySelectorAll('td:not(.mat-column-select)').forEach((element) => {
        element.dataset.row = `${row}`;
        element.dataset.col = `${col}`;
        col++;
      });
      if (col > this.maxcol) {
        this.maxcol = col - 1;
      }
      col = 0;
      row++;
    });
  }
  // Set tabindex for the first cell on the first row if there is not another tabindex set already
  private setTabindex():void{
    const selectables = this.el.nativeElement.querySelectorAll('tbody td:not(.mat-column-select)');
    const tabIndexes = this.el.nativeElement.querySelectorAll('tbody td[tabindex="0"]');
    if (tabIndexes.length === 0) {
      selectables[0]?.setAttribute('tabindex', 0);
    }
  }
  // Move focus to the new selected cell
  private moveFocusTo(newRow, newcol): boolean {
    const targetCell = this.el.nativeElement.querySelector(`[data-row="${newRow}"][data-col="${newcol}"]`);
    if (targetCell?.getAttribute('role') === 'gridcell') {
      document.querySelectorAll('[role=gridcell]').forEach((el) => {
        el.setAttribute('tabindex', '-1');
      });
      targetCell.setAttribute('tabindex', '0');
      targetCell.focus();
      return true;
    } else {
      return false;
    }
  }
  // Call proper move function base on the event key
  private addKeydownEventListener(): void {
    this.el.nativeElement.addEventListener('keydown', (event) => {
      const col = parseInt(event.target.dataset.col, 10);
      const row = parseInt(event.target.dataset.row, 10);
      switch (event.key) {
        case 'ArrowRight': {
          this.moveArrowRight(row, col);
          break;
        }
        case 'ArrowLeft': {
          this.moveArrowLeft(row, col);
          break;
        }
        case 'ArrowDown':
          this.moveFocusTo(row + 1, col);
          break;
        case 'ArrowUp':
          this.moveFocusTo(row - 1, col);
          break;
        case 'Home': {
          this.moveHome(event, row)
          break;
        }
        case 'End': {
          this.moveEnd(event, row);
          break;
        }
        case 'PageUp': {
          this.movePageUp(col);
          break;
        }
        case 'PageDown': {
          this.movePageDown(col);
          break;
        }
      }
    });
  }
  // Focus the cell right to the current cell, if its the last selectable cell then move to the next rows last cell
  private moveArrowRight(row:number, col: number):void{
    const newRow = col === this.maxcol ? row + 1 : row;
    const newcol = col === this.maxcol ? 0 : col + 1;
    this.moveFocusTo(newRow, newcol);
  }
  // Focus the cell left to the current cell, if its the first selectable cell then move to the previous rows last cell
  private moveArrowLeft(row:number, col: number):void{
    const newRow = col === 0 ? row - 1 : row;
    const newcol = col === 0 ? this.maxcol : col - 1;
    this.moveFocusTo(newRow, newcol);
  }
  // If you click CTRL + Home than focus the first cell of the first column, else first cell of the current column
  private moveHome(event: KeyboardEvent, row:number):void{
    if (event.ctrlKey) {
      let newRow = 0;
      let result;
      do {
        let newCol = 0;
        do {
          result = this.moveFocusTo(newRow, newCol);
          newCol++;
        } while (!result);
        newRow++;
      } while (!result);
    } else {
      this.moveFocusTo(row, 0);
    }
    event.preventDefault();
  }
  // If you click CTRL + End than focus the last cell of the last column, else last cell of the current column
  private moveEnd(event: KeyboardEvent, row:number):void{
    if (event.ctrlKey) {
      let newRow = this.maxrow;
      let result;
      do {
        let newCol = this.maxcol;
        do {
          result = this.moveFocusTo(newRow, newCol);
          newCol--;
        } while (!result);
        newRow--;
      } while (!result);
    } else {
      this.moveFocusTo(
        row,
        this.maxcol
      );
    }
    event.preventDefault();
  }
  // Focus the first cell of the current column
  private movePageUp(col: number):void{
    let newRow = 0;
    let result;
    do {
      result = this.moveFocusTo(newRow, col);
      newRow++;
    } while (!result);
  }
  // Focus the last cell of the current column
  private movePageDown(col: number):void{
    let newRow = this.maxrow;
    let result;
    do {
      result = this.moveFocusTo(newRow, col);
      newRow--;
    } while (!result);
  }
}
