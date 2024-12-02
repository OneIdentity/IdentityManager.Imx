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

import { computed, EnvironmentInjector, inject, Injectable, runInInjectionContext, signal, WritableSignal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SnackBarService } from '../snackbar/snack-bar.service';
import { Action, ActionGroup, CompletedActionStates, QueuedActionState } from './processing-queue.interface';

/** Service to manage a queue of asynchronous actions. */

@Injectable({ providedIn: 'root' })
export class ProcessingQueueService {
  constructor(
    private readonly snackbar: SnackBarService,
    private readonly translate: TranslateService,
  ) {}
  /** Needed to ensure that group action effects can be run correctly */
  private environmentInjector = inject(EnvironmentInjector);

  /** Number of actions we check for before we use the queue service */
  public actionThreshold = 5;

  /** Array of all groups of actions */
  public _groups: WritableSignal<ActionGroup[]> = signal([]);

  /** Array of all actions, used for querying status in the pollAction function */
  private _actions = computed(() => this._groups().flatMap((group) => group.actions()));

  /** Internal flag for preventing all calls from happening simultaneously */
  private processing: boolean;

  /** Get the first action that is waiting to be processed */
  private firstWaitingAction = computed(() => this._actions().find((action) => action.state() == QueuedActionState.Waiting));

  /** Boolean for if any GroupActions succeeded or failed */
  public hasCompletedGroups = computed(() => this._groups().some((group) => CompletedActionStates.includes(group.state())));

  /** Boolean for if all GroupActions succeeded or failed */
  public isAllGroupsCompleted = computed(() => this._actions().every((action) => CompletedActionStates.includes(action.state())));

  /** Total count of actions in the queue, regardless of state */
  public totalCount = computed(() => this._groups().reduce((acc, group) => acc + group.actions().length, 0));

  /** Total count of actions in the queue that have errored */
  public errorCount = computed(() => this._groups().reduce((acc, group) => acc + group.erroredActions().length, 0));

  /**
   * Add a new group of actions to the queue for processing
   * @param groupName display for the group of actions
   * @param subactions list of actions to be processed as part of this group
   * @param groupAction an action that will be run each time the group enters a finshed state from first or retries
   */
  public submitGroupAction(groupName: string, actions: Action[], groupAction?: () => Promise<void>): void {
    let group: ActionGroup;
    runInInjectionContext(this.environmentInjector, () => {
      group = new ActionGroup(groupName, actions, groupAction);
    });
    this._groups.update((currentGroups) => [...currentGroups, group]);
    this.runNextActionIfAvailable();

    this.snackbar.open({ key: this.translate.instant('#LDS#The actions are processed as background processes.') });
  }

  /** Clear out all groups in succeeded or failed states */
  public removeCompletedGroups(): void {
    this._groups.update((currentGroups) => currentGroups.filter((group) => !CompletedActionStates.includes(group.state())));
  }

  /**
   * Clear out all groups and set the processing flag to false.
   */
  public clearProcessing(): void {
    this._groups.update(() => []);
    this.processing = false;
  }

  /**
   * Reprocess a single action that is already in the queue
   * @param action that we want to put back into a waiting state and reprocess
   */
  public onRetryAction(action: Action): void {
    action.state.set(QueuedActionState.Waiting);
    if (!this.processing) this.runNextActionIfAvailable();
  }

  /**
   * Reprocess all failed actions in a group
   * @param group that we want to put all failed actions into a waiting state and reprocess
   */
  public onRetryGroup(group: ActionGroup): void {
    group.erroredActions().forEach((action) => this.onRetryAction(action));
  }

  /** Runs all available action in sequence for as long as any actions are in the Waiting state. */
  private async runNextActionIfAvailable(): Promise<void> {
    if (!this.processing && this.firstWaitingAction()) {
      this.processing = true;
      await this.firstWaitingAction()!.execute();
      this.processing = false;
      await this.runNextActionIfAvailable();
    }
  }

  /**
   * Check for specific action's state
   * @param uid the unique id for this action to query state
   */
  public pollAction(uid: string): QueuedActionState {
    const action = this._actions().find((action) => action.objectKey == uid);
    if (action) return action.state();
    else return QueuedActionState.NotInQueue;
  }
}
