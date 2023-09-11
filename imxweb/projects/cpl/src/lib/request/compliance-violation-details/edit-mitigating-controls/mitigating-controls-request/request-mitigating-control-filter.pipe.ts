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

import { Pipe, PipeTransform } from '@angular/core';

import { MitigatingControlData } from './mitigating-control-data.interface';

@Pipe({
  name: 'filtered',
  pure: false,
})
export class RequestMitigatingControlFilterPipe implements PipeTransform {
  transform(items: MitigatingControlData[], filter: 'active' | 'inactive' | 'deferred'): any {
    if (!items || !filter) {
      return items;
    }
    // filter items array, items which match and return true will be
    // kept, false will be filtered out

    return RequestMitigatingControlFilterPipe.getItems(items, filter);
  }

  public static getItems(items: MitigatingControlData[], filter: 'active' | 'inactive' | 'deferred'): MitigatingControlData[] {
    switch (filter) {
      case 'active':
        return items.filter((elem) => !elem.isDeferredData && !elem.isInActive);
      case 'inactive':
        return items.filter((elem) => !elem.isDeferredData && elem.isInActive);
      case 'deferred':
        return items.filter((elem) => elem.isDeferredData);
    }
  }
}
