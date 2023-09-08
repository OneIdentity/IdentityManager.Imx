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

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

import { ShapeData } from 'imx-api-qer';
import { BusyService, ShapeClickArgs } from 'qbm';
import { ObjectHyperviewService } from './object-hyperview.service';

@Component({
  selector: 'imx-object-hyperview',
  templateUrl: './object-hyperview.component.html',
  styleUrls: ['./object-hyperview.component.scss']
})
export class ObjectHyperviewComponent implements OnInit, OnChanges {
  /**
   * Sets the object type for the hyperview.
   */
  @Input() public objectType: string;

  /**
   * Sets the object UID for the hyperview.
   */
  @Input() public objectUid: string;

  /**
   * Sets an optional identifier of hyperview.
   */
  @Input() public hyperviewName: string;

  /**
   * Sets whether the hyperview is condensed or not
   */
  @Input() public condensed: true;

  /**
   * Occurs when user click on a shape link.
   */
  @Output() public selected: EventEmitter<ShapeClickArgs> = new EventEmitter();

  public get loadinghyperview() { return this.busy.isBusy; }
  public hyperviewShapes: ShapeData[] = [];
  private busy = new BusyService();

  /** Cache for shape data, using the hyperviewName as key. */
  private cached: Map<string, ShapeData[]> = new Map();

  constructor(
    private readonly objectHyperviewService: ObjectHyperviewService
    ) { }

    ngOnChanges(changes: SimpleChanges): void {
      if (changes.hyperviewName || changes.objectUid) {
        // is the data cached already?
        if (changes.hyperviewName && this.cached.has(this.hyperviewName)) {
          this.hyperviewShapes = this.cached.get(this.hyperviewName);
        }
        else {
          this.reload();
        }
      }
  }

  public async ngOnInit(): Promise<void> {
    this.reload();
  }

  private async reload(): Promise<void> {
    const busy = this.busy.beginBusy();
    this.hyperviewShapes = [];
    try {
      const name = this.hyperviewName;
      const shapes = await this.objectHyperviewService.get(this.objectType, this.objectUid, name);

      // put in the cache
      this.cached.set(name, shapes);

      // is it still the one we need?
      if (this.hyperviewName == name)
        this.hyperviewShapes = shapes;
    } finally {
      busy.endBusy();
    }
  }

}
