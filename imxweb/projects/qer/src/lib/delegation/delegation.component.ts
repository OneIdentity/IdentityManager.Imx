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

import { STEPPER_GLOBAL_OPTIONS, StepperSelectionEvent } from '@angular/cdk/stepper';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { PageEvent } from '@angular/material/paginator';
import { MatStep, MatStepper } from '@angular/material/stepper';
import { EuiLoadingService } from '@elemental-ui/core';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {
  GlobalDelegationInput,
  PortalDelegable,
  PortalDelegations,
  PortalDelegationsGlobalRoleclasses,
  QerProjectConfig,
} from 'imx-api-qer';
import { AuthenticationService, BaseCdr, BusyService, ClassloggerService, ColumnDependentReference, EntityService } from 'qbm';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { UserModelService } from '../user/user-model.service';
import { DelegationService } from './delegation.service';

import { CollectionLoadParameters } from 'imx-qbm-dbts';
import moment from 'moment';
import { QerPermissionsService } from '../admin/qer-permissions.service';

/**
 * Leads the user through a delegation process
 * The user can delegate items for themself or one subordinate
 */
@Component({
  templateUrl: './delegation.component.html',
  styleUrls: ['./delegation.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})
export class DelegationComponent implements OnInit, OnDestroy {
  public delegateableItems: PortalDelegable[];
  public uidPerson: string;
  public readonly paginatorConfig = {
    index: 0,
    size: 20,
    sizeOptions: [20, 50, 200],
    length: 0,
  };

  public selections: PortalDelegable[] = [];
  public searchControl = new UntypedFormControl();
  public searchString = '';

  public isGlobalDelegation = true;

  public globalDelegation: GlobalDelegationInput;
  public newDelegation: PortalDelegations;

  public cdrPersonRecipient: ColumnDependentReference;
  public cdrTimeSpan: ColumnDependentReference[];
  public cdrList: ColumnDependentReference[];

  public completed = false;
  public state: string;

  public withSubordinates = false;
  public isManager = false;
  public cdrPersonSender: ColumnDependentReference;

  public readonly recipientFormGroup = new UntypedFormGroup({});
  public readonly delegationForm = new UntypedFormGroup({}, DelegationComponent.dateIsAscending());
  public readonly senderFormGroup = new UntypedFormGroup({});

  public busyService = new BusyService();
  public isLoading = false;
  public initialized = false;

  @ViewChild(MatSelectionList) public roleAndMembershipList: MatSelectionList;
  @ViewChild('delegationObjects') public delegationObjects: MatStep;
  @ViewChild('stepper') public stepper: MatStepper;

  public readonly rolesForm = new UntypedFormGroup({ items: new UntypedFormControl([]) }, this.buildValidationFunction());
  public readonly delegationTypeForm = new UntypedFormGroup({ items: new UntypedFormControl([]) });

  public countReports: number;
  public roleClasses: PortalDelegationsGlobalRoleclasses[] = [];

  private subscriptions: Subscription[] = [];
  public navigationState: CollectionLoadParameters = { PageSize: 20 };
  private projectConfig: QerProjectConfig;

  private get uidDelegator(): string {
    return this.withSubordinates ? this.newDelegation?.UID_PersonSender.value : this.uidPerson;
  }

  constructor(
    private readonly projectConfigSvc: ProjectConfigurationService,
    private readonly delegationService: DelegationService,
    private readonly entityService: EntityService,
    private readonly logger: ClassloggerService,
    private readonly userModelService: UserModelService,
    private readonly permissions: QerPermissionsService,
    private readonly elementalBusy: EuiLoadingService,
    private readonly changeDetector: ChangeDetectorRef,
    authenticationservice: AuthenticationService
  ) {
    this.initGlobalDelegation();
    this.initSearchControl();
    this.subscriptions.push(authenticationservice.onSessionResponse.subscribe((session) => (this.uidPerson = session.UserUid)));
    this.busyService.busyStateChanged.subscribe((value) => {
      this.isLoading = value;
      changeDetector.detectChanges();
    });
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.projectConfig = await this.projectConfigSvc.getConfig();
      this.newDelegation = await this.delegationService.createDelegation();
      this.isManager = await this.permissions.isPersonManager();
    } finally {
      isBusy.endBusy();
      this.initialized = true;
      this.changeDetector.detectChanges();
    }
    this.initSenderForm();
    this.initRecipientForm();
    this.initEditablePropertiesForm();
  }

  /**
   * Adds a control to the given group
   * @param group name of the form group
   * @param name name of the control to register
   * @param control the control, that should be registered
   */
  public addControl(group: UntypedFormGroup, name: string, control: AbstractControl): void {
    setTimeout(() => group.addControl(name, control));
  }

  /**
   * Is triggered, if the step changed
   * @param event the {@link StepperSelectionEvent}, that was triggered
   */
  public async selectedStepChanged(event: StepperSelectionEvent): Promise<void> {
    if (this.completed || event.selectedStep !== this.delegationObjects) {
      return;
    }

    this.logger.debug(this.logger, 'stepper navigated to role and responsibility selection');
    const isBusy = this.busyService.beginBusy();

    try {
      await this.initGlobal(this.uidDelegator);
      await this.navigateDelegateable();
    } finally {
      isBusy.endBusy();
    }
  }

  /**
   * Saves the delegation
   */
  public async saveDelegation(): Promise<void> {
    let overlay = this.elementalBusy.show();
    this.changeDetector.detectChanges();
    try {
      if (this.isGlobalDelegation) {
        await this.saveGlobalItems();
      } else {
        await this.saveDelegationItems();
      }
      this.completed = true;
      this.state = 'done';
    } finally {
      this.elementalBusy.hide(overlay);
    }
  }

  /**
   * Resets all form controls and data, so the user can make another delegation
   */
  public async resetDelegation(): Promise<void> {
    this.stepper.reset();
    this.completed = false;
    this.state = undefined;
    this.delegationTypeForm.reset();
    this.newDelegation = await this.delegationService.createDelegation();
    return this.resetForms();
  }

  /**
   * @ignore only used template
   * Is called, if the paginator in the 'Select the role memberships/responsibilities you want to delegate' step changes its state
   */
  public async onPaginatorStateChanged(newState: PageEvent): Promise<void> {
    this.navigationState = {
      PageSize: newState.pageSize,
      StartIndex: newState.pageIndex * newState.pageSize,
    };
    this.paginatorConfig.index = newState.pageIndex;
    this.paginatorConfig.size = newState.pageSize;
    this.logger.trace(this, 'navigates with navigation state', this.navigationState);
    this.logger.trace(this, 'config for paginator is set to', this.paginatorConfig);
    this.navigateDelegateable();
  }

  /**
   * @ignore only used template
   * Is called, if the select all on page button is clicked in the 'Select the role memberships/responsibilities you want to delegate' step
   * Selects all elements on the current page
   */
  public onSelectall(): void {
    const items = this.roleAndMembershipList.options.filter(
      (elem) => this.selections.findIndex((sel) => sel.ObjectKeyToDelegate.value === elem.value.ObjectKeyToDelegate.value) === -1
    );

    items.forEach((element) => {
      this.selections.push(element.value);
    });
    this.logger.trace(this, 'currently selected items', this.selections);
    this.roleAndMembershipList.selectAll();
  }

  /**
   * @ignore only used template
   * Is called, if the deselect all button is clicked in the 'Select the role memberships/responsibilities you want to delegate' step
   * Deselects all elements
   */
  public onDeselectAll(): void {
    this.roleAndMembershipList.deselectAll();
    this.selections = [];
  }

  /**
   * @ignore only used template
   * Is called, if a checkbox is clicked in the 'Select the role memberships/responsibilities you want to delegate' step
   * Adds / removes the element from the selection
   */
  public updateSelection(arg: MatSelectionListChange): void {
    const item = arg.options[0];
    if (item.selected) {
      this.logger.trace(this, `${item.value.GetEntity().GetDisplay()} is added as a selection`);
      this.selections.push(item.value);
    } else {
      const index = this.selections.findIndex((elem) => elem.ObjectKeyToDelegate.value === item.value.ObjectKeyToDelegate.value);
      if (index > -1) {
        this.selections.splice(index, 1);
      }
      this.logger.trace(this, `${item.value.GetEntity().GetDisplay()} is removed as a selection`);
    }
  }

  /**
   * Determines, if a specific CDR is shown
   * @param cdr the cdr to check
   * @returns true, if the delegation is not global and the columnname is IsDelegable
   */
  public isShowCdr(cdr: BaseCdr): boolean {
    return !this.isGlobalDelegation || cdr.column.ColumnName !== 'IsDelegable';
  }

  /**
   * Checks, if at least one global delegation is selected
   * @returns true, if something is selected, else false
   */
  public isValidGlobalDelegation(): boolean {
    return (
      this.isGlobalDelegation &&
      (this.globalDelegation?.UidOrgRoot?.length !== 0 ||
        this.globalDelegation.UseForAttestation ||
        this.globalDelegation.UseForHeadPerson ||
        this.globalDelegation.UseForShop ||
        this.globalDelegation.UseForShopCompliance)
    );
  }

  /**
   * Initializes a global delegation
   */
  private initGlobalDelegation(): void {
    this.globalDelegation = {} as any;
    this.globalDelegation.UseForShop = true;
    this.globalDelegation.UseForShopCompliance = true;
    this.globalDelegation.UseForAttestation = true;
    this.globalDelegation.UseForHeadPerson = true;
  }

  /**
   * Initializes the global delegations
   * @param uidPerson the person, whose delegation objects should be fetched
   */
  private async initGlobal(uidPerson: string): Promise<void> {
    const isBusy = this.busyService.beginBusy();

    try {
      this.initGlobalDelegation();
      //ToDo: direct reports für einen anderen User bestimmen
      this.countReports = (await this.userModelService.getDirectReports(this.withSubordinates ? uidPerson : undefined)).length;

      const role = (await this.delegationService.getRoleClasses(uidPerson)).filter((r) => r.CountRolesOwned.value > 0);
      this.roleClasses = role;
      // pre-select all role classes
      this.globalDelegation.UidOrgRoot = role.map((r) => r.GetEntity().GetKeys()[0]);
    } finally {
      isBusy.endBusy();
    }
  }

  /**
   * Resets all FormGroups
   */
  private async resetForms(): Promise<void> {
    this.initGlobalDelegation();
    this.initSenderForm();
    this.initRecipientForm();

    this.initEditablePropertiesForm();
    this.initRolesForm();
  }

  /**
   * Saves individual delegation items
   */
  private async saveDelegationItems(): Promise<void> {
    // Update date from cdr
    this.newDelegation.InsertValidFrom.value = this.cdrTimeSpan[0].column.GetValue();
    this.newDelegation.InsertValidUntil.value = this.cdrTimeSpan[1].column.GetValue();

    await this.delegationService.commitDelegations(
      this.newDelegation,
      this.selections.map((option) => option.ObjectKeyToDelegate.value)
    );
  }

  /**
   * Saves global delegation items
   */
  private async saveGlobalItems(): Promise<void> {
    this.globalDelegation.ValidFrom = this.cdrTimeSpan[0].column.GetValue();
    this.globalDelegation.UidPersonFrom = this.newDelegation.UID_PersonSender.value;
    this.globalDelegation.ValidUntil = this.cdrTimeSpan[1].column.GetValue();
    this.globalDelegation.UidPersonTo = this.newDelegation.UID_PersonReceiver.value;
    this.globalDelegation.KeepMeInformed = this.newDelegation.KeepMeInformed.value;
    this.globalDelegation.OrderReason = this.newDelegation.OrderReason.value;
    await this.delegationService.commitGlobalDelegation(this.globalDelegation);
  }

  /**
   * Navigates through individual delegation items
   */
  private async navigateDelegateable(): Promise<void> {
    const isBusy = this.busyService.beginBusy();

    try {
      const delegations = await this.delegationService.getDelegatableItems(
        this.uidDelegator,
        this.newDelegation.UID_PersonReceiver.value,
        this.navigationState
      );
      this.paginatorConfig.length = delegations.totalCount;
      this.delegateableItems = delegations.Data;
      setTimeout(() => {
        this.logger.trace(this, 'Try marking items as selected');
        if (this.roleAndMembershipList) {
          const preselectedElements = this.roleAndMembershipList.options.filter(
            (elem) => this.selections.findIndex((sel) => sel.ObjectKeyToDelegate.value === elem.value.ObjectKeyToDelegate.value) !== -1
          );
          preselectedElements.forEach((elem) => elem.toggle());
          this.logger.trace(this, 'items marked es selected', preselectedElements);
        }
      });
    } finally {
      isBusy.endBusy();
    }
  }

  /**
   * Inits the 'Select the role memberships/responsibilities you want to delegate' form
   */
  private initRolesForm(): void {
    this.selections = [];
  }

  /**
   * Inits the 'Select the identity which responsibilities you like to delegate' form
   */
  private initSenderForm(): void {
    Object.keys(this.senderFormGroup.controls).forEach((name) => this.recipientFormGroup.removeControl(name));
    this.cdrPersonSender = this.delegationService.buildSenderCdr(this.newDelegation);
  }

  /**
   * Inits the 'Select the identity to which you want to delegate' form
   */
  private initRecipientForm(): void {
    Object.keys(this.recipientFormGroup.controls).forEach((name) => this.recipientFormGroup.removeControl(name));
    this.cdrPersonRecipient = new BaseCdr(this.newDelegation.UID_PersonReceiver.Column);
  }

  /**
   * Inits the 'Specify additional options' form
   */
  private initEditablePropertiesForm(): void {
    Object.keys(this.delegationForm.controls).forEach((name) => this.delegationForm.removeControl(name));

    const values = [this.newDelegation.KeepMeInformed.Column, this.newDelegation.IsDelegable.Column, this.newDelegation.OrderReason.Column];

    if (this.projectConfig.ITShopConfig.VI_ITShop_EnablePWOPriorityChange) {
      values.push(this.newDelegation.PWOPriority.Column);
    }

    this.addTimeCdr();
    this.cdrPersonRecipient = new BaseCdr(this.newDelegation.UID_PersonReceiver.Column);
    this.cdrList = values.map((column) => new BaseCdr(column));
  }

  /**
   * Builds and adds the 'Valid from / until' CDR
   */
  private addTimeCdr(): void {
    const schema = this.delegationService.getDelegationSchema();
    this.cdrTimeSpan = [schema.Columns.InsertValidFrom, schema.Columns.InsertValidUntil].map((property) => {
      property.IsReadOnly = false;
      return new BaseCdr(this.entityService.createLocalEntityColumn(property, undefined, { ValueConstraint: { MinValue: moment() } }));
    });
  }

  /**
   * inits the search control, that is used on the 'Select the role memberships/responsibilities you want to delegate' step
   */
  private initSearchControl(): void {
    this.searchControl.setValue('');
    this.subscriptions.push(
      this.searchControl.valueChanges.pipe(distinctUntilChanged(), debounceTime(300)).subscribe(async (value) => {
        this.navigationState = { ...this.navigationState, ...{ search: value, StartIndex: 0 } };
        this.paginatorConfig.index = 0;
        await this.navigateDelegateable();
      })
    );
  }

  //------------------ Form validators --------------------------

  /**
   * Builds the validator function for step 'Select the role memberships/responsibilities you want to delegate'
   * If there are no items seleced, it marks the control as invalid
   */
  private buildValidationFunction(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (this.isGlobalDelegation) {
        return this.isValidGlobalDelegation ? null : { invalid: true };
      }
      // at least one item set?
      const group = control as UntypedFormGroup;

      return group == null || group.get('items') == null || group.get('items').value == null || group.get('items').value.length > 0
        ? null
        : { noRoleSelected: true };
    };
  }

  /**
   * Checks, if valid until is later than valid from, or one of its values is not set
   */
  private static dateIsAscending(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const group = control as UntypedFormGroup;

      if (group == null) {
        return null;
      }

      const validFrom = group.get('InsertValidFrom');
      const validUntil = group.get('InsertValidUntil');

      return validFrom == null ||
        validFrom.value == null ||
        validUntil == null ||
        validUntil.value == null ||
        validUntil.value >= validFrom.value
        ? null
        : { validFromLargerThanUntil: true };
    };
  }
}
