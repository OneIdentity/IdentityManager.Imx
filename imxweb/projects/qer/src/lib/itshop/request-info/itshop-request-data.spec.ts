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

import { IClientProperty } from 'imx-qbm-dbts';
import { ItshopRequestData } from "./itshop-request-data";

describe('ItshopRequestData', () => {
  function createParameterData(value, name) {
    return { Value: { Value: value }, Property: { ColumnName: name } as IClientProperty };
  }

  it('should init request parameters', () => {
    const propertyColumnName = 'DisplayOrg';
    const properties = { };
    properties[propertyColumnName] = {
      ColumnName: propertyColumnName,
      GetValue: () => 'some value'
    };

    const parameters = [
      [
        createParameterData('some value 1.0', '1'),
        createParameterData('some value 2.0', '2'),
      ],
      [
        createParameterData('some value 1.1', '3'),
        createParameterData('some value 2.1', '4'),
      ]
    ];

    const extendedCollectionData = {
      index: 0,
      Parameters: {
        parameterCategory1: [[parameters[0][0]], [parameters[1][0]]],
        parameterCategory2: [[parameters[0][1]], [parameters[1][1]]]
      }
    };
    const request = new ItshopRequestData(extendedCollectionData);

    expect(request.parameters[0]).toEqual(parameters[0][0]);
    expect(request.parameters[1]).toEqual(parameters[0][1]);
  });
});
