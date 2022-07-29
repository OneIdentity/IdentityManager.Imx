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

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from 'ng-bullet';

import { PortalCartitem } from 'imx-api-qer';

import { TermsOfUseListComponent } from './terms-of-use-list.component';
import { TermsOfUseService } from './terms-of-use.service';

describe('TermsOfUseListComponent', () => {
  let component: TermsOfUseListComponent;
  let fixture: ComponentFixture<TermsOfUseListComponent>;

  const getTermsOfUseSpy = jasmine.createSpy('getTermsOfUse').and.callThrough();
  const getDownloadOptionsSpy = jasmine.createSpy('getDownloadOptionsSpy').and.callThrough();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      declarations: [
        TermsOfUseListComponent
      ],
      imports: [
        MatCheckboxModule,
        MatCardModule,
        MatStepperModule,
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: TermsOfUseService,
          useValue: {
            getTermsOfUse: getTermsOfUseSpy,
            getDownloadOptions: getDownloadOptionsSpy
          }
        },
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsOfUseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should determine all terms of use data for the given portalcartitems', async () => {

    // Arrange
    component.items = [
      {
        UID_QERTermsOfUse: { value: 'uid-termsOfUse-123' }
      },
      {
        UID_QERTermsOfUse: { value: 'uid-termsOfUse-456' }
      },
      {
        UID_QERTermsOfUse: { value: 'uid-termsOfUse-123' }
      }
    ] as PortalCartitem[];

    const dummyUid = 'uid-termsOfUse-123';

    // Act
    const serviceItems = await component.ngOnInit();

    // Assert
    expect(getTermsOfUseSpy).toHaveBeenCalledWith(['uid-termsOfUse-123', 'uid-termsOfUse-456']);
  });

  it('should determine all portalcartitems for the given terms of use', () => {

    // Arrange
    component.items = [
      {
        UID_QERTermsOfUse: { value: 'uid-termsOfUse-123' }
      },
      {
        UID_QERTermsOfUse: { value: 'uid-termsOfUse-456' }
      },
      {
        UID_QERTermsOfUse: { value: 'uid-termsOfUse-123' }
      }
    ] as PortalCartitem[];

    const dummyUid = 'uid-termsOfUse-123';

    // Act
    const serviceItems = component.getTermsOfUseItems(dummyUid);

    // Assert
    expect(serviceItems.length).toBe(2);
  });
});
