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

import { IConnectorProvider } from './connector-provider';

/**
 * Defines a hyperview element
 */
export interface HvElement {
  position: string;
  element: HTMLElement;
}

/**
 * Add 'px' to a number value and return this string.
 * @param px the value
 */
export function toPixelString(px: number): string {
  return px + 'px';
}

/**
 * Defines a size object
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Defines a hyperview cell
 */
export interface HvCell {
  size: Size;
  elements: HvElement[];
}

/**
 * Event arguments when the user has clicked a shape.
 */
export interface ShapeClickArgs {
  objectKey: string;
  caption: string;
}

/**
 * Defines a hyperview layout
 */
export interface HyperViewLayout {
  layout(): LayoutResult;
  getConnectorProvider(): IConnectorProvider;
}

export interface LayoutResult {
  size: Size;
}

/**
 * Defines a hyperview element
 */
export interface HvSettings {
  enforceVerticalLayout: boolean;
  elements: HvElement[];
}

/**
 * Defines the hyperview navigation type.
 */
export enum HyperViewNavigationEnum {
  First,
  Back,
  Forward,
}

/**
 * Defines the hyperview navigation input params.
 */
export interface HyperViewNavigation {
  first: boolean;
  back: boolean;
  forward: boolean;
  navigation: boolean;
}
