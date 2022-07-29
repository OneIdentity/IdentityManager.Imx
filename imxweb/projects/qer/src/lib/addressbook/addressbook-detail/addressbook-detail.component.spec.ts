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

import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM } from 'qbm';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { AddressbookDetailComponent } from './addressbook-detail.component';

@Component({
  selector: 'imx-property-viewer',
  template: '<p>MockPropertyViewerComponent</p>'
})
class MockPropertyViewerComponent {
  @Input() properties: any;
}

describe('AddressbookDetailComponent', () => {
  let component: AddressbookDetailComponent;
  let fixture: ComponentFixture<AddressbookDetailComponent>;

  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        AddressbookDetailComponent,
        MockPropertyViewerComponent
      ],
      providers: [
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: {}
        },
        {
          provide: ProjectConfigurationService,
          useValue: {
            getConfig: () => Promise.resolve({ PersonConfig: { ShowOrgChart: true } })
          }
        },
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: EuiSidesheetRef,
          useValue: {}
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressbookDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
