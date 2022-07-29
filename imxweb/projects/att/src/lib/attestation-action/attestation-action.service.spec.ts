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
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { of } from 'rxjs';

import { AttestationActionService } from './attestation-action.service';
import { SnackBarService, EntityService, BaseCdr, ExtService } from 'qbm';
import { AttestationCasesService } from '../decision/attestation-cases.service';
import { JustificationService, PersonService, ProjectConfigurationService } from 'qer';
import { IEntityColumn } from 'imx-qbm-dbts';
import { AttestationCase } from '../decision/attestation-case';
import { AttestationWorkflowService } from './attestation-workflow.service';
import { ApiService } from '../api.service';

describe('AttestationActionService', () => {
  let service: AttestationActionService;

  function createColumn(name: string): IEntityColumn {
    let value: any;
    return {
      ColumnName: name,
      GetValue: () => value,
      PutValue: newValue => value = newValue
    } as IEntityColumn;
  }

  const testHelper = new class {
    readonly sideSheetServiceStub = new class {
      result = false;
      readonly testdata = {
        reason: 'some reason',
        justification: 'some justification'
      };

      open(_dialogType, config: { data: any }) {
        return {
          afterClosed: () => {
            if (this.result && config.data.actionParameters) {
              Object.keys(config.data.actionParameters).forEach(name =>
                config.data.actionParameters[name].column.PutValue(this.testdata[name])
              );
            }

            return of(this.result);
          }
        }
      }
    }();

    readonly attestationCasesServiceStub = new class {
      readonly makeDecision = jasmine.createSpy('makeDecision');
    }();

    reset() {
      this.sideSheetServiceStub.result = false;

      Object.keys(this.attestationCasesServiceStub).forEach(name =>
        this.attestationCasesServiceStub[name].calls.reset()
      );
    }
  }();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        AttestationActionService,
        {
          provide: ProjectConfigurationService,
          useValue: {
            getConfig: __ => Promise.resolve({
              ITShopConfig: {
                StepUpAuthenticationProvider: 'NoAuth'
              }
            })
          }
        },
        {
          provide: ApiService,
          useValue: {}
        },
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        },
        {
          provide: EntityService,
          useValue: {
            createLocalEntityColumn: property => createColumn(property.name)
          }
        },
        {
          provide: JustificationService,
          useValue: {
            createCdr: _type => new BaseCdr(createColumn('Justification'))
          }
        },
        {
          provide: AttestationCasesService,
          useValue: testHelper.attestationCasesServiceStub
        },
        {
          provide: EuiSidesheetService,
          useValue: testHelper.sideSheetServiceStub
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        },
        {
          provide: PersonService,
          useValue: {}
        },
        {
          provide: AttestationWorkflowService,
          useValue: {}
        },
        {
          provide: ExtService,
          useValue: {}
        }
      ]
    });
    service = TestBed.inject(AttestationActionService);
  });

  beforeEach(() => {
    testHelper.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should approve and thereby also save any changes to attestation parameters', async () => {
    testHelper.sideSheetServiceStub.result = true;
    const acase = {
      commit: jasmine.createSpy('Commit')
    } as any as AttestationCase;

    await service.approve([acase]);

    expect(acase.commit).toHaveBeenCalled();
    expect(testHelper.attestationCasesServiceStub.makeDecision).toHaveBeenCalledWith(acase, {
      Reason: testHelper.sideSheetServiceStub.testdata.reason,
      UidJustification: testHelper.sideSheetServiceStub.testdata.justification,
      Decision: true
    });
  });

  it('should deny', async () => {
    testHelper.sideSheetServiceStub.result = true;
    const acase = {} as AttestationCase;
    await service.deny([acase]);
    expect(testHelper.attestationCasesServiceStub.makeDecision).toHaveBeenCalledWith(acase, {
      Reason: testHelper.sideSheetServiceStub.testdata.reason,
      UidJustification: testHelper.sideSheetServiceStub.testdata.justification,
      Decision: false
    });
  });
});
