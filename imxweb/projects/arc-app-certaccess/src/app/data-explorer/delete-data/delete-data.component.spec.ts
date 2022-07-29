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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ArcGovernanceTestBed } from '../../../test/arc-governance-test-bed';
import { DataDeleteOptions, DeHelperService } from 'tsb';
import { DeleteDataComponent } from './delete-data.component';
import { fakeAsync, flush } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DeleteDataService } from './delete-data.service';

describe('DeleteDataComponent', () => {
  let component: DeleteDataComponent;
  let fixture: ComponentFixture<DeleteDataComponent>;

  const deleteDataSpy = jasmine.createSpy('deleteData').and.returnValue(Promise.resolve());

  const mockAuthorities = [
    {
      XObjectKey: { value: 'test' },
      HasSync: { value: true },
      GetEntity: () => {
        return {
          GetDisplay: () => {
            return 'test';
          },
        };
      },
    },
    {
      XObjectKey: { value: 'test2' },
      HasSync: { value: false },
      GetEntity: () => {
        return {
          GetDisplay: () => {
            return 'test2';
          },
        };
      },
    },
  ];

  ArcGovernanceTestBed.configureTestingModule({
    declarations: [DeleteDataComponent],
    providers: [
      DeHelperService,
      {
        provide: DeleteDataService,
        useValue: {
          deleteData: deleteDataSpy
        },
      },
      {
        provide: MatDialogRef,
        useValue: { close: () => { } },
      },
      {
        provide: MAT_DIALOG_DATA,
        useValue: { authorities: mockAuthorities, hasAuthorities: true },
      },
    ],
    imports: [NoopAnimationsModule],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('domainSelected(val) should set selectedAuthority', () => {
    const domain = { value: 'test', display: 'test' };
    component.domainSelected(domain);

    expect(component.selectedAuthority).toEqual(domain);
  });

  it('domainSelected() should set selectedAuthority to undefined', () => {
    component.domainSelected();

    expect(component.selectedAuthority).toBeUndefined();
  });

  it('domainSearchFilter() should return true', () => {
    const val = component.domainSearchFilter();
    expect(val).toEqual(true);
  });

  it('domainSearch() should call dataHelper.getAuthorityData() and set authorities', fakeAsync(() => {
    const filteredAuthorities = mockAuthorities.filter((val) => {
      return val.XObjectKey.value === 'test';
    });

    spyOn(component['dataHelper'], 'getAuthorityData').and.returnValue(
      Promise.resolve({ authorities: filteredAuthorities, hasAuthorities: true } as DataDeleteOptions)
    );

    component.domainSearch();

    flush();

    expect(component.authorities).toBeDefined();
    expect(component.authorities.length).toEqual(1);
  }));

  it('delete() should call dataHelper.deleteData() and close dialog', fakeAsync(() => {
    deleteDataSpy.calls.reset();

    component.selectedAuthority = { value: '<Key><T>AADOrganization</T><P>someuid</P></Key>', display: 'testorganization' };
    const closeSpy = spyOn(component.dialogRef, 'close');

    component.delete();

    flush();

    expect(deleteDataSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  }));
});
