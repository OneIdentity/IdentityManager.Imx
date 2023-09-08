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

import { ConnectorProvider } from './connector-provider';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

describe('ConnectorProvider', () => {

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create an instance', () => {

    expect(() => {
      const connector = new ConnectorProvider(true);

    }).not.toThrowError();
  });

  [
    { description: 'should return no connectors', nbOfElements: 1, expectedConnectors: 0 },
    { description: 'should return one connectors', nbOfElements: 2, expectedConnectors: 1 },
    { description: 'should return three connectors', nbOfElements: 3, expectedConnectors: 2 }
  ].forEach(testcase => {

    it('getConnectors ' + testcase.description, () => {

      // Arrange
      const singleElement = {
        position: 'bla',
        element: document.createElement('div')
      }

      const hvElements = [];
      for (let i = 0; i < testcase.nbOfElements; i++) {
        hvElements.push(singleElement);
      }

      const hvSettings = {
        enforceVerticalLayout: false,
        elements: hvElements
      }

      expect(() => {
        // Act
        const connector = new ConnectorProvider(false);
        const connectors = connector.getConnectors(hvSettings);

        // Assert
        expect(connectors.length).toBe(testcase.expectedConnectors);
      }).not.toThrowError();
    });
  });

  [
    { description: 'should return no connectors', isHierarchical: false, expectedConnectors: 0 },
    { description: 'should return one connectors', isVertical: true, expectedConnectors: 1 }
  ].forEach(testcase => {

    it('getConnectors should create different connectors according to the layout ' + testcase.description, () => {

      // Arrange
      const hvElements = [];
      for (let i = 0; i < 3; i++) {
        const singleElement = {
          position: i,
          element: document.createElement('div' + i)
        }
        hvElements.push(singleElement);
      }

      const hvSettings = {
        enforceVerticalLayout: false,
        elements: hvElements
      }

      expect(() => {
        // Act
        const connector = new ConnectorProvider(testcase.isHierarchical);
        const connectors = connector.getConnectors(hvSettings);

        // Assert

        expect(connectors.length).toBe(2);

        connectors.forEach((conn, index) => {
          if (testcase.isHierarchical) {
            expect(conn.element1.tagName).toBe('DIV0');
          } else {
            expect(conn.element1.tagName).toBe('DIV' + index);
          }
        });

      }).not.toThrowError();
    });
  });


});
