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

import { ParameterReplacement } from './parameter-replacement.interface';
import { ParameterizedText } from './parameterized-text.interface';
import { TextToken } from './text-token.interface';

@Injectable({
  providedIn: 'root'
})
export class ParameterizedTextService {
  public createTextTokens(text: ParameterizedText): TextToken[] {
    const parameters = this.getParametersWithMatchingValue(text);

    const output = [];

    let part = text.value;
    for (const parameter of parameters) {  
      const tokens = part.split(parameter.delimiter);

      const head = tokens[0];
      const tail = tokens.splice(1).join(parameter.delimiter);

      if (head?.length > 0) {
        output.push({ value: head });
      }

      output.push({ value: parameter.replacement, isParameter: true });

      part = tail;
    }

    if (part?.length > 0) {
      output.push({ value: part });
    }

    return output;
  }

  private getParametersWithMatchingValue(text: ParameterizedText): ParameterReplacement[] {
    const re = new RegExp('(' + text.marker.start + '[^"]+' + text.marker.end + ')', 'g');
    return (text.value.match(re) ?? [])
      .map(parameter => ({
        delimiter: parameter,
        replacement: text.getParameterValue(parameter.split(text.marker.start).join('').split(text.marker.end).join(''))
      }))
      .filter(parameter => parameter.replacement != null);
  }
}
