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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShoppingCartValidationDetailService } from './shopping-cart-validation-detail.service';
import { BaseViewerComponent } from './base-viewer/base-viewer.component';
import { ExclusionCheckComponent } from './exclusion-check/exclusion-check.component';
import { DetailViewerComponent } from './detail-viewer/detail-viewer.component';
import { DuplicateCheckComponent } from './duplicate-check/duplicate-check.component';
import { LdsReplaceModule } from 'qbm';
import { TranslateModule } from '@ngx-translate/core';
import { ProductDependencyCheckComponent } from './product-dependency-check/product-dependency-check.component';

@NgModule({
  declarations: [BaseViewerComponent, ExclusionCheckComponent, DetailViewerComponent, DuplicateCheckComponent, ProductDependencyCheckComponent],
  imports: [
    CommonModule,
    TranslateModule,
    LdsReplaceModule
  ],
  providers: [
    ShoppingCartValidationDetailService
  ],
  exports: [ExclusionCheckComponent, DetailViewerComponent, DuplicateCheckComponent, BaseViewerComponent]
})
export class ShoppingCartValidationDetailModule { }
