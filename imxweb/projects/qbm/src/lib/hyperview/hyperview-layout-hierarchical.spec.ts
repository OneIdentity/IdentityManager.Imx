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

import { inject, TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { HyperviewLayoutHierarchical } from './hyperview-layout-hierarchical';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

describe('HyperviewLayoutHierarchical', () => {

  const htmlElement = document.createElement('div');

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule
      ]
    });
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create an instance', inject([ClassloggerService], (logger: ClassloggerService) => {

    const elements = [];
    const middlecenter = {
      position: 'MiddleCenter',
      element: htmlElement
    }
    elements.push(middlecenter);

    expect(() => {
      const hierarchical = new HyperviewLayoutHierarchical(elements, logger);
    }).not.toThrowError();
  }));

  it('should have a shape with middlecenter position', inject([ClassloggerService], (logger: ClassloggerService) => {
    expect(() => {
      const elements = [];
      const hierarchical = new HyperviewLayoutHierarchical(elements, logger);
    }).toThrowError('A shape with MiddleCenter position is required for hierarchical layout.');
  }));

  it('should move the middlecenter element to the first element in the list', inject([ClassloggerService], (logger: ClassloggerService) => {

    const elements = [];
    const middlecenter = {
      position: 'MiddleCenter',
      element: htmlElement
    }
    const topLeft = {
      position: 'TopLeft',
      element: htmlElement
    }
    elements.push(topLeft, middlecenter);

    expect(elements[0].position = 'TopLeft')
    expect(() => {
      const hierarchical = new HyperviewLayoutHierarchical(elements, logger);
      expect(elements[0].position = 'MiddleCenter')

    }).not.toThrowError();
  }));

  it('should return a connectorprovider', inject([ClassloggerService], (logger: ClassloggerService) => {
    const elements = [];
    const middlecenter = {
      position: 'MiddleCenter',
      element: htmlElement
    }
    elements.push(middlecenter);
    const hierarchical = new HyperviewLayoutHierarchical(elements, logger);
    const provider = hierarchical.getConnectorProvider();
    expect(provider).not.toBeNull();
  }));

  it('should layout all elements correctly', inject([ClassloggerService], (logger: ClassloggerService) => {

    const elements = [];
    const middlecenter = {
      position: 'MiddleCenter',
      element: htmlElement
    }
    const unsetPosition = {
      position: '',
      element: htmlElement
    }
    elements.push(middlecenter, unsetPosition);

    const allPositions = [
      'TopLeft',
      'TopCenter',
      'TopRight',
      'MiddleLeft',
      'MiddleRight',
      'BottomLeft',
      'BottomCenter',
      'BottomRight'
    ];

    allPositions.forEach((position) => {
      // add a shape for each position
      const element = {
        position: position,
        element: htmlElement
      }
      elements.push(element);
    });

    expect(() => {
      const hierarchical = new HyperviewLayoutHierarchical(elements, logger);
      const normalizeSpy = spyOn<any>(hierarchical, 'normalize').and.callThrough();
      hierarchical.layout();

      expect(normalizeSpy).toHaveBeenCalled();
    }).not.toThrowError();
  }));
});
