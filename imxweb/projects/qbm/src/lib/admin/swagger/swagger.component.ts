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

import { AfterViewInit, Component, DebugElement, Input } from '@angular/core';
import { AppConfigService } from '../../appConfig/appConfig.service';
import { Globals } from 'imx-qbm-dbts';
import { SideNavigationComponent } from '../../side-navigation-view/side-navigation-view-interfaces';

declare const SwaggerUIBundle: any;

@Component({
  selector: 'imx-swagger',
  templateUrl: './swagger.component.html',
  styleUrls: ['./swagger.component.scss'],
})
export class SwaggerComponent implements AfterViewInit, SideNavigationComponent {
  @Input() public isAdmin: boolean;

  public readonly version = Globals.Version;

  constructor(public readonly appConfigService: AppConfigService) {}

  async ngAfterViewInit() {
    let state = await this.appConfigService.client.admin_apiconfigsingle_get('imx', 'ServerLevelConfig/ApiDocumentation');

    if (state == 'SwaggerUi') {
      SwaggerUIBundle({
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
        url: this.appConfigService.BaseUrl + '/swagger/swagger.json',
        requestInterceptor: (req) => {
          const token = this.getCookie('XSRF-TOKEN');
          if (token) {
            req.headers['X-XSRF-TOKEN'] = token;
          }
          return req;
        },
      });
    }
  }

  private getCookie(name) {
    function escape(s) {
      return s.replace(/([.*+?\^$(){}|\[\]\/\\])/g, '\\$1');
    }
    var match = document.cookie.match(RegExp('(?:^|;\\s*)' + escape(name) + '=([^;]*)'));
    return match ? match[1] : null;
  }
}
