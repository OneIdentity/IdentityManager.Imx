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

import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { AppConfigService } from "../appConfig/appConfig.service";

@Injectable({
  providedIn: "root"
})
export class ModelCssService {
  constructor(@Inject(DOCUMENT) private readonly document: Document,
    private readonly appConfig: AppConfigService) { }

  /** Loads the model stylesheet into the document, unless it has already
   * been loaded.    */
  public loadModelCss() {

    const id = 'imx-model-css';
    const existing = this.document.getElementById(id);

    // already loaded?
    if (existing)
      return;

    const head = this.document.getElementsByTagName('head')[0];

    const style = this.document.createElement('link');
    style.id = id;
    style.rel = 'stylesheet';
    style.href = this.appConfig.BaseUrl + "/imx/modelcss";

    head.appendChild(style);
  }

}