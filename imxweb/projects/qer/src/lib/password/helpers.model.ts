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

import { PasswordItem } from './password-item';

export interface IColumn {
  id: string;
  title: string;
  getValue: (row: PasswordItem) => any;
}

export class Column implements IColumn {
  public id: string;
  public getValue: (row: PasswordItem) => any;
  public title: string;
}

export function GetLocalDataForPage<T>(allData: T[], state: { page: number, pageSize: number, skip: number }): T[] {
  if (state) {
    const currentIndex = state.page * state.pageSize;
    return allData.slice(currentIndex, currentIndex + state.pageSize);
  }

  return allData;
}
