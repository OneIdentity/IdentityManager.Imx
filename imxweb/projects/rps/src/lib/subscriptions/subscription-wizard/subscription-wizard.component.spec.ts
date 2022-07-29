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

import { Component, forwardRef, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiLoadingService, EuiSidesheetRef } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { of } from 'rxjs';
import { StepperSelectionEvent } from '@angular/cdk/stepper';

import { clearStylesFromDOM, ConfirmationService } from 'qbm';
import { ReportSubscriptionService } from '../report-subscription/report-subscription.service';
import { SubscriptionWizardComponent } from './subscription-wizard.component';
import { ReportSubscription } from '../report-subscription/report-subscription';
import { PortalSubscriptionInteractive } from 'imx-api-rps';

@Component({
  selector: 'imx-report-selector',
  template: '<div>MockReportSelector</div>',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockReportSelectorComponent),
      multi: true,
    }
  ]
})
export class MockReportSelectorComponent implements ControlValueAccessor {
  writeValue(): void {
  }
  registerOnChange(): void {
  }
  registerOnTouched(): void {
  }
}

@Component({
  selector: 'imx-multi-select-formcontrol',
  template: '<div>MockAdditionalSubscribersComponent</div>',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockAdditionalSubscribersComponent),
      multi: true,
    }
  ]
})
export class MockAdditionalSubscribersComponent implements ControlValueAccessor {
  writeValue(): void { }
  registerOnChange(): void { }
  registerOnTouched(): void { }
  @Input() public pushMethod: any;
  @Input() public selectedElementsCaption: any;
}

@Component({
  selector: 'imx-subscription-overview',
  template: '<div>PropertyViewer</div>'
})
export class MockSubscriptionOverviewComponent {
  @Input() public subscription: any;
  @Input() public subscribersChanged: any;
  @Input() public isWaitingForLoad: any;
}

@Component({
  selector: 'imx-subscription-properties',
  template: '<div>MockSubscriptionProperties</div>'
})
export class MockSubscriptionPropertiesComponent {
  @Input() public displayedColumns: any;
  @Input() public withTitles: any;
  @Input() public formGroup: any;
  @Input() public subscription: any;
}

describe('SubscriptionWizardComponent', () => {
  let component: SubscriptionWizardComponent;
  let fixture: ComponentFixture<SubscriptionWizardComponent>;

  let commit = false;
  const mockReportSubscriptionService = {
    PortalSubscriptionInteractiveSchema: PortalSubscriptionInteractive.GetEntitySchema(),
    createNewSubscription: jasmine.createSpy('createNewSubscription')
      .and
      .returnValue(Promise.resolve(new ReportSubscription(
        {
          AddtlSubscribers: { Column: {} },
          GetEntity: () => ({
            Commit: () => commit = true
          })
        } as unknown as PortalSubscriptionInteractive,
        () => [],
        <any>{})))
  };

  let confirm = true;
  const mockConfirmationService = {
    confirmLeaveWithUnsavedChanges: jasmine.createSpy('confirmLeaveWithUnsavedChanges')
      .and.callFake(() => Promise.resolve(confirm))
  }

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const mockSidesheetRef = {
    close: jasmine.createSpy('close'),
    closeClicked: jasmine.createSpy('closeClicked').and.returnValue(of(undefined))
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatStepperModule,
        NoopAnimationsModule
      ],
      declarations: [
        SubscriptionWizardComponent,
        MockReportSelectorComponent,
        MockAdditionalSubscribersComponent,
        MockSubscriptionOverviewComponent,
        MockSubscriptionPropertiesComponent
      ],
      providers: [
        {
          provide: ReportSubscriptionService,
          useValue: mockReportSubscriptionService
        },
        {
          provide: ConfirmationService,
          useValue: mockConfirmationService
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: EuiSidesheetRef,
          useValue: mockSidesheetRef
        }
      ]
    })
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('can save a new subscription', async () => {
    await component.selectedStepChanged({ selectedIndex: 1, previouslySelectedIndex: 0 } as StepperSelectionEvent);
    expect(mockReportSubscriptionService.createNewSubscription).toHaveBeenCalled();
    expect(component.newSubscription).toBeDefined();

    await component.submit();
    expect(commit).toBeTruthy();
    expect(mockSidesheetRef.close).toHaveBeenCalled();
  });

  it('can create a new subscription', async () => {
    await component.selectedStepChanged({ selectedIndex: 1, previouslySelectedIndex: 0 } as StepperSelectionEvent);
    expect(mockReportSubscriptionService.createNewSubscription).toHaveBeenCalled();
    expect(component.newSubscription).toBeDefined();
  });
});
