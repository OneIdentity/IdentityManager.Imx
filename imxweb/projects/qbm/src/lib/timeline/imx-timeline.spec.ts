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
 * Copyright 2022 One Identity LLC.
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

import { ImxTimeline } from './imx-timeline';
import { ElementRef } from '@angular/core';

describe('ImxTimeline', () => {
  it('should create', () => {
    expect(() => new ImxTimeline(new ElementRef({
        hasChildNodes: () => false,
        appendChild: () => {}
    }), {}, {
        Timeline_ZoomIn: 'Zoom in',
        Timeline_ZoomOut: 'Zoom out',
        Timeline_MoveLeft: 'Move left',
        Timeline_MoveRight: 'Move right',
        Timeline_ClusterDescription: (numOfEvents: number) => `${numOfEvents} events. Zoom in to see the individual events.`,
        Timeline_ClusterTitle: (numOfEvents: number) => `${numOfEvents} events`,
        Timeline_New: 'New',
        Timeline_CreateNewEvent: 'Create new event'
    })).not.toThrow();
  });
});
