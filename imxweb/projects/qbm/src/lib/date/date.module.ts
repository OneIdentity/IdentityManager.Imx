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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';

import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule} from '@angular/cdk/overlay';

import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EuiCoreModule } from '@elemental-ui/core';

import { TranslateModule } from '@ngx-translate/core';

import { DateComponent } from './date/date.component';
import { CalendarComponent } from './date/calendar/calendar.component';
import { TimePickerComponent } from './date/time-picker/time-picker.component';
import { ShortDatePipe } from './short-date.pipe';
import { LocalizedDatePipe } from './localized-date.pipe';

@NgModule({
  declarations: [
    ShortDatePipe,
    LocalizedDatePipe,
    DateComponent,
    CalendarComponent,
    TimePickerComponent
  ],
  exports: [
    DateComponent,
    ShortDatePipe,
    LocalizedDatePipe
  ],
  imports: [
    A11yModule,
    CommonModule,
    EuiCoreModule,
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatDividerModule,
    MatIconModule,
    MatMomentDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    OverlayModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ]
})
export class DateModule { }
