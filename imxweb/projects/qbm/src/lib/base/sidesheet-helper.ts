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

/**
 * Calculates the sidesheet width.
 * @param pixelWidth
 * @param percentageWidth
 * @returns The calculated sidesheet width in pixel.
 */
export function calculateSidesheetWidth(pixelWidth: number = 900, percentageWidth: number = 0.6): string {
  const calculatedWidth = document.body.offsetWidth * percentageWidth;
  return `${Math.max(pixelWidth, calculatedWidth)}px`;
}

/**
 * Checks the width of the document body is lower than 768px.
 */
export function isMobile(): boolean {
  return document.body.offsetWidth <= 768;
}
