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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImxTranslationProviderService, imx_SessionService } from 'qbm';
import { Observable } from 'rxjs';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { QerApiService } from '../../qer-api-client.service';
import { DataManagementService } from '../data-management.service';
import { RoleService } from '../role.service';

import { RoleMembershipsComponent } from './role-memberships.component';

describe('RoleMembershipsComponent', () => {
  let component: RoleMembershipsComponent;
  let fixture: ComponentFixture<RoleMembershipsComponent>;
  const mockQerApiService = {
    typedClient: {
    },
    client: {
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RoleMembershipsComponent],
      providers: [
        {
          provide: QerApiService,
          useValue: mockQerApiService
        },
        {
          provide: imx_SessionService,
          useValue: {}
        },
        {
          provide: ImxTranslationProviderService,
          useValue: {
            init: jasmine.createSpy('init').and.returnValue(Promise.resolve())
          }
        },
        {
          provide: ProjectConfigurationService,
          useValue: {}
        },
        {
          provide: RoleService,
          useValue: {
            canHavePrimaryMemberships: _ => true,
            canHaveDynamicMemberships: _ => false,
          },
        },
        {
          provide: DataManagementService,
          useValue: {
            autoMembershipDirty$: new Observable(),
            entityInteractive: {
              GetEntity: () => {
                return {
                  GetColumn: (name: string) => {},
                  GetSchema: () => {
                    return {
                      Columns: {}
                    }
                  }
                }
              },
            }
          }
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleMembershipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
