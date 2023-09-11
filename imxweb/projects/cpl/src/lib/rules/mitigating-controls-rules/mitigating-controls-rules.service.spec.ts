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

import { MockBuilder, MockedComponentFixture, MockRender } from 'ng-mocks';
import { ApiService } from '../../api.service';

import { MitigatingControlsRulesService } from './mitigating-controls-rules.service';

describe('MitigatingControlsRulesService', () => {
  let service: MitigatingControlsRulesService;
  let fixture: MockedComponentFixture<MitigatingControlsRulesService>;

  beforeEach(() => {
    return MockBuilder([MitigatingControlsRulesService])
      .mock(ApiService)
      .beforeCompileComponents(testBed => {
        testBed.configureTestingModule({
        });
      });
  });

  beforeEach(() => {
    fixture = MockRender(MitigatingControlsRulesService);
    service = fixture.point.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
