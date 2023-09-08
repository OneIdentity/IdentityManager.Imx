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

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'imx-progressbar',
  templateUrl: './progressbar.component.html',
  styleUrls: ['./progressbar.component.scss']
})
export class ImxProgressbarComponent implements OnInit {

  @Input() public caption: string;
  @Input() public maxValue = 0;
  @Input() public value: number;
  @Input() public inPercent = false;

  public textVersion: string;
  public progressValue: number;


  public ngOnInit(): void {
    this.textVersion = this.maxValue === 0 ? '-' :
      this.inPercent ? (this.value / this.maxValue) * 100 + '%' : this.value + '/' + this.maxValue;

    this.progressValue = this.inPercent ? this.value : this.maxValue === 0 ? 0 : (this.value * 100 / this.maxValue);
  }
}
