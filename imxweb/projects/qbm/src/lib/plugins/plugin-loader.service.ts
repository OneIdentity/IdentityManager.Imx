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

import { Injectable, Injector, isDevMode, createNgModuleRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { NodeAppInfo, PlugInInfo } from 'imx-api-qbm';

import { imx_SessionService } from '../session/imx-session.service';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { AppConfig } from '../appConfig/appconfig.interface';

import * as AngularCore from '@angular/core';
import * as AngularCommon from '@angular/common';
import * as AngularCommonHttp from '@angular/common/http';
import * as AngularRouter from '@angular/router';
import * as BrowserAnimations from '@angular/platform-browser/animations';
import * as PlatformBrowser from '@angular/platform-browser';
import * as AngularMaterialCore from '@angular/material/core';
import * as CdkDragDropAngularMaterial from '@angular/cdk/drag-drop';
import * as CdkPortalAngularMaterial from '@angular/cdk/portal';
import * as CdkScrollingAngularMaterial from '@angular/cdk/scrolling';
import * as CdkStepperModule from '@angular/cdk/stepper';
import * as CdkTableModule from '@angular/cdk/table';
import * as CdkTreeModule from '@angular/cdk/tree';
import * as CdkPlatformModule from '@angular/cdk/platform';
import * as CdkTextFieldModule from '@angular/cdk/text-field';
import * as CdkKeycodesModule from '@angular/cdk/keycodes';
import * as BadgeModule from '@angular/material/badge';
import * as BottomSheetModule from '@angular/material/bottom-sheet';
import * as ButtonModule from '@angular/material/button';
import * as ButtonToggleModule from '@angular/material/button-toggle';
import * as MatCardModule from '@angular/material/card';
import * as MatCheckboxModule from '@angular/material/checkbox';
import * as MatChipsModule from '@angular/material/chips';
import * as MatStepperModule from '@angular/material/stepper';
import * as MatDatepickerModule from '@angular/material/datepicker';
import * as MatDialogModule from '@angular/material/dialog';
import * as MatDividerModule from '@angular/material/divider';
import * as MatExpansionModule from '@angular/material/expansion';
import * as MatGridListModule from '@angular/material/grid-list';
import * as MatIconModule from '@angular/material/icon';
import * as MatInputModule from '@angular/material/input';
import * as MatListModule from '@angular/material/list';
import * as MatMenuModule from '@angular/material/menu';
import * as MatPaginatorModule from '@angular/material/paginator';
import * as MatProgressBarModule from '@angular/material/progress-bar';
import * as MatProgressSpinnerModule from '@angular/material/progress-spinner';
import * as MatRadioModule from '@angular/material/radio';
import * as MatSelectModule from '@angular/material/select';
import * as MatSidenavModule from '@angular/material/sidenav';
import * as MatSliderModule from '@angular/material/slider';
import * as MatSlideToggleModule from '@angular/material/slide-toggle';
import * as MatSnackBarModule from '@angular/material/snack-bar';
import * as MatSortModule from '@angular/material/sort';
import * as MatTableModule from '@angular/material/table';
import * as MatTabsModule from '@angular/material/tabs';
import * as MatToolbarModule from '@angular/material/toolbar';
import * as MatTooltipModule from '@angular/material/tooltip';
import * as MatTreeModule from '@angular/material/tree';
import * as OverlayModule from '@angular/cdk/overlay';
import * as MatFormFieldModule from '@angular/material/form-field';
import * as MatAutocompleteModule from '@angular/material/autocomplete';
import * as FormsModule from '@angular/forms';
import * as NgxTranslateModule from '@ngx-translate/core';
import * as QBMDBTS from 'imx-qbm-dbts';
import * as ElementUICore from '@elemental-ui/core';
import * as Rxjs from 'rxjs';
import * as RxjsOperators from 'rxjs/operators';
import * as BillboardJs from 'billboard.js';
import * as tslibModule from 'tslib';
import * as MomentTimezone from 'moment-timezone';
import * as lodash from 'lodash';

declare var SystemJS: any;

@Injectable({
  providedIn: 'root',
})
export class PluginLoaderService {
  private appInfo: NodeAppInfo;
  private plugins: PlugInInfo[] = [];

  constructor(
    private readonly session: imx_SessionService,
    private readonly logger: ClassloggerService,
    private readonly httpClient: HttpClient,
    private readonly injector: Injector
  ) {
    SystemJS.config({
      meta: {
        '*.mjs': {
          babelOptions: {
            es2015: false
          }
        }
      },
      map: {
        'plugin-babel': 'systemjs-plugin-babel/plugin-babel.js',
        'systemjs-babel-build': 'systemjs-plugin-babel/systemjs-babel-browser.js',
      },
      transpiler: 'plugin-babel',
    });
  }

  public async loadModules(appName: string): Promise<void> {
    const apps: NodeAppInfo[] = await this.session.Client.imx_applications_get();

    this.appInfo = apps.filter((app) => app.Name === appName)[0];

    this.logger.debug(this, `▶️ Found config section for ${this.appInfo.DisplayName}`);

    if (this.appInfo.PlugIns == null || this.appInfo.PlugIns.length === 0) {
      this.logger.debug(this, `❌ No plugins found`);
      return;
    }

    this.logger.debug(this, `▶️ Found ${this.appInfo.PlugIns.length} plugin(s)`);

    const host = window.location.href.split('html')[0];
    this.logger.debug(this, `💻 Host: ${host} `);

    let config: AppConfig;

    if (!isDevMode()) {
      config = (await this.httpClient.get('appconfig.json').toPromise()) as AppConfig;
      this.importDependencies();
      this.logger.debug(this, '▶️  Config. PROD mode.', config);
    }

    let moduleList = [];

    for (const plugin of this.appInfo.PlugIns) {
      this.logger.debug(this, `⚙️ Plugin: ${plugin.Container}`);

      try {
        if (isDevMode()) {
          this.logger.debug(this, '▶️ Importing module. DEV mode.');
          moduleList.push(import(`html/${plugin.Container}/fesm2015/${plugin.Container}.mjs`));
        } else {
          this.logger.debug(this, '▶️ Importing module. PROD mode.');
          moduleList.push(SystemJS.import(`${host}html/${plugin.Container}/fesm2015/${plugin.Container}.mjs`));
        }

        this.plugins.push(plugin);
      } catch (e) {
        this.logger.error(this, `💥 Loading of ${plugin.Name} (${plugin.Container}) failed with the following error: ${e.message}`);
      }
    }

    let modules = await Promise.allSettled(moduleList);
    for (let i = 0; i < modules.length; i++) {
      try {
        let m = modules[i] as any;
        let module = m.value[this.plugins[i].Name as any];
        createNgModuleRef(module, this.injector);
        this.logger.debug(this, '▶️ Instance ready');
      } catch (e) {
        this.logger.error(
          this,
          `💥 Loading of ${this.plugins[i].Name} (${this.plugins[i].Container}) failed with the following error: ${e.message}`
        );
      }
    }
  }

  private importDependencies(): void {
    // Angular Modules
    SystemJS.set('@angular/core', SystemJS.newModule(AngularCore));
    SystemJS.set('@angular/common', SystemJS.newModule(AngularCommon));
    SystemJS.set('@angular/router', SystemJS.newModule(AngularRouter));
    SystemJS.set('@angular/platform-browser/animations', SystemJS.newModule(BrowserAnimations));
    SystemJS.set('@angular/common/http', SystemJS.newModule(AngularCommonHttp));

    // Angular Material Modules
    SystemJS.set('@angular/material/core', SystemJS.newModule(AngularMaterialCore));
    SystemJS.set('@angular/cdk/drag-drop', SystemJS.newModule(CdkDragDropAngularMaterial));
    SystemJS.set('@angular/cdk/portal', SystemJS.newModule(CdkPortalAngularMaterial));
    SystemJS.set('@angular/cdk/scrolling', SystemJS.newModule(CdkScrollingAngularMaterial));
    SystemJS.set('@angular/cdk/stepper', SystemJS.newModule(CdkStepperModule));
    SystemJS.set('@angular/cdk/table', SystemJS.newModule(CdkTableModule));
    SystemJS.set('@angular/cdk/platform', SystemJS.newModule(CdkPlatformModule));
    SystemJS.set('@angular/cdk/tree', SystemJS.newModule(CdkTreeModule));
    SystemJS.set('@angular/cdk/text-field', SystemJS.newModule(CdkTextFieldModule));
    SystemJS.set('@angular/cdk/keycodes', SystemJS.newModule(CdkKeycodesModule));
    SystemJS.set('@angular/material/badge', SystemJS.newModule(BadgeModule));
    SystemJS.set('@angular/material/bottom-sheet', SystemJS.newModule(BottomSheetModule));
    SystemJS.set('@angular/material/button', SystemJS.newModule(ButtonModule));
    SystemJS.set('@angular/material/button-toggle', SystemJS.newModule(ButtonToggleModule));
    SystemJS.set('@angular/material/card', SystemJS.newModule(MatCardModule));
    SystemJS.set('@angular/material/checkbox', SystemJS.newModule(MatCheckboxModule));
    SystemJS.set('@angular/material/chips', SystemJS.newModule(MatChipsModule));
    SystemJS.set('@angular/material/stepper', SystemJS.newModule(MatStepperModule));
    SystemJS.set('@angular/material/datepicker', SystemJS.newModule(MatDatepickerModule));
    SystemJS.set('@angular/material/dialog', SystemJS.newModule(MatDialogModule));
    SystemJS.set('@angular/material/divider', SystemJS.newModule(MatDividerModule));
    SystemJS.set('@angular/material/expansion', SystemJS.newModule(MatExpansionModule));
    SystemJS.set('@angular/material/grid-list', SystemJS.newModule(MatGridListModule));
    SystemJS.set('@angular/material/icon', SystemJS.newModule(MatIconModule));
    SystemJS.set('@angular/material/input', SystemJS.newModule(MatInputModule));
    SystemJS.set('@angular/material/list', SystemJS.newModule(MatListModule));
    SystemJS.set('@angular/material/menu', SystemJS.newModule(MatMenuModule));
    SystemJS.set('@angular/material/paginator', SystemJS.newModule(MatPaginatorModule));
    SystemJS.set('@angular/material/progress-bar', SystemJS.newModule(MatProgressBarModule));
    SystemJS.set('@angular/material/progress-spinner', SystemJS.newModule(MatProgressSpinnerModule));
    SystemJS.set('@angular/material/radio', SystemJS.newModule(MatRadioModule));
    SystemJS.set('@angular/material/select', SystemJS.newModule(MatSelectModule));
    SystemJS.set('@angular/material/sidenav', SystemJS.newModule(MatSidenavModule));
    SystemJS.set('@angular/material/slider', SystemJS.newModule(MatSliderModule));
    SystemJS.set('@angular/material/slide-toggle', SystemJS.newModule(MatSlideToggleModule));
    SystemJS.set('@angular/material/snack-bar', SystemJS.newModule(MatSnackBarModule));
    SystemJS.set('@angular/material/sort', SystemJS.newModule(MatSortModule));
    SystemJS.set('@angular/material/table', SystemJS.newModule(MatTableModule));
    SystemJS.set('@angular/material/tabs', SystemJS.newModule(MatTabsModule));
    SystemJS.set('@angular/material/toolbar', SystemJS.newModule(MatToolbarModule));
    SystemJS.set('@angular/material/tooltip', SystemJS.newModule(MatTooltipModule));
    SystemJS.set('@angular/material/tree', SystemJS.newModule(MatTreeModule));
    SystemJS.set('@angular/material/autocomplete', SystemJS.newModule(MatAutocompleteModule));
    SystemJS.set('@angular/cdk/overlay', SystemJS.newModule(OverlayModule));
    SystemJS.set('@angular/material/form-field', SystemJS.newModule(MatFormFieldModule));
    SystemJS.set('@angular/forms', SystemJS.newModule(FormsModule));
    SystemJS.set('@angular/platform-browser', SystemJS.newModule(PlatformBrowser));

    // Other stuff
    SystemJS.set('@ngx-translate/core', SystemJS.newModule(NgxTranslateModule));
    SystemJS.set('rxjs', SystemJS.newModule(Rxjs));
    SystemJS.set('rxjs/operators', SystemJS.newModule(RxjsOperators));
    SystemJS.set('billboard.js', SystemJS.newModule(BillboardJs));
    SystemJS.set('tslib', SystemJS.newModule(tslibModule));
    SystemJS.set('moment-timezone', SystemJS.newModule(MomentTimezone));
    SystemJS.set('lodash', SystemJS.newModule(lodash));

    // Our stuff
    SystemJS.set('imx-qbm-dbts', SystemJS.newModule(QBMDBTS));
    SystemJS.set('@elemental-ui/core', SystemJS.newModule(ElementUICore));
  }
}
