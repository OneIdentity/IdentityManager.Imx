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

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { IClientProperty, IEntity, IReadValue } from 'imx-qbm-dbts';
import { buildAdditionalElementsString, ParameterizedText } from 'qbm';

@Component({
  selector: 'imx-attestation-display',
  templateUrl: './attestation-display.component.html',
  styleUrls: ['./attestation-display.component.scss']
})
export class AttestationDisplayComponent implements OnInit, OnChanges {
  public parameterizedText: ParameterizedText;
  public additionalText: string;

  @Input() public attestation: { UiText: IReadValue<string>, GetEntity: () => IEntity };
  @Input() public additionalColumns: IClientProperty[];

  public ngOnInit(): void {
    const entity = this.attestation.GetEntity();

    this.parameterizedText = {
      value: this.attestation.UiText.value || entity.GetDisplay(),
      marker: { start: '"%', end: '%"' },
      getParameterValue: columnName => entity.GetColumn(columnName).GetDisplayValue()
    };


  }

  public ngOnChanges(simple: SimpleChanges): void {
    if (simple.additionalColumns) {
      const entity = this.attestation.GetEntity();
      this.additionalText = buildAdditionalElementsString(entity, this.additionalColumns);
    }
  }
}
