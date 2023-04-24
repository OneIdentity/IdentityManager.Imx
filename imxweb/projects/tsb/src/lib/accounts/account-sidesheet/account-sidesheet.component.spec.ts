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
import { AccountSidesheetComponent } from './account-sidesheet.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdrModule, AppConfigService, ElementalUiConfigService, ExtService } from 'qbm';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DeHelperService } from '../../de-helper.service';
import { TsbTestBed } from '../../test/tsb-test-bed.spec';
import { TsbCommonTestData } from '../../test/common-test-mocks.spec';
import { DbObjectKey, IEntity, IEntityColumn, IValueMetadata } from 'imx-qbm-dbts';
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { PortalAdminPerson, PortalPersonUid } from 'imx-api-qer';
import { AccountsService } from '../accounts.service';
import { AccountsReportsService } from '../accounts-reports.service';
import { ProjectConfigurationService, IdentitiesService } from 'qer';
import { Component, Input } from '@angular/core';
import { AccountTypedEntity } from '../account-typed-entity';

@Component({
  selector: 'imx-data-explorer-groups',
  template: '<p>MockDataExplorerGroupsComponent</p>'
})
export class MockDataExplorerGroupsComponent {
  @Input() unsAccountIdFilter: any;
  @Input() sidesheetWidth: any;
}

describe('AccountSidesheetComponent', () => {
  let component: AccountSidesheetComponent;
  let fixture: ComponentFixture<AccountSidesheetComponent>;

  const account = {
    displayColumn: {},
    isNeverConnectManualColumn: {},
    objectKeyManagerColumn: {},
    uidPersonColumn: {},
    uidADSDomain: {}
  } as AccountTypedEntity;

  function initColumn(column: IEntityColumn) {
    let value;

    column.GetMetadata = () => ({
      CanEdit: () => true,
      GetDisplay: () => '',
      GetMinLength: () => 0,
      GetMaxLength: () =>  255,
    } as IValueMetadata);
    column.GetValue = () => value;
    column.PutValue = v => { value = v; return Promise.resolve(); }
  }

  function initAccount() {
    account.GetEntity = () => ({
      GetDisplay: () => 'Display value',
      GetKeys: () => ['1']
    } as IEntity);
    initColumn(account.displayColumn);
    initColumn(account.isNeverConnectManualColumn);
    initColumn(account.objectKeyManagerColumn);
    initColumn(account.uidPersonColumn);
    initColumn(account.uidADSDomain);
  }

  TsbTestBed.configureTestingModule({
    declarations: [
      AccountSidesheetComponent,
      MockDataExplorerGroupsComponent
    ],
    imports: [FormsModule, ReactiveFormsModule, CdrModule, NoopAnimationsModule],
    providers: [
      {
        provide: AppConfigService,
        useValue: TsbCommonTestData.mockAppConfigService
      },
      {
        provide: IdentitiesService,
        useValue: {
          getAdminPerson: jasmine.createSpy('getAdminPerson').and.returnValue(Promise.resolve({
            UID_PersonHead: { Column: TsbCommonTestData.mockEntityColumn },
          } as PortalAdminPerson)),
          getPerson: jasmine.createSpy('getPerson').and.returnValue(Promise.resolve({
            UID_PersonHead: { Column: TsbCommonTestData.mockEntityColumn },
          } as PortalPersonUid)),
        }
      },
      {
        provide: AccountsService,
        useValue: {
          getAccount: jasmine.createSpy('getAccount')
        }
      },
      {
        provide: EUI_SIDESHEET_DATA,
        useValue: {
          unsAccountId: 'test1',
          selectedAccount: account,
          tableName: 'test'
        }
      },
      {
        provide: ElementalUiConfigService,
        useValue: { 
          Config: jasmine.createSpy('Config').and.returnValue({ downloadOptions: {} })
        }
      },
      DeHelperService,
      ExtService,
      AccountsReportsService,
      {
        provide: ProjectConfigurationService,
        useValue: TsbCommonTestData.mockConfigService
      }
    ]
  });

  beforeEach(() => {
    initAccount();

    fixture = TestBed.createComponent(AccountSidesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('GET identityManagerMatchesAccountManager tests', () => {
    const mockTableName = 'ADSAccount';
    const mockKeyValue = 'testacckey1';

    beforeEach(() => {      
      component.linkedIdentitiesManager = new DbObjectKey(mockTableName, mockKeyValue);
    });
    it('should return true when the identity has a manager and the account value matches the selected account manager value', () => {
      account.objectKeyManagerColumn.GetValue = () => `<Key><T>${mockTableName}</T><P>${mockKeyValue}</P></Key>`;

      const result = component.identityManagerMatchesAccountManager;
      expect(result).toEqual(true);
    });

    it('should return false otherwise', () => {
      const result = component.identityManagerMatchesAccountManager;
      expect(result).toEqual(false);
    });
  });

  describe('syncToIdentityManager() tests', () => {
    const mockTableName = 'ADSAccount';
    const mockKeyValue = 'testacckey1';

    beforeEach(() => {
      component.linkedIdentitiesManager = new DbObjectKey(mockTableName, mockKeyValue);
      component.unsavedSyncChanges = false;
    });
    it('should set the value on the selectedAccounts manager to match the identities when the toggle is checked', async () => {
      await component.syncToIdentityManager({ checked: true, source: undefined });
      expect(component.selectedAccount.objectKeyManagerColumn.GetValue()).toEqual(`<Key><T>${mockTableName}</T><P>${mockKeyValue}</P></Key>`);
      expect(component.unsavedSyncChanges).toEqual(true);
    });
    it('should do nothing if the toggle is not checked', async () => {
      await component.syncToIdentityManager({ checked: false, source: undefined });
      expect(component.selectedAccount.objectKeyManagerColumn.GetValue()).not.toBeDefined();
      expect(component.unsavedSyncChanges).toEqual(false);
    });
  });
});
