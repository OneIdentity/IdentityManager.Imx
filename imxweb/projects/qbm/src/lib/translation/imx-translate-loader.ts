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

import { Observable, from } from 'rxjs';
import { Injectable } from '@angular/core';
import { TranslateLoader} from '@ngx-translate/core';
import { imx_SessionService } from '../session/imx-session.service';

@Injectable()
export class ImxTranslateLoader implements TranslateLoader {
  constructor(private session: imx_SessionService) {}

  public getTranslation(culture: string): Observable<any> {
    return from(this.getCaptionsLds(culture));
  }

  private async getCaptionsLds(culture: string): Promise<{ [key: string]: string }> {
    const translations = await this.session.Client.imx_multilanguage_getcaptions_get({ cultureName: culture });
    const translationsLds: { [key: string]: string } = {};
    Object.keys(translations).forEach((key: string) => translationsLds['#LDS#' + key] = translations[key]);
    return translationsLds;
  }
}
