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

import { TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { configureTestSuite } from 'ng-bullet';

import { StartComponent } from './start.component';
import { clearStylesFromDOM } from 'qbm';
import { AppcontainerService } from '../appcontainer.service';

describe('StartComponent', () => {
  const getAppContainersSpy = jasmine
    .createSpy('getAppContainers')
    .and.returnValue(Promise.resolve([{ link: '', app: { name: '', description: '', version: '' } }]));

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        StartComponent
      ],
      imports: [
        MatCardModule
      ],
      providers: [
        {
          provide: AppcontainerService,
          useClass: class {
            public getAppContainers = getAppContainersSpy;
          }
        }
      ]
    });
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', async () => {
    const fixture = TestBed.createComponent(StartComponent);
    const component: StartComponent = fixture.debugElement.componentInstance;
    expect(component).toBeDefined();
    expect(component.apps.length).toEqual(0);
    await component.ngOnInit();
    expect(component.apps.length).toBeGreaterThan(0);
    expect(getAppContainersSpy).toHaveBeenCalled();
  });
});
