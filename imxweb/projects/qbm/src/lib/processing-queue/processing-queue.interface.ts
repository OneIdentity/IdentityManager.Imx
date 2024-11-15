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

import { computed, effect, Signal, signal, WritableSignal } from '@angular/core';
import { v4 as uuid } from 'uuid';

export class ActionGroup implements QueuedActionGroup {
  public uid: string;
  public startDate: Date;
  public actions: WritableSignal<Action[]>;
  /** Action to take when group finishes */

  /**
   * Represents a collection of actions, state derived from the state of the actions
   * @param display name of the group of actions, shows up on the accordion
   * @param actions set of async tasks that will run in sequence
   * @param groupAction optionally set a function to run once the group finishes
   */
  constructor(
    public display: string,
    actions: Action[],
    private groupAction?: () => Promise<void>,
  ) {
    this.display = display;
    this.uid = uuid();
    this.startDate = new Date();
    this.actions = signal<Action[]>(actions);
    effect(
      () => {
        if (this.groupAction && CompletedActionStates.includes(this.state())) this.groupAction();
      },
      { allowSignalWrites: true },
    );
  }

  public finishedDate = computed(() => {
    const allFinished = this.actions().every((action) => CompletedActionStates.includes(action.state()));
    if (allFinished) {
      if (this.groupAction) this.groupAction();
      return new Date();
    } else return undefined;
  });

  public taskCount = computed(() => this.actions().length);
  public erroredActions = computed(() => this.actions().filter((action) => action.state() == QueuedActionState.Failed));
  public state = computed(() => {
    const states = this.actions().map((action) => action.state());
    // If any subaction is processing, the group is in a processing state
    if (states.some((state) => state == QueuedActionState.Processing)) return QueuedActionState.Processing;
    // If any subaction failed, the group is in a failed state
    else if (states.some((state) => state == QueuedActionState.Failed)) return QueuedActionState.Failed;
    // If all subactions are success, the group is success.
    else if (states.every((state) => state == QueuedActionState.Success)) return QueuedActionState.Success;
    // If the above cases aren't met, then we are in waiting?
    else return QueuedActionState.Waiting;
  });
}

export class Action implements QueuedAction {
  public uid: string;
  public startDate: Date;
  public state = signal(QueuedActionState.Waiting);
  public error = signal<Error | undefined>(undefined);

  /**
   * Represents a single chunk of work that will be sent off for processing.
   * @param display header of task name
   * @param display2 subtitle of task name, enter empty string for no display
   * @param action async task to be run for this action, should return no values
   */
  constructor(
    public display: string,
    public display2: string,
    private action: () => Promise<void>,
    public objectKey: string = '',
  ) {
    this.startDate = new Date();
    this.uid = uuid();
  }

  public finishedDate = computed(() => (CompletedActionStates.includes(this.state()) ? new Date() : undefined));

  /**
   * Clear error state, try to process with the action function, and give a new finished datum
   */
  public async execute(): Promise<void> {
    this.state.set(QueuedActionState.Processing);
    try {
      this.error.set(undefined);
      await this.action();
      this.state.set(QueuedActionState.Success);
    } catch (err) {
      this.error.set(err);
      this.state.set(QueuedActionState.Failed);
    }
  }
}

export enum QueuedActionState {
  Waiting,
  Processing,
  Success,
  Failed,
  NotInQueue,
}

export const CompletedActionStates = [QueuedActionState.Failed, QueuedActionState.Success];

/** Public interface of a queued action group */
export interface QueuedActionGroup {
  readonly display: string;

  /** Returns the state of the group */
  readonly state: Signal<QueuedActionState>;

  /** Unique id of this group */
  readonly uid: string;

  /** The set of all actions in the group */
  readonly actions: WritableSignal<Action[]>;

  /** The set of all actions that have an error state */
  readonly erroredActions: Signal<Action[]>;

  /** Date when the group was created */
  readonly startDate: Date;

  /** Date when the group had all actions reach a completed state */
  readonly finishedDate: Signal<Date | undefined>;
}

/** Public interface of a queued action */
export interface QueuedAction {
  /** Bold header display for action */
  readonly display: string;
  /** Sub header display for action */
  readonly display2: string;
  /** Underlying object xml key */
  readonly objectKey: string;
  /** Returns the state of this action. */
  readonly state: Signal<QueuedActionState>;
  /** Unique id for this action */
  readonly uid: string;
  /** Returns the error if the state is Failed. */
  readonly error: WritableSignal<Error | undefined>;
  /** Date when the action was queued. */
  readonly startDate: Date;
  /** Date when the action reached a finished state */
  readonly finishedDate: Signal<Date | undefined>;
}
