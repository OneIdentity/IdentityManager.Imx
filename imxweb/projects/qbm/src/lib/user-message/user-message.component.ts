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

import { Component, OnDestroy, ViewChild, AfterContentInit, Input, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';

import { UserMessageService } from './user-message.service';
import { Message } from './message.interface';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { EuiAlertComponent } from '@elemental-ui/core';

/**
 * A component that displays a message inside an ElementalUI alert control
 */
@Component({
  selector: 'imx-usermessage',
  templateUrl: './user-message.component.html',
  styleUrls: ['./user-message.component.scss']
})
export class UserMessageComponent implements AfterContentInit, OnDestroy {
  /**
   * @ignore
   * The ElementalUI alert component
   */
  @ViewChild(EuiAlertComponent, { static: true }) public alert: EuiAlertComponent;

  @Input() public panelClass: 'imx-message' | 'imx-small-message' = 'imx-message';

  /** Identifier for the target property of messages. */
  @Input() public target: string;

  /**
   * @ignore
   * The message, displayed as header of the ElementalUI alert component
   */
  public message: Message;

  private readonly subscriptions: Subscription[] = [];

  constructor(private readonly messageService: UserMessageService, private readonly logger: ClassloggerService,
    private cdref: ChangeDetectorRef
  ) {
    this.logger.debug(this, 'init user message component');
    this.subscriptions.push(this.messageService.subject.subscribe(message => {

      this.logger.debug(this, 'message received:', message);
      this.message = message;
      if (this.alert) {
        this.alert.isDismissed = !this.isForMe();
        this.cdref.detectChanges();
      }
    }));
  }

  public dismissClick(){
    this.cdref.detectChanges();
  }

  private isForMe() {
    // is there a message, and is the message for this target?
    return this.message != null && this.target == this.message.target;
  }

  /**
   * @ignore
   * Dismisses the ElementalUI alert component on startup, if the message is empty
   */
  public ngAfterContentInit(): void {
    this.alert.isDismissed = !this.isForMe();
    this.logger.debug(this, 'initializing alert');
  }

  /**
   * @ignore
   * unsubscribe all subscriptions
   */
  public ngOnDestroy(): void {
    this.logger.debug(this, 'unsubscribe observables');
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
