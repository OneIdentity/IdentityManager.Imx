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
 * Server does not format numbers, so we need to do it here.
 * This is used to round the value and percentage to a maximum of 2 decimal places by default
 * @param value
 * @param returnString defaults to false
 * @param decimalPlaces defaults to 2
 * @returns
 */
export function handleDecimal(value: number | undefined, decimalPlaces = 2) {
  if (!value) return undefined;
  // Check if we have a number that needs to be formatted
  const strRep = value.toString();
  const formattedValue =
    strRep.includes('.') && strRep.length - strRep.indexOf('.') - 1 > decimalPlaces ? value.toFixed(decimalPlaces) : value;
  // Use + Unary operator for a number value
  return +formattedValue;
}
