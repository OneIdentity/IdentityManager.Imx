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

import { Injectable } from '@angular/core';

import { IExtension } from './extension';

@Injectable()
export class ExtService {

  public get Registry(): { [id: string]: IExtension[]; } { return this.registry; }

  private registry: { [id: string]: IExtension[]; } = {};

  public register(key: string, obj: IExtension): void {
    if (!this.registry[key]) {
      this.registry[key] = [];
    }
    this.registry[key].push(obj);
  }

  public async getFittingComponents<T extends IExtension>(key: string, filter: (ext: T) => Promise<boolean>): Promise<T[]> {
    const ret: T[] = [];
    const ext = this.registry[key];
    if (!ext) { return []; }
    for (const part of ext) {
      const t = part as T;
      if (t && await filter(t)) {
        ret.push(t);
      }
    }
    return ret;
  }
  public async getFittingComponent<T extends IExtension>(key: string): Promise<T> {
    if (this.registry[key]) {
      return this.registry[key][0] as T;
    } else {
      return null;
    }
  }

}

