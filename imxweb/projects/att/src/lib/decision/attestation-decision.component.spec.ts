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

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { Subject, of } from 'rxjs';

import { AuthenticationService, clearStylesFromDOM, UserMessageService } from 'qbm';
import { AttestationActionService } from '../attestation-action/attestation-action.service';
import { AttestationCasesService } from './attestation-cases.service';
import { AttestationDecisionComponent } from './attestation-decision.component';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PortalAttestationApprove } from 'imx-api-att';
import { ApiService } from '../api.service';
import { AttestationFeatureGuardService } from '../attestation-feature-guard.service';

describe('AttestationDecisionComponent', () => {
  let component: AttestationDecisionComponent;
  let fixture: ComponentFixture<AttestationDecisionComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        AttestationDecisionComponent
      ],
      imports: [
        MatMenuModule
      ],
      providers: [
        {
          provide: AttestationActionService,
          useValue: {
            applied: new Subject()
          }
        },
        {
          provide: AttestationCasesService,
          useValue: {
            attestationApproveSchema: PortalAttestationApprove.GetEntitySchema(),
            get: jasmine.createSpy('get').and.returnValue(Promise.resolve({})),
            getDataModel: jasmine.createSpy('getDataModel').and.returnValue(Promise.resolve({
              Properties: [],
              GroupInfo: [],
              Filters: []
            })),
            createGroupData: (__1, __2) => undefined
          }
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        },
        {
          provide: AttestationFeatureGuardService,
          useValue: {
            getAttestationConfig: () => Promise.resolve({
              isUserEscalationApprover: false
            })
          }
        },
        {
          provide: EuiSidesheetService,
          useValue: {}
        },
        {
          provide: UserMessageService,
          useValue: {
            subject: new Subject()
          }
        },
        {
          provide: AuthenticationService,
          useValue: {
            onSessionResponse: new Subject()
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: {
              pipe: () => {
                return of({});
              }
            }
          }
        },
        {
          provide: MatDialog,
          useValue: {
            open: () => { }
          }
        },
        {
          provide: ApiService,
          useValue: {
            client: {
              portal_attestation_config_get: () => Promise.resolve({})
            }
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttestationDecisionComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('inits the attestation cases table', async() => {
    fixture.detectChanges();

    await component.ngOnInit();

    expect(component.dstSettings).toBeDefined();
  });
});
