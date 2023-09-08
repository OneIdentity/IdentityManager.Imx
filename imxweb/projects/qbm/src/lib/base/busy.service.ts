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

import { EventEmitter, Injectable } from "@angular/core";

export interface Busy {
  endBusy: (forceEnd?: boolean) => void;
}

/** Service that maintains a busy state. Several clients can start and end busy sections
 * independently.
 */
@Injectable({
  providedIn: 'root',
})
export class BusyService {

  /** Returns false if and only if there are no active busy sections. */
  public get isBusy() { return this.busyCounter > 0; }

  private busyCounter = 0;

  /** Begins a busy section. Returns a section that can be
   * ended to mark the end of the busy section.
   */
  beginBusy(): Busy {
    this.busyCounter++;
    if (this.busyCounter >= 1)
      this.busyStateChanged.emit(true);
    var isEnded = false;
    return {
      endBusy: (forceEnd?: boolean) => {
        // section can only be ended once.
        if (isEnded)
          return;
        isEnded = true;
        this.busyCounter = forceEnd ? 0 : this.busyCounter-1;
        if (this.busyCounter <= 0)
          this.busyStateChanged.emit(false);
      }
    };
  }

  public readonly busyStateChanged: EventEmitter<boolean> = new EventEmitter();
}
