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

import { ElementRef, Injectable, OnDestroy } from '@angular/core';
import { EuiThemeService } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

export interface AWMColorValues {
  NodeLevel: string;
  NodeStep: string;
  EdgeRoot: string;
  EdgeApproval: string;
  EdgeReject: string;
  EdgeEscalation: string;
  EdgeRedirect: string;
  Text: string;
  Selected: string;
}

@Injectable({
  providedIn: 'root'
})
export class AwmColorsService implements OnDestroy {
  public colorValues: AWMColorValues;
  private themeSub$: Subscription;

  constructor(
    private themeService: EuiThemeService,
  ) { }

  ngOnDestroy(): void {
    this.themeSub$.unsubscribe();
  }

  public getAndStoreColor(element: ElementRef): void {
    this.themeSub$ = this.themeService.getThemeSwitcherState().subscribe(() => {
      this.colorValues = {
        NodeLevel: getComputedStyle(element.nativeElement).getPropertyValue('--awm-node-level'),
        NodeStep: getComputedStyle(element.nativeElement).getPropertyValue('--awm-node-step'),
        EdgeRoot: getComputedStyle(element.nativeElement).getPropertyValue('--awm-edge-root'),
        EdgeApproval: getComputedStyle(element.nativeElement).getPropertyValue('--awm-edge-approval'),
        EdgeReject: getComputedStyle(element.nativeElement).getPropertyValue('--awm-edge-reject'),
        EdgeEscalation: getComputedStyle(element.nativeElement).getPropertyValue('--awm-edge-escalation'),
        EdgeRedirect: getComputedStyle(element.nativeElement).getPropertyValue('--awm-edge-redirect'),
        Text: getComputedStyle(element.nativeElement).getPropertyValue('--awm-text'),
        Selected: getComputedStyle(element.nativeElement).getPropertyValue('--awm-selected'),
      };
    });
  }
}
