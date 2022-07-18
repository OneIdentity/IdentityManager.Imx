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

import { Component, OnInit, Inject } from "@angular/core";
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from "@elemental-ui/core";
import { ContributingEntitlement, UiActionData } from "imx-api-cpl";
import { MetadataService, SnackBarService } from "qbm";
import { DbObjectKey } from "imx-qbm-dbts";
import { ApiService } from "../../api.service";
import { StepperSelectionEvent } from "@angular/cdk/stepper";

type ExtendedEntitlement = (ContributingEntitlement & { Key?: DbObjectKey, TypeDisplay?: string });

@Component({
	templateUrl: "./resolve.component.html",
	styleUrls: ["./resolve.component.scss"]
})
export class ResolveComponent implements OnInit {

	constructor(private readonly sidesheetRef: EuiSidesheetRef,
		private readonly snackbar: SnackBarService,
		private readonly cplApi: ApiService,
		private readonly busySvc: EuiLoadingService,
		private readonly metadata: MetadataService,
		@Inject(EUI_SIDESHEET_DATA) private readonly data: {
			uidPerson: string,
			uidNonCompliance: string
		}
	) {
	}

	public busy = false;
	public completed = false;
	public actions: UiActionData[] = [];
	public entitlements: ExtendedEntitlement[] = [];
	public entitlementsLoseAlso: ExtendedEntitlement[] = [];
	public selectedEntitlements: string[] = [];
	public uidActions: string[] = [];

	public async ngOnInit(): Promise<void> {
		this.busy = true;
		// load entitlements contributing to the rule violation
		this.selectedEntitlements = [];
		try {
			this.entitlements = await this.cplApi.client.portal_rules_violations_entitlements_get(this.data.uidPerson, this.data.uidNonCompliance);
			await this.enhanceWithTypeDisplay(this.entitlements);
		}
		finally {
			this.busy = false;
		}
	}

	private async enhanceWithTypeDisplay(obj: { ObjectKeyEntitlement?: string, Key?: DbObjectKey, TypeDisplay?: string }[]) {
		obj.forEach(element => {
			element.Key = DbObjectKey.FromXml(element.ObjectKeyEntitlement);
		});
		await this.metadata.updateNonExisting(obj.map(i => i.Key.TableName));
		obj.forEach(element => {
			element.TypeDisplay = this.metadata.tables[element.Key.TableName].DisplaySingular;
		});
	}

	public async selectedStepChanged(event: StepperSelectionEvent): Promise<void> {
		if (this.completed)
			return;
		if (event.selectedIndex === 1 && event.previouslySelectedIndex === 0) {
			await this.LoadActions();
		}
		else if (event.selectedIndex === 2 && event.previouslySelectedIndex === 1) {
			await this.LoadEntitlementsLoseAlso();
		}
	}

	private async LoadActions(): Promise<void> {

		// load actions
		this.actions = [];
		this.uidActions = [];
		this.busy = true;
		try {
			this.actions = await this.cplApi.client.portal_rules_violations_actions_post(this.data.uidPerson, this.data.uidNonCompliance, {
				ObjectKeys: this.selectedEntitlements
			});
			this.uidActions = this.actions.filter(a => a.IsActive).map(a => a.Id);
		} finally {
			this.busy = false;
		}
	}

	private async LoadEntitlementsLoseAlso(): Promise<void> {
		// load the entitlements that will also be lost if the selected actions are run
		this.entitlementsLoseAlso = [];
		this.busy = true;
		try {
			this.entitlementsLoseAlso = await this.cplApi.client.portal_rules_violations_analyzeloss_post(this.data.uidPerson, this.data.uidNonCompliance, {
				ObjectKeys: this.selectedEntitlements,
				ActionIds: this.uidActions
			});
			await this.enhanceWithTypeDisplay(this.entitlementsLoseAlso);
		} finally {
			this.busy = false;
		}
	}

	public async Execute(): Promise<void> {
		const b = this.busySvc.show();
		try {
			await this.cplApi.client.portal_rules_violations_result_post(this.data.uidPerson, this.data.uidNonCompliance, {
				ObjectKeys: this.selectedEntitlements,
				ActionIds: this.uidActions
			});
			this.completed = true;

			this.sidesheetRef.close(true);
			this.snackbar.open({ key: this.LdsChangesQueued });
		} finally {
			this.busySvc.hide(b);
		}
	}

	public LdsChangesQueued = '#LDS#The changes are now queued for execution.';

	public LdsLoseEntitlements = '#LDS#The employee will lose the following entitlements when the selected actions take effect. Review the list to avoid unintentional loss of access. Go back to the previous page to change the selection.';

	public LdsNoPermissions = '#LDS#No permissions were found. The cause for the violation may has already been resolved. You may close this wizard.';

	public LdsContributingPermissions = '#LDS#The following permissions contribute to this rule violation. Select one or more permissions that should be removed.';

	public LdsNoLoseAdditional = '#LDS#The employee will not lose any additional entitlements.';

	public LdsActionList = '#LDS#The following actions will be taken to remove the permissions that contribute to the rule violation.';
}
