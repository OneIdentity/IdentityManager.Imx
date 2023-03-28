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
 * Copyright 2021 One Identity LLC.
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
import { configureTestSuite } from 'ng-bullet';

import { LoggerTestingModule } from 'ngx-logger/testing';
import { PolicyFilter, PortalAttestationFilterMatchingobjects, PortalAttestationPolicy, PortalAttestationPolicyEdit, PortalAttestationPolicyEditInteractive } from 'imx-api-att';
import { PolicyService } from './policy.service';
import { ApiService } from '../api.service';
import { AppConfigService, ElementalUiConfigService } from 'qbm';

describe('PolicyService', () => {

  const emptyElement = {
    Ident_AttestationPolicy: {
      GetMetadata: () => ({
        CanEdit: () => true,
        GetMaxLength: ()=> 500
      }),
      Column: {
        PutValueStruct: jasmine.createSpy('PutValueStruct')
      }
    },
    Description: {
      GetMetadata: () => ({
        CanEdit: () => true
      }),
      Column: {
        PutValueStruct: jasmine.createSpy('PutValueStruct')
      }
    },
    IsApproveRequiresMfa: {
      GetMetadata: () => ({
        CanEdit: () => true
      }),
      Column: {
        PutValueStruct: jasmine.createSpy('PutValueStruct')
      }
    },
    IsAutoCloseOldCases: {
      GetMetadata: () => ({
        CanEdit: () => true
      }),
      Column: {
        PutValueStruct: jasmine.createSpy('PutValueStruct')
      }
    },
    IsInActive: {
      GetMetadata: () => ({
        CanEdit: () => true
      }),
      Column: {
        PutValueStruct: jasmine.createSpy('PutValueStruct')
      }
    },
    RiskIndex: {
      GetMetadata: () => ({
        CanEdit: () => true
      }),
      Column: {
        PutValueStruct: jasmine.createSpy('PutValueStruct')
      }
    },
    SolutionDays: {
      GetMetadata: () => ({
        CanEdit: () => true
      }),
      Column: {
        PutValueStruct: jasmine.createSpy('PutValueStruct')
      }
    },
    UID_DialogCulture: {
      GetMetadata: () => ({
        CanEdit: () => true
      }),
      Column: {
        PutValueStruct: jasmine.createSpy('PutValueStruct')
      }
    },
    UID_AttestationObject: {
      GetMetadata: () => ({
        CanEdit: () => true
      }),
      Column: {
        PutValueStruct: jasmine.createSpy('PutValueStruct')
      }
    },
    UID_PWODecisionMethod: {
      GetMetadata: () => ({
        CanEdit: () => true
      }),
      Column: {
        PutValueStruct: jasmine.createSpy('PutValueStruct')
      }
    },
    UID_DialogSchedule: {
      GetMetadata: () => ({
        CanEdit: () => true
      }),
      Column: {
        PutValueStruct: jasmine.createSpy('PutValueStruct')
      }
    },
    Areas: {
      GetMetadata: () => ({
        CanEdit: () => true
      }),
      Column: {
        PutValueStruct: jasmine.createSpy('PutValueStruct')
      }
    },
    Attestators: {
      GetMetadata: () => ({
        CanEdit: () => true
      }),
      Column: {
        PutValueStruct: jasmine.createSpy('PutValueStruct')
      }
    },
    UID_PersonOwner: {
      GetMetadata: () => ({
        CanEdit: () => false
      })
    },
    NextRun: {
      GetMetadata: () => ({
        CanEdit: () => false
      })
    },
    IsOob: {
      GetMetadata: () => ({
        CanEdit: () => false
      })
    },
    CountOpenCases: {
      GetMetadata: () => ({
        CanEdit: () => false
      })
    },
    IsPolicyWithRemove: {
      GetMetadata: () => ({
        CanEdit: () => false
      })
    }, UID_QERPickCategory: {
      GetMetadata: () => ({
        CanEdit: () => false
      })
    }, IsPickCategoryMismatch: {
      GetMetadata: () => ({
        CanEdit: () => false
      })
    }
  } as unknown;


  const apiServiceStub = {
    client: {
      portal_attestation_filter_candidates_get: jasmine.createSpy('portal_attestation_filter_candidates_get')
        .and.returnValue(Promise.resolve({ totalCount: 1, Data: [] })),
      portal_attestation_filter_model_get: jasmine.createSpy('portal_attestation_filter_model_get')
        .and.returnValue(Promise.resolve({ ParmData: [{ uid: 'parameter1' }] })),
      portal_attestation_policy_edit_delete: jasmine.createSpy('portal_attestation_policy_edit_delete').and.returnValue(Promise.resolve()),
      portal_attestation_policy_run_post: jasmine.createSpy('portal_attestation_policy_run_post').and.returnValue(Promise.resolve()),
      portal_attestation_policy_group_get: jasmine.createSpy('portal_attestation_policy_group_get').and.returnValue(Promise.resolve([])),
      portal_attestation_policy_datamodel_get: jasmine.createSpy('portal_attestation_policy_datamodel_get').and.returnValue(Promise.resolve())
    },
    typedClient: {
      PortalAttestationPolicyEditInteractive: {
        GetSchema: () => PortalAttestationPolicyEditInteractive.GetEntitySchema(),
        Get_byid: jasmine.createSpy('Get_byid').and.returnValue(Promise.resolve({ totalCount: 1, Data: [] })),
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ totalCount: 1, Data: [emptyElement] }))
      },
      PortalAttestationPolicyEditInteractive_byid :  {
        Get_byid: jasmine.createSpy('Get_byid').and.returnValue(Promise.resolve({ totalCount: 1, Data: [] })),
      },
      PortalAttestationPolicy: {
        GetSchema: () => PortalAttestationPolicy.GetEntitySchema(),
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ totalCount: 1, Data: [] }))
      },
      PortalAttestationFilterMatchingobjects: {
        GetSchema: () => PortalAttestationFilterMatchingobjects.GetEntitySchema(),
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ totalCount: 1, Data: [] }))
      },

    }
  };

  let service: PolicyService;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule
      ],
      providers: [
        {
          provide: ApiService,
          useValue: apiServiceStub
        },
        {
          provide: AppConfigService,
          useValue: {}
        },
        {
          provide: ElementalUiConfigService,
          useValue: {
            Config: jasmine.createSpy('Config').and.returnValue({ downloadOptions: {} })
          }
        }
      ]
    });
    service = TestBed.inject(PolicyService);
  });


  beforeEach(() => {
    apiServiceStub.typedClient.PortalAttestationPolicyEditInteractive.Get_byid.calls.reset();
    apiServiceStub.typedClient.PortalAttestationPolicyEditInteractive.Get.calls.reset();
    apiServiceStub.typedClient.PortalAttestationFilterMatchingobjects.Get.calls.reset();
    apiServiceStub.typedClient.PortalAttestationPolicy.Get.calls.reset();
    apiServiceStub.client.portal_attestation_filter_candidates_get.calls.reset();
    apiServiceStub.client.portal_attestation_filter_model_get.calls.reset();
    apiServiceStub.client.portal_attestation_policy_edit_delete.calls.reset();
    apiServiceStub.client.portal_attestation_policy_run_post.calls.reset();
    apiServiceStub.client.portal_attestation_policy_group_get.calls.reset();
    apiServiceStub.client.portal_attestation_policy_datamodel_get.calls.reset();
  });

  it('can getPolicies', async () => {
    const state = { PageSize: 10 };
    await service.getPolicies(state);
    expect(apiServiceStub.typedClient.PortalAttestationPolicy.Get)
      .toHaveBeenCalledWith(state);
  });

  it('can getPolicy for editing', async () => {
    await service.getPolicyEditInteractive('policy');
    expect(apiServiceStub.typedClient.PortalAttestationPolicyEditInteractive_byid.Get_byid)
      .toHaveBeenCalledWith('policy');
  });

  it('can get ParmData', async () => {
    const params = await service.getParmData('uid');
    expect(apiServiceStub.client.portal_attestation_filter_model_get)
      .toHaveBeenCalledWith('uid');
    expect(params.length).toBe(1);
  });

  it('can get filter candidates', async () => {
    const state = { PageSize: 10 }
    await service.getFilterCandidates(state, 'uid')
    expect(apiServiceStub.client.portal_attestation_filter_candidates_get)
      .toHaveBeenCalledWith('uid', undefined, undefined, 10, undefined, null, undefined, undefined);
  });

  it('can delete attestation policy', async () => {
    await service.deleteAttestationPolicy('uid');
    expect(apiServiceStub.client.portal_attestation_policy_edit_delete)
      .toHaveBeenCalledWith('uid');
  });


  it('can build new entity', async () => {
    await service.buildNewEntity();
    expect(apiServiceStub.typedClient.PortalAttestationPolicyEditInteractive.Get).toHaveBeenCalled();
  });

  for (const testcase of [undefined, {} as PolicyFilter]) {

    it('can build an entity copy', async () => {
      const reference = {
        Ident_AttestationPolicy: {
          value: 'uidpolicy',
          Column: {
            GetDisplayValue: () => '',
            GetMetadata: () => ({
              CanEdit: () => true,
            })
          },
          GetMetadata: () => ({
            GetMaxLength: () => 300
          })
        },
        Description: {
          value: 'uidpolicy',
          Column: {
            GetDisplayValue: () => '',
            GetMetadata: () => ({
              CanEdit: () => true
            })
          }
        },
        IsApproveRequiresMfa: {
          value: 'true',
          Column: {
            GetDisplayValue: () => '',
            GetMetadata: () => ({
              CanEdit: () => true
            })
          }
        },
        IsAutoCloseOldCases: {
          value: 'true',
          Column: {
            GetDisplayValue: () => '',
            GetMetadata: () => ({
              CanEdit: () => true
            })
          }
        },
        IsInActive: {
          value: 'true',
          Column: {
            GetDisplayValue: () => '',
            GetMetadata: () => ({
              CanEdit: () => true
            })
          }
        },
        RiskIndex: {
          value: 0.9,
          Column: {
            GetDisplayValue: () => '',
            GetMetadata: () => ({
              CanEdit: () => true
            })
          }
        },
        SolutionDays: {
          value: 7,
          Column: {
            GetDisplayValue: () => '',
            GetMetadata: () => ({
              CanEdit: () => true
            })
          }
        },
        UID_DialogCulture: {
          value: 'uidDialogCulture',
          Column: {
            GetDisplayValue: () => '',
            GetMetadata: () => ({
              CanEdit: () => true
            })
          }
        },
        UID_AttestationObject: {
          value: 'uidAttestationObject',
          Column: {
            GetDisplayValue: () => '',
            GetMetadata: () => ({
              CanEdit: () => true
            })
          }
        },
        UID_PWODecisionMethod: {
          value: 'uidPWODecisionMethod',
          Column: {
            GetDisplayValue: () => '',
            GetMetadata: () => ({
              CanEdit: () => true
            })
          }
        },
        UID_DialogSchedule: {
          value: 'DialogSchedule',
          Column: {
            GetDisplayValue: () => '',
            GetMetadata: () => ({
              CanEdit: () => true
            })
          }
        },
        Areas: {
          value: 'area',
          Column: {
            GetDisplayValue: () => '',
            GetMetadata: () => ({
              CanEdit: () => true
            })
          }
        },
        Attestators: {
          value: 'attestator',
          Column: {
            GetDisplayValue: () => '',
            GetMetadata: () => ({
              CanEdit: () => true
            })
          }
        },
        UID_PersonOwner: {
          GetMetadata: () => ({
            CanEdit: () => false
          })
        },
        NextRun: {
          GetMetadata: () => ({
            CanEdit: () => false
          })
        },
        IsOob: {
          GetMetadata: () => ({
            CanEdit: () => false
          })
        },
        CountOpenCases: {
          GetMetadata: () => ({
            CanEdit: () => false
          })
        },
        IsPolicyWithRemove: {
          GetMetadata: () => ({
            CanEdit: () => false
          })
        },
        UID_QERPickCategory: {
          value: 'category',
          Column: {
            GetDisplayValue: () => '',
            GetMetadata: () => ({
              CanEdit: () => false
            })
          },
          GetMetadata: () => ({
            CanEdit: () => false
          })
        }, IsPickCategoryMismatch: {
          value: true,
          GetMetadata: () => ({
            CanEdit: () => false
          })
        }
      } as unknown;

      const filter = testcase

      await service.buildNewEntity(reference as PortalAttestationPolicyEdit, filter);
    });
  }

  it('can get objects matching filter', async () => {
    await service.getObjectsForFilter('uidAttestation', '', {} as PolicyFilter, {});
    expect(apiServiceStub.typedClient.PortalAttestationFilterMatchingobjects.Get)
      .toHaveBeenCalledWith('uidAttestation', { uidpickcategory: '', policyfilter: {} });
  });

  it('can create attestion run', async () => {
    await service.createAttestationRun('uidPolicy', ['key'])
    expect(apiServiceStub.client.portal_attestation_policy_run_post)
      .toHaveBeenCalledWith('uidPolicy', { ObjectKeys: ['key'] });
  });
});
