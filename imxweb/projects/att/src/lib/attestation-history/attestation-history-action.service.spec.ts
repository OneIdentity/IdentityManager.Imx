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

import { SnackBarService, EntityService } from 'qbm';
import { IEntityColumn } from 'imx-qbm-dbts';
import { AttestationHistoryActionService } from './attestation-history-action.service';
import { AttestationCasesService } from '../decision/attestation-cases.service';
import { AttestationActionService } from '../attestation-action/attestation-action.service';

describe('AttestationHistoryActionService', () => {
  let service: AttestationHistoryActionService;

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

    readonly attestationCasesStub = new class {
    }();

    reset() {
      this.sideSheetServiceStub.result = false;

      Object.keys(this.attestationCasesStub).forEach(name =>
        this.attestationCasesStub[name].calls.reset()
      );
    }
  }();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        AttestationHistoryActionService,
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
          provide: AttestationCasesService,
          useValue: testHelper.attestationCasesStub
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
          provide: AttestationActionService,
          useValue: {}
        }
      ]
    });
    service = TestBed.inject(AttestationHistoryActionService);
  });

  beforeEach(() => {
    testHelper.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

});
