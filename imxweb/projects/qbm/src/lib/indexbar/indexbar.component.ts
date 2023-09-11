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

@Component({
    templateUrl: "./indexbar.component.html",
    selector: "imx-indexbar"
})
export class IndexBarComponent {
    // TODO replace VI_Common_Color_Gray, VI_Common_Color_Badge_Important,VI_Common_Color_Badge_Success,VI_Common_Color_Badge_Warning

    ColorFilling(): string {
        return (this.IsHigh() ? this.ColorHigh() : (this.IsLow() ? this.ColorLow() : this.ColorMedium()));
    }

    Container1Style(): string {
        return this.HasFlexibleProgressbar
            ? ''
            : `display: inline-block; min-width:${this.TotalWidth()}px;`
    }

    Container2Style(): string {
        return `width: calc(100% - ${this.LabelWidth + 2}px); height: 14px; border: solid 1px %VI_Common_Color_Gray%; display:inline-block;`;
    }

    Container3Style(): string {
        const f = this.ColorFilling();
        return `background-color: ${f}; color: ${f}; display: block; overflow: hidden; width: ${this.Percentage()}%; height: 14px;`;
    }

    Label1Style(): string {
        return `vertical-align: top; text-align:right; float:right; width:${this.LabelWidth}px;`;
    }

    ColorHigh(): string {
        return this.EffectiveWarningOnHighValues()
            ? '%VI_Common_Color_Badge_Important%'
            : '%VI_Common_Color_Badge_Success%';
    }

    ColorLow(): string {
        return this.EffectiveWarningOnHighValues()
            ? '%VI_Common_Color_Badge_Success%'
            : '%VI_Common_Color_Badge_Important%';
    }

    ColorMedium(): string {
        return "%VI_Common_Color_Badge_Warning%";
    }

    EffectiveLabel(): string {
        return this.Label || this.Percentage() + " %";
    }

    EffectiveProgress(): number {
        return this.Progress < 0.0 ? 0.0 : (this.Progress > 1.0 ? 1.0 : this.Progress);
    }

    EffectiveWarningOnHighValues(): boolean {
        return this.WarningOnHighValues;
    }

    IsHigh(): boolean {
        return this.EffectiveProgress() > this.UpperLimit;
    }

    IsLow(): boolean {
        return this.EffectiveProgress() <= this.LowerLimit;
    }

    Percentage(): number {
        return Math.floor(100.0 * this.EffectiveProgress());
    }

    TotalWidth(): number {
        return this.LabelWidth >= 0
            ? this.ProgressbarWidth + this.LabelWidth + 2
            : this.ProgressbarWidth;
    }

    /** Optional value overriding the default label text that displays the progress percentage. */
    @Input() Label: string;

    @Input() LabelWidth: number = 35;

    /** Optional. Specify a value if you want to override default lower limit of 0.25
     * Progress values that are less or equal to this value will be marked with the lower color. */
    @Input() LowerLimit: number = 0.25;

    /** The progress as double value between 0.0  (0%) and 1.0 (100%) */
    @Input() Progress: number;

    @Input() Tooltip: string;

    /** Optional. Specify a value if you want to override the default upper limit of 0.5
     * Progress values that are greater than this value will be marked with the high color. */
    @Input() UpperLimit: number;

    /** Default behaviour is to apply warning colors for low values (high values are good, low values are bad).
     * You can (optionally) specify WarningOnHighValues = true, if you want to invert this behavior. */
    @Input() WarningOnHighValues: boolean;

    /** Default value is 50 (meaning 50 px). If HasFlexibleProgressbar()=true this width will be ignored and the remaining space will be used. */
    @Input() ProgressbarWidth: number = 50;

    /** Default value is true (meaning the progress bar has a flexible width, if set to false it has a fixed width - see ProgressBarWidth()) */
    @Input() HasFlexibleProgressbar: boolean = true;

}