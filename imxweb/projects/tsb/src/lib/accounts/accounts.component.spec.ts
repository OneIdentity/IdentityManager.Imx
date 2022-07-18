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

import { DataExplorerAccountsComponent } from './accounts.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdrModule, AppConfigService } from 'qbm';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProjectConfigurationService } from 'qer';
import { AccountsService } from './accounts.service';
import { TypedEntityCollectionData, CollectionLoadParameters } from 'imx-qbm-dbts';
import { TsbTestBed } from '../test/tsb-test-bed.spec';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TsbCommonTestData } from '../test/common-test-mocks.spec';
import { DeHelperService } from '../de-helper.service';

function mockGetAccounts(): TypedEntityCollectionData<any> {
  return { totalCount: 100, Data: ['1', '2', '3'] };
}

describe('DataExplorerAccountsComponent', () => {
  let component: DataExplorerAccountsComponent;
  let fixture: ComponentFixture<DataExplorerAccountsComponent>;
  const navigationState: CollectionLoadParameters = { StartIndex: 1, PageSize: 50 };
  const keyword = 'test1';

  TsbTestBed.configureTestingModule({
    declarations: [DataExplorerAccountsComponent],
    imports: [FormsModule, ReactiveFormsModule, CdrModule, NoopAnimationsModule],
    providers: [
      {
        provide: AppConfigService,
        useValue: TsbCommonTestData.mockAppConfigService,
      },
      {
        provide: ProjectConfigurationService,
        useValue: TsbCommonTestData.mockConfigService,
      },
      {
        provide: AccountsService,
        useValue: {
          getAccounts: jasmine.createSpy('getAccounts').and.returnValue(Promise.resolve(mockGetAccounts())),
        },
      },
      DeHelperService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataExplorerAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change navigation state', async () => {
    await component.onNavigationStateChanged(navigationState);
    expect(component.navigationState).toEqual(navigationState);
  });

  it('should search and reset start index ', async () => {
    await component.onSearch(keyword);
    expect(component.navigationState.StartIndex).toEqual(0);
  });

  it('should search for keyword ', async () => {
    await component.onSearch(keyword);
    expect(component.navigationState.search).toEqual(keyword);
  });
});
