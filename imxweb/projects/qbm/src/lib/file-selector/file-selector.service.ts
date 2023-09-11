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
import { Subject } from 'rxjs';

import { ClassloggerService } from '../classlogger/classlogger.service';

@Injectable({
  providedIn: 'root'
})
export class FileSelectorService {
  public readonly fileFormatError = new Subject();
  public readonly fileSelected = new Subject<string>();

  constructor(private logger: ClassloggerService) { }

  public emitFiles(files: FileList, acceptedFileFormat: string): void {
    if (files == null || files.length === 0) {
      this.logger.debug(this, 'No file selected.');
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(acceptedFileFormat) == null) {
      this.logger.debug(this, 'Only the following file format(s) are supported:', acceptedFileFormat);
      this.fileFormatError.next();
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = () => {
      this.logger.debug(this, 'File selection done.');
      this.fileSelected.next(reader.result as string);
    };
  }
}
