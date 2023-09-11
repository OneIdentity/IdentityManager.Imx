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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ParameterizedText } from './parameterized-text.interface';
import { ParameterizedTextService } from './parameterized-text.service';
import { TextToken } from './text-token.interface';

@Component({
  selector: 'imx-parameterized-text',
  templateUrl: './parameterized-text.component.html',
  styleUrls: ['./parameterized-text.component.scss']
})
export class ParameterizedTextComponent implements OnInit {
  public textTokens: TextToken[];

  @Input() parameterizedText: ParameterizedText;
  @Output() textReady = new EventEmitter<TextToken[]>();

  constructor(private readonly service: ParameterizedTextService) { }

  public ngOnInit(): void {
    this.textTokens = this.service.createTextTokens(this.parameterizedText);
    this.textReady.emit(this.textTokens);
  }
}
