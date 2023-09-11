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

import { Injectable } from '@angular/core';
import { Router, Route } from '@angular/router';

import { ExtService } from 'qbm';
import { CallsComponent } from './calls/calls.component';


@Injectable({ providedIn: 'root' })
export class InitService {

  constructor(
    private readonly router: Router,
    private readonly extService: ExtService,
  ) { }

  public onInit(routes: Route[]): void {
    this.addRoutes(routes);
    this.extService.register('mastHead', { instance: CallsComponent, inputData: {
      id: 'helpdeskTickets',
      label: '#LDS#Menu Entry Help desk tickets',
      url: 'help-desk-support/tickets'
    }});

    /*
    this.dataExplorerRegistryService.registerFactory(
      (preProps: string[], groups: string[]) => {
        if (!this.isRoleAdmin(groups)) {
          return;
        }
        return {
          instance: RolesOverviewComponent,
          data: {
            TableName: this.esetTag,
            Count: 0,
          },
          sortOrder: 8,
          name: 'systemroles',
          caption: '#LDS#Menu Entry System roles',
        };
      }
    );
    */
  }

  private addRoutes(routes: Route[]): void {
    const config = this.router.config;
    routes.forEach(route => {
      config.unshift(route);
    });
    this.router.resetConfig(config);
  }
}
