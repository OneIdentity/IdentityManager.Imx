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

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateService } from '@ngx-translate/core';
import { SnackBarService } from '../snackbar/snack-bar.service';
import { Action } from './processing-queue.interface';
import { ProcessingQueueService } from './processing-queue.service';

const lorem =
  'Omnis neque eius exercitationem omnis. Voluptatibus ut dignissimos commodi est. Praesentium hic cumque labore magnam qui accusantium. Cum et quos voluptatem provident adipisci blanditiis. Et est commodi eum eos iusto. Dolor ad nihil velit. Earum at eligendi et ullam numquam corporis accusamus. Error sint dolores sit dolores nobis. Aut nihil labore aliquam ullam reprehenderit dolorem id. Non placeat placeat ducimus omnis facilis et repellat vero. Vero velit id veniam ut asperiores. Tempora temporibus dolorem cumque voluptas nostrum cupiditate sint libero. Et et et perferendis numquam sint rerum beatae. Inventore omnis soluta vel harum beatae. Eius enim vel unde voluptatem molestias incidunt. Debitis quos eum delectus incidunt eos ut nesciunt. Tempora provident quo molestiae architecto officiis voluptatem accusamus. Dignissimos dolor qui illo hic ut est qui odit. Voluptatum dolores rem molestiae eligendi. Et et ut ab.';

const shortTime = 100;
const longTime = 1000;

// One Fail, One complete -> Complete fail
const oneFailInTwo: Action[] = [
  new Action('Slow success', 'Runs for .1s', async () => {}),
  new Action('Slow fail', 'Runs for .1s', async () => {
    tick(shortTime);
    throw lorem;
  }),
];

// One Fail, One complete -> Complete fail
const longTasks: Action[] = [
  new Action('Fail', '', async () => {
    tick(longTime);
  }),
  new Action('Complete', '', async () => {}),
];

describe('ProcessingQueueService', () => {
  let service: ProcessingQueueService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProcessingQueueService, SnackBarService, TranslateService, provideAnimations()],
    });
    service = TestBed.inject(ProcessingQueueService);
  });
  afterEach(() => service.clearProcessing());

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should add a group, and after time have one error and one success, and then clear', fakeAsync(() => {
    service.submitGroupAction(lorem, oneFailInTwo);
    flush();

    // Should have 1 error, number of actions length, and a completed group
    expect([service.errorCount(), service.totalCount(), service.hasCompletedGroups()]).toEqual([1, oneFailInTwo.length, true]);
    service.removeCompletedGroups();

    // Should have no tasks left
    expect(service.totalCount()).toEqual(0);
  }));

  it('should add several groups, one long task, and removing completed groups should leave one group', fakeAsync(() => {
    service.submitGroupAction(lorem, oneFailInTwo);
    service.submitGroupAction(lorem, longTasks);

    // Should have two groups
    expect(service._groups().length).toEqual([oneFailInTwo, longTasks].length);
    flush();

    // Should have a completed group
    expect(service.hasCompletedGroups()).toBeTrue();

    service.removeCompletedGroups();
    // Should have no completed groups
    expect(service.hasCompletedGroups()).toBeFalse();

    service.submitGroupAction(lorem, longTasks);
    service.clearProcessing();
    // Should have no tasks even though a long running group was submitted
    expect(service.totalCount()).toEqual(0);
  }));

  it('should retry a failed action', fakeAsync(() => {
    service.submitGroupAction(lorem, oneFailInTwo);

    flush();

    service.onRetryAction(oneFailInTwo[1]);
    // Should be retrying the only failed action, so no errors
    expect([service.totalCount(), service.errorCount()]).toEqual([oneFailInTwo.length, 0]);
  }));

  it('should retry a failed group, and increment the groupAction', fakeAsync(() => {
    let count = 0;
    const incCount = async () => {
      count = count + 1;
      return;
    };

    service.submitGroupAction(lorem, oneFailInTwo, incCount);
    flush();

    // Expect the group action to have been called once
    expect(count).toEqual(1);
    service.onRetryGroup(service._groups()[0]);
    flush();

    // Expect the group action to have been called twice
    expect(count).toEqual(2);
  }));
});
