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
 * Copyright 2021 One Identity LLC.
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

import { Component, OnInit, ComponentFactoryResolver, ViewChild, Input } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

import { PortalItshopRequests } from 'imx-api-qer';

import { RequestDisplayService } from './request-display.service';
import { ExtDirective } from 'qbm';

@Component({
  template: `<ng-template imxExtd></ng-template>`,
  selector: 'imx-request-display'
})
export class RequestDisplayComponent implements OnInit {

  @ViewChild(ExtDirective, { static: true }) public readonly directive: ExtDirective;
  @Input() public readonly isReadOnly: boolean;
  @Input() public readonly personWantsOrg: PortalItshopRequests;

  constructor(
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    private readonly logger: NGXLogger,
    private readonly requestDisplayService: RequestDisplayService
  ) {
  }

  public ngOnInit(): void {
    const type = this.personWantsOrg.DisplayType.value;
    const selectedProvider = this.requestDisplayService.getType(type);
    this.logger.trace('Getting request display component for ' + type);
    if (selectedProvider) {
      this.directive.viewContainerRef.clear();
      const instance = this.directive.viewContainerRef
        .createComponent(this.componentFactoryResolver.resolveComponentFactory(selectedProvider));
      instance.instance.isReadOnly = this.isReadOnly;
      instance.instance.personWantsOrg = this.personWantsOrg;
    }
  }
}
