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

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { StepperSelectionEvent, STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { PageEvent } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

import {
    ColumnDependentReference,
    BaseCdr,
    EntityService,
    AuthenticationService,
    TypedEntityCandidateSidesheetComponent,
    ClassloggerService
} from 'qbm';
import { PortalDelegations, PortalDelegable, QerProjectConfig, GlobalDelegationInput, PortalDelegationsGlobalRoleclasses } from 'imx-api-qer';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { DelegationService } from './delegation.service';
import { UserModelService } from '../user/user-model.service';

import { CollectionLoadParameters } from 'imx-qbm-dbts';


@Component({
    templateUrl: './delegation.component.html',
    styleUrls: ['./delegation.component.scss'],
    providers: [{
        provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
    }]
})
export class DelegationComponent implements OnInit, OnDestroy {
    public projectConfig: QerProjectConfig;
    public delegateableItems: PortalDelegable[];
    public uidPerson: string;
    public readonly paginatorConfig = {
        index: 0,
        size: 20,
        sizeOptions: [20, 50, 200],
        length: 0
    };

    public selections: PortalDelegable[] = [];
    public searchControl = new FormControl();
    public searchString = '';

    public isGlobalDelegation = true;

    public globalDelegation: GlobalDelegationInput;
    public newDelegation: PortalDelegations;

    public cdrPersonRecipient: ColumnDependentReference;
    public cdrTimeSpan: ColumnDependentReference[];
    public cdrList: ColumnDependentReference[];

    public completed = false;
    public state: string;
    public isLoadingElements = false;

    public readonly recipientFormGroup = new FormGroup({});
    public readonly delegationForm = new FormGroup({}, DelegationComponent.dateIsAscending());

    @ViewChild(MatSelectionList) public roleAndMembershipList: MatSelectionList;

    public readonly rolesForm = new FormGroup({ items: new FormControl([]) }, this.buildValidationFunction());
    public readonly delegationTypeForm = new FormGroup({ items: new FormControl([]) });

    public countReports: number;
    public roleClasses: PortalDelegationsGlobalRoleclasses[] = [];

    private subscriptions: Subscription[] = [];
    private navigationState: CollectionLoadParameters = { PageSize: 20 };

    constructor(
        private readonly projectConfigSvc: ProjectConfigurationService,
        private readonly delegationService: DelegationService,
        private readonly busyService: EuiLoadingService,
        private readonly entityService: EntityService,
        private readonly sidesheet: EuiSidesheetService,
        private readonly translate: TranslateService,
        private readonly logger: ClassloggerService,
        private readonly userModelService: UserModelService,
        private readonly authenticationservice: AuthenticationService
    ) {
        this.BuildGlobalDelegation();
        authenticationservice.onSessionResponse.subscribe(session => this.uidPerson = session.UserUid);
        this.initSearchControl();
    }

    public ngOnDestroy(): void {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    public async ngOnInit(): Promise<void> {
        let overlayRef: OverlayRef;
        setTimeout(() => overlayRef = this.busyService.show());
        try {
            this.countReports = (await this.userModelService.getDirectReports()).length;
            this.projectConfig = await this.projectConfigSvc.getConfig();
            this.newDelegation = await this.delegationService.createDelegation();

            this.subscriptions.push(this.authenticationservice.onSessionResponse.subscribe(async session => {
                this.uidPerson = session.UserUid;
                const role = (await this.delegationService.getRoleClasses(this.uidPerson))
                    .filter(r => r.CountRolesOwned.value > 0);
                this.roleClasses = role;
                // pre-select all role classes
                this.globalDelegation.UidOrgRoot = role.map(r => r.GetEntity().GetKeys()[0]);
            }));

        } finally {
            setTimeout(() => this.busyService.hide(overlayRef));
        }
        this.initRecipientForm();
        this.initEditablePropertiesForm();
    }

    public addControl(group: FormGroup, name: string, control: AbstractControl): void {
        setTimeout(() =>
            group.addControl(name, control)
        );
    }

    public async selectedStepChanged(event: StepperSelectionEvent): Promise<void> {
        if (event.selectedIndex === 1 && event.previouslySelectedIndex === 0 && !this.completed) {
            this.logger.debug(this.logger, 'stepper navigated to role and responsibility selection');
            await this.navigateDelegateable();
        }
    }

    public async saveDelegation(): Promise<void> {
        let overlayRef: OverlayRef;
        setTimeout(() => overlayRef = this.busyService.show());
        try {
            if (this.isGlobalDelegation) {
                this.globalDelegation.ValidFrom = this.cdrTimeSpan[0].column.GetValue();
                this.globalDelegation.ValidUntil = this.cdrTimeSpan[1].column.GetValue();
                this.globalDelegation.UidPersonTo = this.newDelegation.UID_PersonReceiver.value;
                this.globalDelegation.KeepMeInformed = this.newDelegation.KeepMeInformed.value;
                this.globalDelegation.OrderReason = this.newDelegation.OrderReason.value;
                await this.delegationService.commitGlobalDelegation(this.globalDelegation);
            }
            else {
                await this.saveDelegationItems();
            }
            this.completed = true;
            this.state = 'done';

        } finally {
            setTimeout(() => this.busyService.hide(overlayRef));
        }
    }



    public async resetForms(): Promise<void> {
        this.completed = false;
        this.state = undefined;
        this.newDelegation = await this.delegationService.createDelegation();
        this.BuildGlobalDelegation();
        this.initRecipientForm();

        this.initEditablePropertiesForm();
        this.initRolesForm();
    }

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

    // Role Selection methods
    public async showSelected(): Promise<void> {
        this.sidesheet.open(TypedEntityCandidateSidesheetComponent, {
            title: await this.translate.get('#LDS#Heading Selected Items').toPromise(),
            headerColour: 'iris-blue',
            bodyColour: 'asher-gray',
            padding: '0',
            width: 'max(550px, 55%)',
            data: { entities: this.selections, tables: [] },
            testId: 'delegation-showselected-sidesheet'
        }
        );
    }

    public onSelectall(): void {
        const items = this.roleAndMembershipList.options.filter(elem =>
            this.selections.findIndex(sel => sel.ObjectKeyToDelegate.value === elem.value.ObjectKeyToDelegate.value) === -1);

        items.forEach(element => {
            this.selections.push(element.value);
        });
        this.logger.trace(this, 'currently selected items', this.selections);
        this.roleAndMembershipList.selectAll();
    }

    public onDeselectAll(): void {
        this.roleAndMembershipList.deselectAll();
        this.selections = [];
    }

    public updateSelection(arg: MatSelectionListChange): void {
        const item = arg.options[0];
        if (item.selected) {
            this.logger.trace(this, `${item.value.GetEntity().GetDisplay()} is added as a selection`);
            this.selections.push(item.value);
        } else {
            const index = this.selections
                .findIndex(elem => elem.ObjectKeyToDelegate.value === item.value.ObjectKeyToDelegate.value);
            if (index > -1) {
                this.selections.splice(index, 1);
            }
            this.logger.trace(this, `${item.value.GetEntity().GetDisplay()} is removed as a selection`);
        }
    }

    public isShowCdr(cdr: BaseCdr): boolean {
        return !this.isGlobalDelegation || cdr.column.ColumnName !== 'IsDelegable';
    }

    public isValidGlobalDelegation(): boolean {
        if (!this.isGlobalDelegation) {
            return false;
        }
        if ((this.globalDelegation.UidOrgRoot == null || this.globalDelegation.UidOrgRoot.length === 0)
            && !this.globalDelegation.UseForAttestation
            && !this.globalDelegation.UseForHeadPerson
            && !this.globalDelegation.UseForShop
            && !this.globalDelegation.UseForShopCompliance) {
            return false;
        }
        return true;
    }

    private BuildGlobalDelegation(): void {
        this.globalDelegation = {} as any;
        this.globalDelegation.UseForShop = true;
        this.globalDelegation.UseForShopCompliance = true;
        this.globalDelegation.UseForAttestation = true;
        this.globalDelegation.UseForHeadPerson = true;
    }

    private async saveDelegationItems(): Promise<void> {
        // Update date from cdr
        this.newDelegation.InsertValidFrom.value = this.cdrTimeSpan[0].column.GetValue();
        this.newDelegation.InsertValidUntil.value = this.cdrTimeSpan[1].column.GetValue();

        await this.delegationService.commitDelegations(this.newDelegation,
            this.selections.map(option => option.ObjectKeyToDelegate.value));

    }

    private async navigateDelegateable(): Promise<void> {
        let overlayRef: OverlayRef;
        setTimeout(() => overlayRef = this.busyService.show());
        try {
            const delegations = await this.delegationService.getDelegatableItems(this.uidPerson,
                this.newDelegation.UID_PersonReceiver.value, this.navigationState);
            this.paginatorConfig.length = delegations.totalCount;
            this.delegateableItems = delegations.Data;
            setTimeout(() => {
                this.logger.trace(this, 'Try marking items as selected');
                if (this.roleAndMembershipList) {
                    const preselectedElements = this.roleAndMembershipList.options.filter(elem =>
                        this.selections.findIndex(sel => sel.ObjectKeyToDelegate.value === elem.value.ObjectKeyToDelegate.value) !== -1);
                    preselectedElements.forEach(elem => elem.toggle());
                    this.logger.trace(this, 'items marked es selected', preselectedElements);
                }
            });

        } finally {
            setTimeout(() => this.busyService.hide(overlayRef));
        }
    }

    private initRolesForm(): void {
        this.selections = [];
    }

    private initRecipientForm(): void {
        Object.keys(this.recipientFormGroup.controls).forEach(name => this.recipientFormGroup.removeControl(name));
        this.cdrPersonRecipient = new BaseCdr(this.newDelegation.UID_PersonReceiver.Column);
    }

    private initEditablePropertiesForm(): void {
        Object.keys(this.delegationForm.controls).forEach(name => this.delegationForm.removeControl(name));

        const values = [
            this.newDelegation.KeepMeInformed.Column,
            this.newDelegation.IsDelegable.Column,
            this.newDelegation.OrderReason.Column
        ];

        if (this.projectConfig.ITShopConfig.VI_ITShop_EnablePWOPriorityChange) {
            values.push(this.newDelegation.PWOPriority.Column);
        }

        this.addTimeCdr();
        this.cdrPersonRecipient = new BaseCdr(this.newDelegation.UID_PersonReceiver.Column);
        this.cdrList = values.map(column => new BaseCdr(column));
    }



    private addTimeCdr(): void {
        const schema = this.delegationService.getDelegationSchema();
        this.cdrTimeSpan = [schema.Columns.InsertValidFrom, schema.Columns.InsertValidUntil].map(property => {
            property.IsReadOnly = false;
            return new BaseCdr(
                this.entityService.createLocalEntityColumn(
                    property,
                    undefined,
                    { ValueConstraint: { MinValue: new Date() } }
                )
            );
        });
    }



    private initSearchControl(): void {
        this.searchControl.setValue('');
        this.subscriptions.push(this.searchControl.valueChanges
            .pipe(distinctUntilChanged(), debounceTime(300)).subscribe(async (value) => {
                this.navigationState = { ...this.navigationState, ...{ search: value, StartIndex: 0 } };
                this.paginatorConfig.index = 0;
                await this.navigateDelegateable();
            }));
    }

    // Form validators
    private buildValidationFunction(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: boolean } | null => {

            if (this.isGlobalDelegation) {
                return this.isValidGlobalDelegation ? null : { invalid: true };
            }
            // at least one item set?
            const group = control as FormGroup;

            return group == null
                || group.get('items') == null
                || group.get('items').value == null
                || group.get('items').value.length > 0 ? null : { noRoleSelected: true };
        };
    }

    private static dateIsAscending(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: boolean } | null => {
            const group = control as FormGroup;

            if (group == null) {
                return null;
            }

            const validFrom = group.get('InsertValidFrom');
            const validUntil = group.get('InsertValidUntil');

            return validFrom == null
                || validFrom.value == null
                || validUntil == null
                || validUntil.value == null
                || validUntil.value >= validFrom.value ? null : { validFromLargerThanUntil: true };
        };
    }



}
