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

import { HeatmapDataTyped } from './heatmap-data-typed';

// Types
export type BlockState = 'Ok' | 'Light' | 'Moderate' | 'Severe' | 'Error';
export type ClassState = 'block-ok' | 'block-light-warn' | 'block-warn' | 'block-severe-warn' | 'block-error';

export interface ColorValues {
  Primary: string;
  Ok: string;
  LightWarn: string;
  Warn: string;
  SevereWarn: string;
  Error: string;
  Light: string;
  Dark: string;
}

export interface Block {
    tooltip: string;
    cols: string;
    rows: string;
    fontsize?: string;
    class: ClassState;
    backgroundColor: string;
    color: string;
    name: string;
    state: BlockState;
    object?: HeatmapDataTyped;
    historyValues: number[];
    historyColors: string[];
}

export interface AdditionalEntityProperties {
  backgroundColor: string;
  color: string;
  class: ClassState;
  state: BlockState;
  stateDisplay: string;
  ancestors: string;
  tooltip: string;
  historyValues: number[];
  historyColors: string[];
}

export interface StateProperties {
  class?: ClassState,
  state?: BlockState,
  stateDisplay?: string;
  color?: string
}

export interface StateThresholds {
  error?: {
    value?: number,
    properties?: StateProperties
  },
  severeWarn?: {
    value?: number,
    properties?: StateProperties
  },
  warn?: {
    value?: number,
    properties?: StateProperties
  },
  lightWarn?: {
    value?: number,
    properties?: StateProperties
  },
  ok?: {
    value?: number,
    properties?: StateProperties
  },
}
