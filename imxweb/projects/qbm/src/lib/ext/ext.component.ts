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

import { ComponentFactoryResolver, Component, ViewChild, OnInit, Input } from '@angular/core';

import { ExtService } from './ext.service';
import { ExtDirective } from './ext.directive';

@Component({
  selector: 'imx-ext',
  template: ` <ng-template imxExtd></ng-template> `,
})
export class ExtComponent implements OnInit {
  @ViewChild(ExtDirective, { static: true }) public directive: ExtDirective;

  @Input() public id: string;

  @Input() public referrer: any;

  @Input() public properties: { [property: string]: any };

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private extService: ExtService) {}

  public ngOnInit(): void {
    this.loadComponent();
  }

  private loadComponent(): void {
    const extensions = this.extService.Registry[this.id];

    if (extensions == null) {
      // TODO log
      return;
    }

    const viewContainerRef = this.directive.viewContainerRef;
    viewContainerRef.clear();

    extensions.forEach((element) => {
      const c = viewContainerRef.createComponent(this.componentFactoryResolver.resolveComponentFactory(element.instance));
      c.instance.referrer = this.referrer;
      c.instance.inputData = element.inputData;

      if (this.properties) {
        for (let key in this.properties) {
          Reflect.set(c.instance, key, this.properties[key]);
        }
      }
    });
  }
}
