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

import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class UserActionService {
  constructor(private errorHandler: ErrorHandler) {}

  public downloadData(data: string, fileName: string, contentType: string): void {
    try {
      const link = document.createElement('a');
      link.href = 'data:' + contentType + ',' + encodeURIComponent(data);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  public copy2Clipboard(data: string): void {
    try {
      const listener = (e: ClipboardEvent) => {
        const clipboard = e.clipboardData || (window as any).clipboardData;
        clipboard.setData('text', data);
        e.preventDefault();
      };
      document.addEventListener('copy', listener, false);
      document.execCommand('copy');
      document.removeEventListener('copy', listener, false);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }
}
