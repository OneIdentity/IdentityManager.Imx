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

import { Component, Input, Output } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, ActivatedRoute } from '@angular/router';
import { EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { Subject } from 'rxjs';

import { AuthenticationService, clearStylesFromDOM, ConfirmationService, ExtService, IExtension, SnackBarService } from 'qbm';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { ProfileComponent } from './profile.component';
import { MailInfoType, MailSubscriptionService } from './mailsubscription.service';
import { IEntity } from 'imx-qbm-dbts';
import { PersonService } from '../person/person.service';

@Component({
  selector: 'imx-bulk-editor',
  template: '<p>MockIdentitySelectComponent</p>'
})
class MockIdentitySelectComponent {
  @Input() public entities: any;
  @Input() public preselectedEntity: any;
  @Input() public disabled: any;
  @Output() public selectionChange: any;
}

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let extRegistrySpy: jasmine.Spy;

  const extRegistry: { [id: string]: IExtension[]; } = {
    SubscriptionsComponent: [{
      instance: {}
    } as IExtension]
  };

  const mailService = new class {
    readonly subscriptions = [{}];
    readonly getMailsThatCanBeUnsubscribed = __ => Promise.resolve(this.subscriptions);
    readonly unsubscribe = jasmine.createSpy('unsubscribe');
  }();

  const router = {
    navigate: jasmine.createSpy('navigate')
  };

  const activatedRoute = {
    snapshot: { }
  };

  const authService = {
    onSessionResponse: new Subject()
  };

  configureTestSuite(() =>
    TestBed.configureTestingModule({
      declarations: [
        ProfileComponent,
        MockIdentitySelectComponent
      ],
      imports: [
        MatCardModule,
        MatTabsModule
      ],
      providers: [
        ExtService,
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        },
        {
          provide: MailSubscriptionService,
          useValue: mailService
        },
        {
          provide: AuthenticationService,
          useValue: authService
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRoute
        },
        {
          provide: Router,
          useValue: router
        },
        {
          provide: EuiLoadingService,
          useValue: {
            show: jasmine.createSpy('show'),
            hide: jasmine.createSpy('hide')
          }
        },
        {
          provide: ProjectConfigurationService,
          useValue: {
            getConfig: () => ({ PersonConfig: { } })
          }
        },
        {
          provide: PersonService,
          useValue: {
            getMasterdataInteractive: __ => ({ Data: [{ GetEntity: () => ({}) }] }),
            getMasterdata: __ => ({ Data: [] })
          }
        },
        {
          provide: ConfirmationService,
          useValue: {
            confirmLeaveWithUnsavedChanges: () => Promise.resolve(true)
          }
        }
      ]
    })
  );

  beforeAll(() => {
    const extService = TestBed.inject(ExtService);
    extRegistrySpy = spyOnProperty(extService, 'Registry').and.returnValue(extRegistry);
  })

  beforeEach(() => {
    extRegistrySpy.calls.reset();
    mailService.unsubscribe.calls.reset();
    router.navigate.calls.reset();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });
  
  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', fakeAsync(() => {
    authService.onSessionResponse.next({ IsLoggedIn: true });

    tick();

    expect(component.hasMailSubscriptions).toEqual(mailService.subscriptions.length > 0);
  }));

  it('should unsubscribe', async () => {
    const userUid = 'some uid';
    const uidMail = '1';

    component.selectedIdentity = { GetKeys: () => [userUid] } as IEntity;

    component.mailToBeUnsubscribed = {} as MailInfoType;

    await component.unsubscribe(uidMail);

    expect(mailService.unsubscribe).toHaveBeenCalledWith(userUid, [uidMail]);
  });

  it('should show profile', () => {
    component.mailToBeUnsubscribed = {} as MailInfoType;

    component.showProfile();

    expect(component.mailToBeUnsubscribed).toBeUndefined();
    expect(router.navigate).toHaveBeenCalledWith([], { relativeTo: activatedRoute, queryParams: undefined });
  });
});
