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

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { OwnershipInformation } from 'imx-api-qer';
import { IEntity, TypedEntity, XOrigin } from 'imx-qbm-dbts';

import { SnackBarService } from 'qbm';
import { QerApiService } from '../../qer-api-client.service';
import { RoleService } from '../role.service';

@Component({
  templateUrl: './remove-membership.component.html',
  styleUrls: ['./remove-membership.component.scss', '../sidesheet.scss']
})
export class RemoveMembershipComponent implements OnInit {

  public get noneSelected(): boolean {
    return !this.formAbortRequested.value && !this.formExcludeDynamic.value && !this.formDeleteDirect.value;
  }

  public dynamicExclusionForm: FormGroup;

  public formAbortRequested: FormControl;
  public formExcludeDynamic: FormControl;
  public formDeleteDirect: FormControl;
  public countDynamic: number;
  public countDirect: number;
  public countRequested: number;

  constructor(
    private formBuilder: FormBuilder,
    @Inject(EUI_SIDESHEET_DATA)
    public readonly data: {
      ownershipInfo: OwnershipInformation,
      nonDeletableMemberships: TypedEntity[],
      selectedEntities: TypedEntity[],
      entity: IEntity
    },
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly busyService: EuiLoadingService,
    private readonly qerApiClient: QerApiService,
    private readonly membershipService: RoleService,
    private readonly snackbar: SnackBarService
  ) { }

  public ngOnInit(): void {

    // get the count of each type, and pre-set the checkboxes if there are any elements of the type

    this.countDynamic = this.getCount(XOrigin.Dynamic);
    this.formExcludeDynamic = new FormControl(this.countDynamic > 0);
    this.countRequested = this.data.selectedEntities.filter(e => {
      return e.GetEntity().GetColumn('IsRequestCancellable').GetValue();
    }).length;
    this.formAbortRequested = new FormControl(this.countRequested > 0);
    this.countDirect = this.getCount(XOrigin.Direct);
    this.formDeleteDirect = new FormControl(this.countDirect > 0);

    this.dynamicExclusionForm = this.formBuilder.group({
      excludeDynamic: this.formExcludeDynamic,
      deleteDirect: this.formDeleteDirect,
      abortRequested: this.formAbortRequested,
      description: [''],
      descriptionRequests: ['']
    });
  }

  public async save(): Promise<void> {

    this.busyService.show();
    try {
      for (const entity of this.data.selectedEntities) {

        const xorigin = entity.GetEntity().GetColumn('XOrigin').GetValue();

        if (this.formDeleteDirect.value &&
          // is it a direct assignment?
          (XOrigin.Direct & xorigin) === XOrigin.Direct) {
          await this.membershipService.removeMembership(this.data.ownershipInfo.TableName, entity, this.data.entity.GetKeys()[0]);
        }

        // If the member is managed by a dynamic group, add an exclusion
        if (this.formExcludeDynamic.value && (xorigin & XOrigin.Dynamic) > 0) {
          const uidDynamicGroup = this.data.entity.GetColumn('UID_DynamicGroup').GetValue();
          const exclusionData = this.qerApiClient.typedClient.PortalRolesExclusions.createEntity();
          exclusionData.UID_Person.value = entity.GetEntity().GetColumn('UID_Person').GetValue();
          exclusionData.Description.value = this.dynamicExclusionForm.get('description').value || '';
          await this.qerApiClient.typedClient.PortalRolesExclusions.Post(uidDynamicGroup, exclusionData);
        }
      }

      if (this.formAbortRequested.value) {
        const requested = this.data.selectedEntities.filter(e => {
          return e.GetEntity().GetColumn('IsRequestCancellable').GetValue();
        }).map(e => e.GetEntity().GetColumn('UID_PersonWantsOrg').GetValue() as string);

        await this.qerApiClient.client.portal_itshop_unsubscribe_post({
          UidPwo: requested,
          Reason: this.dynamicExclusionForm.get('descriptionRequests').value || ''
        });
      }

      this.sidesheetRef.close(true);
      this.snackbar.open({ key: '#LDS#The memberships have been successfully removed.' });

    } finally {
      this.busyService.hide();
    }
  }

  public cancel(): void {
    this.sidesheetRef.close();
  }

  private getCount(xorigin: XOrigin): number {
    return this.data.selectedEntities.filter(e => {
      return this.hasBit(e, xorigin);
    }).length;
  }

  private hasBit(e: TypedEntity, xorigin: XOrigin): boolean {
    return (e.GetEntity().GetColumn('XOrigin').GetValue() & xorigin) > 0;
  }

}
