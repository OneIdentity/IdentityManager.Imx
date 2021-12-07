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

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';
import { Subject } from 'rxjs';

import { clearStylesFromDOM, ExtService } from 'qbm';
import { ObjectAttestationComponent } from './object-attestation.component';

class IdentityAttestationServiceStub {
  readonly count = { total: 2, forUser: 1 };
  readonly getNumberOfPendingForUser = (__parameters) => this.count;
  readonly applied = new Subject();
}

describe('ObjectAttestationComponent', () => {
  let component: ObjectAttestationComponent;
  let fixture: ComponentFixture<ObjectAttestationComponent>;

  let extRegistrySpy: jasmine.Spy;

  const extRegistry = {
    IdentityAttestationService: [{
      instance: IdentityAttestationServiceStub
    }]
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ObjectAttestationComponent
      ],
      providers: [
        ExtService,
        IdentityAttestationServiceStub
      ]
    });
  });

  beforeAll(() => {
    const extService = TestBed.inject(ExtService);
    extRegistrySpy = spyOnProperty(extService, 'Registry').and.returnValue(extRegistry);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectAttestationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() =>
    clearStylesFromDOM()
  );

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(extRegistrySpy).toHaveBeenCalled();
  });

  it('should update number of pending attestations on applied attestation action', fakeAsync(() => {
    component.ngOnInit();

    tick();

    expect(component.pendingAttestations.infoItems.length).toEqual(3);
  }));
});
