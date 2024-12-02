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
 * Copyright 2024 One Identity LLC.
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
import { DateAdapter } from '@angular/material/core';
import { DefaultServiceResolver, EntitySchema, ITranslationProvider, MultiLanguageStringData } from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment-timezone';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Router } from '@angular/router';
import { AppConfigService } from '../appConfig/appConfig.service';
import { LdsReplacePipe } from '../lds-replace/lds-replace.pipe';
import { TextContainer } from './text-container';

@Injectable({
  providedIn: 'root',
})
export class ImxTranslationProviderService implements ITranslationProvider {
  private multilanguageTranslationDict: { [key: string]: { [key: string]: string } } = {};
  private culture: string;
  private cultureFormat: string;

  constructor(
    private appConfig: AppConfigService,
    private translateService: TranslateService,
    private readonly ldsReplace: LdsReplacePipe,
    private readonly dateAdapter: DateAdapter<any>,
  ) {}

  public get Culture(): string {
    return this.culture;
  }

  public get CultureFormat(): string {
    return this.cultureFormat;
  }

  public async init(
    culture: string | undefined = this.translateService.getBrowserCultureLang(),
    cultureFormat: string | undefined = this.translateService.getBrowserCultureLang(),
  ): Promise<void> {
    const defaultLang = this.translateService.getDefaultLang();
    // Get filtered cultures that are available to frontends and set to english if culture (browser language) is not supported
    const cultures = await this.appConfig.client.imx_multilanguage_uicultures_get({
      filter: [{ ColumnName: 'Ident_DialogCulture', Value1: culture }],
    });
    if (cultures.TotalCount === 0) {
      culture = 'en-US';
    }

    if (culture && defaultLang !== culture) {
      this.translateService.setDefaultLang(culture);
    }

    if (culture && this.translateService.currentLang !== culture) {
      await this.translateService.use(culture).toPromise();
    }
    this.cultureFormat = cultureFormat ?? '';
    this.dateAdapter.setLocale(this.cultureFormat);
    moment.locale(this.cultureFormat);

    if (this.culture != null && this.culture === culture) {
      return;
    }

    this.culture = culture ?? 'en-US';

    this.multilanguageTranslationDict = await this.appConfig.client.imx_multilanguage_translations_get('all', {
      cultureName: this.culture,
    });

    // use this translator as the default in dbts
    DefaultServiceResolver.UseTranslator(this);

    // reload schemas
    await this.appConfig.client.loadSchema(culture);
  }

  /**
   * Reinit when language is changed from the profile settings
   * @param culture language to reinit with
   * @param cultureFormat date formating to reinit with
   */
  public async reinit(culture: string, cultureFormat: string, router: Router) {
    this.culture = culture;
    this.cultureFormat = cultureFormat;
    await this.translateService.use(this.culture).toPromise();
    this.dateAdapter.setLocale(this.cultureFormat);
    moment.locale(this.cultureFormat);
    this.multilanguageTranslationDict = await this.appConfig.client.imx_multilanguage_translations_get('all', {
      cultureName: this.culture,
    });
    DefaultServiceResolver.UseTranslator(this);
    await this.appConfig.client.loadSchema(this.culture);

    // We may have stale data or schemas from the current page, so we nav back to refresh existing components
    let currentUrl = router.url;
    router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      router.navigate([currentUrl]);
    });
  }

  public GetTranslation(key: MultiLanguageStringData): string {
    const uidColumn = this.multilanguageTranslationDict[key.UidColumn ?? ''];
    return (uidColumn ? uidColumn[key.Key ?? ''] : key.Key) ?? '';
  }

  public Translate(text: TextContainer | string): Observable<string> {
    if (typeof text == 'string') {
      return this.translateService.get(text);
    }

    const translation = this.translateService.get(text.key);

    if (text.parameters) {
      const params = text.parameters ?? [];
      return translation.pipe(map((translatedValue: any) => this.ldsReplace.transform(translatedValue, ...params)));
    }

    return translation;
  }

  /**
   * @deprecated Use the column's display from the schema.
   */
  public GetColumnDisplay(name: string, entitySchema: EntitySchema): string {
    const column = entitySchema?.Columns[name];
    if (column == null || column.Display == null) {
      return name;
    }

    return column.Display;
  }

  public async GetCultures(): Promise<void> {
    if (Object.keys(this.multilanguageTranslationDict).length === 0) {
      await this.init(this.culture, this.cultureFormat);
    }
  }
}
