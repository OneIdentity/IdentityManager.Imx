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

import { Component, Input } from '@angular/core';

import { PortalItshopRequests } from 'imx-api-qer';
import { ParameterizedText } from 'qbm';

import { RequestDisplayInterface } from './request-display.interface';

@Component({
  templateUrl: './default-request-display.component.html',
  styleUrls: ['./default-request-display.component.scss']
})
export class DefaultRequestDisplayComponent implements RequestDisplayInterface {

  @Input() public readonly isReadOnly: boolean;

  private _pwo: PortalItshopRequests;
  public get personWantsOrg(): PortalItshopRequests {
    return this._pwo;
  }

  @Input() public set personWantsOrg(pwo: PortalItshopRequests) {
    this._pwo = pwo;
    this.setPText();
  }

  private additional: string;
  public get additionalText(): string {
    return this.additional;
  }
  @Input() public set additionalText(value: string) {
    this.additional = value;
  }

  public parameterizedText: ParameterizedText;

  private setPText() {
    if (this._pwo && this._pwo.Assignment?.value) {
      this.parameterizedText = {
        value: this._pwo.Assignment.value,
        marker: { start: '"%', end: '%"' },
        getParameterValue: columnName => {
          try {
            return this._pwo.GetEntity().GetColumn(columnName).GetDisplayValue();
          } catch {
            // parameter values may be embedded directly
            return columnName;
          }
        }
      };
    }
    else {
      this.parameterizedText = null;
    }
  }
}
