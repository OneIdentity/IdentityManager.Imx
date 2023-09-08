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

import { TestBed } from '@angular/core/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { FileSelectorService } from './file-selector.service';

describe('FileSelectorService', () => {
  let service: FileSelectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule
      ]
    });
    service = TestBed.inject(FileSelectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('emitFiles publishes file format error if file types mismatch', () => {
    // Arrange
    let fileFormatErrorIsSet;
    const fs = service.fileFormatError.subscribe(() => fileFormatErrorIsSet = true);

    const files = [new Blob([], { type: 'some file type' }) as File];

    // Act
    service.emitFiles(
      {
        length: files.length,
        item: (index) => files[index],
        0: files[0]
      },
      'some other file type'
    );

    // Assert
    expect(fileFormatErrorIsSet).toEqual(true);

    // Clean up
    fs.unsubscribe();
  });
});
