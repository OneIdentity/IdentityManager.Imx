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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiSidesheetRef, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { of, Subject } from 'rxjs';

import { IdentitySidesheetComponent } from './identity-sidesheet.component';
import { IdentitiesService } from '../identities.service';
import { CdrModule, clearStylesFromDOM, ExtService, IExtension, MessageDialogResult, MetadataService, ElementalUiConfigService, AppConfigService, ConfirmationService, SystemInfoService } from 'qbm';
import { PortalAdminPerson, PortalPersonRolemembershipsAerole } from 'imx-api-qer';
import { IdentitesTestBed } from '../test/identities-test-bed.spec';
import { IdentitiesCommonTestData } from '../test/common-test-mocks.spec';
import { IdentitiesReportsService } from '../identities-reports.service';
import { IdentityRoleMembershipsService } from './identity-role-memberships/identity-role-memberships.service';

@Component({
  selector: 'imx-object-attestation',
  template: '<p>MockObjectAttestationComponent</p>'
})
class MockObjectAttestationComponent {
  @Input() parameters: any;
}

describe('IdentitySidesheetComponent', () => {
  let component: IdentitySidesheetComponent;
  let fixture: ComponentFixture<IdentitySidesheetComponent>;

  let extRegistrySpy: jasmine.Spy;

  const extRegistry: { [id: string]: IExtension[]; } = {
    AccountsExtComponent: [{
      instance: {}
    } as IExtension],
    IdentityGroupMembershipService:
      [{
        instance: {}
      } as IExtension],
  };

  const adminPerson = {
    GetEntity: () => IdentitiesCommonTestData.mockEntity,
    DefaultEmailAddress: { Column: IdentitiesCommonTestData.mockEntityColumn },
    IsSecurityIncident: { Column: IdentitiesCommonTestData.mockEntityColumn },
    IsInActive: {
      Column: IdentitiesCommonTestData.mockEntityColumn,
      GetMetadata: (_) => { return { CanEdit: () => true } }
    },
    UID_PersonHead: { Column: IdentitiesCommonTestData.mockEntityColumn },
    XMarkedForDeletion: { Column: IdentitiesCommonTestData.mockEntityColumn },
  } as PortalAdminPerson;

  const sideSheetData = {
    selectedIdentity: adminPerson,
    isAdmin: true
  }

  const sidesheetService = {
    close: jasmine.createSpy('close')
  };

  const deleteIdentitySpy = jasmine.createSpy('deleteIdentity').and.returnValue(Promise.resolve({}));

  const metadataServiceStub = {
    tables: {
      UNSAccountInUNSGroup: { Display: '' },
      AERole: { Display: '' },
    },
    update: jasmine.createSpy('update')
  };

  let confirm = true;
  const mockConfirmationService = {
    confirm: jasmine.createSpy('confirm')
      .and.callFake(() => Promise.resolve(confirm))
  }

  IdentitesTestBed.configureTestingModule({
    declarations: [
      IdentitySidesheetComponent,
      MockObjectAttestationComponent
    ],
    imports: [FormsModule, ReactiveFormsModule, CdrModule, NoopAnimationsModule, MatExpansionModule],
    providers: [
      {
        provide: AppConfigService,
        useValue: {
          client: {},
          apiClient: {}
        }
      },
      {
        provide: SystemInfoService,
        useValue: {
          get: () => Promise.resolve({
            PreProps: []
          })
        }
      },
      {
        provide: IdentitiesService,
        useValue: {
          deleteIdentity: deleteIdentitySpy
        }
      },
      IdentitiesReportsService,
      {
        provide: EuiSidesheetService,
        useValue: sidesheetService
      },
      {
        provide: EUI_SIDESHEET_DATA,
        useValue: sideSheetData
      },
      {
        provide: ConfirmationService,
        useValue: mockConfirmationService
      },
      {
        provide: MatDialog,
        useValue: {
          open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(MessageDialogResult.YesResult) })
        }
      },
      {
        provide: IdentityRoleMembershipsService,
        useValue: {
          getAeroleMemberships: jasmine.createSpy('getAeroleMemberships'),
          PortalPersonRolemembershipsAerole: PortalPersonRolemembershipsAerole.GetEntitySchema()
        }
      },
      {
        provide: MetadataService,
        useValue: metadataServiceStub
      },
      {
        provide: ElementalUiConfigService,
        useValue: {
          Config: jasmine.createSpy('Config').and.returnValue({ downloadOptions: {} })
        }
      },
      {
        provide: EuiSidesheetRef,
        useValue: {
          closeClicked: () => new Subject(),
          close: __ => { }
        }
      },
      ExtService,
    ]
  });

  beforeAll(() => {
    const extService = TestBed.inject(ExtService);
    extRegistrySpy = spyOnProperty(extService, 'Registry').and.returnValue(extRegistry);
    deleteIdentitySpy.calls.reset();
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentitySidesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('GET selectedIdentity() tests', () => {
    it('should return the `selectedIdentity` property from the service', () => {
      expect(component.data.selectedIdentity).toEqual(adminPerson);
    });
  });

  describe('GET isIdentityMarkedForDelete() tests', () => {
    afterEach(() => {
      component.data.selectedIdentity = adminPerson;
    });
    it('should return true when the selectedIdentity XMarkedForDeletion value is 1', () => {
      component.data.selectedIdentity = { XMarkedForDeletion: { value: 1 } } as PortalAdminPerson;
      const result = component.isIdentityMarkedForDelete;
      expect(result).toEqual(true);
    });
    it('should return false when the selectedIdentity XMarkedForDeletion value is anything but 1', () => {
      component.data.selectedIdentity = { XMarkedForDeletion: { value: 0 } } as PortalAdminPerson;
      const result = component.isIdentityMarkedForDelete;
      expect(result).toEqual(false);
    });
  });

  describe('cancel() tests', () => {
    it('should call `closeSidesheet()`', () => {
      const closeSidesheetSpy = spyOn<any>(component, 'closeSidesheet');
      component.cancel();
      expect(closeSidesheetSpy).toHaveBeenCalled();
    });
  });

  describe('initiateDelete() tests', () => {
    for (const testcase of [
      { confirm: true, expect: true },
      { confirm: false, expect: false }
    ]) {
      it('should make a call to delete the identity (if the user confirm the dialog) and then open a snackbar and call closeSidesheet', async () => {
        confirm = testcase.confirm = true;
        const snackbarSpy = spyOn(component['snackbar'], 'open');
        const closeSidesheetSpy = spyOn<any>(component, 'closeSidesheet');
        await component.initiateDelete();

        if(testcase.confirm) {
          expect(deleteIdentitySpy).toHaveBeenCalled();
          expect(snackbarSpy).toHaveBeenCalled();
          expect(closeSidesheetSpy).toHaveBeenCalled();
        } else {
          expect(deleteIdentitySpy).not.toHaveBeenCalled();
          expect(snackbarSpy).not.toHaveBeenCalled();
          expect(closeSidesheetSpy).not.toHaveBeenCalled();
        }
      });
    }
  });

  describe('onIsActiveCheckChanged() tests', () => {
    it(`should set the value of the 'IsInActive' property as 'false' when the checkbox is checked`, () => {
      const mockToggleChange: any = { checked: true };
      component.onIsActiveToggleChanged(mockToggleChange);
      expect(component.data.selectedIdentity.IsInActive.value).toEqual(false);
    });
    it(`should set the value of the 'IsInActive' property as 'true' when the checkbox is not checked`, () => {
      const mockToggleChange: any = { checked: false };
      component.data.selectedIdentity.IsInActive.value = false;
      component.onIsActiveToggleChanged(mockToggleChange);
      expect(component.data.selectedIdentity.IsInActive.value).toEqual(true);
    });
  });
});
