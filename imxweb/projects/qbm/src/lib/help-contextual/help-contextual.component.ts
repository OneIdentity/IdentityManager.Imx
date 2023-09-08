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

import { Component, Input, OnDestroy } from '@angular/core';
import { HelpContextualValues, HelpContextualService, HELP_CONTEXTUAL } from './help-contextual.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HelpContextualDialogComponent } from './help-contextual-dialog/help-contextual-dialog.component';
/**
 * Help contextual component
 * @example
 * <imx-help-contextual [contextId]="contextId"></imx-help-contextual>
 *
 * @example
 * <imx-help-contextual></imx-help-contextual>
 *  const routes: Routes = [
 *    {
 *      path: 'newrequest',
 *      component: NewRequestComponent,
 *      data:{
 *        contextId: HELP_CONTEXTUAL.NewRequest
 *      }
 *    },
 *  ];
 *
 * @example
 *  this.helpContextualService.setHelpContextId(HELP_CONTEXTUAL.NewRequest);
 *  this.sideSheet.open(ExampleSidesheetComponent, {
 *    title: 'Sidesheet title',
 *    headerComponent: HelpContextualComponent
 *  });
 */
@Component({
  selector: 'imx-help-contextual',
  templateUrl: './help-contextual.component.html',
  styleUrls: ['./help-contextual.component.scss']
})
export class HelpContextualComponent implements OnDestroy{
  @Input() contextId: HelpContextualValues;
  @Input() size: 's'| 'm' | 'l' | 'xl' = 'm';
  @Input() title: string;

  constructor(
    private router: ActivatedRoute,
    private helpContextualService: HelpContextualService,
    private dialog: MatDialog
  ) { }

  ngOnDestroy(): void {
    this.helpContextualService.setHelpContextId(null);
  }
  /**
   * The call opens the dialog with the contextual help data.
   */
  public async onShowHelp(): Promise<void>{
    const contextualHelpData = await this.helpContextualService.getHelpContext(this.getContextId());
    this.dialog
      .open(HelpContextualDialogComponent, {
        data: contextualHelpData
      })
  }

  /**
   * The call returns the selected context ID.
   * @returns {HelpContextualValues}
   */
  private getContextId(): HelpContextualValues{
    if(!!this.contextId){
      return this.contextId;
    }
    if(!!this.helpContextualService.GetHelpContextId()){
      return this.helpContextualService.GetHelpContextId();
    }
    let contextId: HelpContextualValues;
    contextId = this.router.snapshot.data?.contextId as HelpContextualValues;
    return contextId || HELP_CONTEXTUAL.Default;
  }
}
