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

import { Component, Inject, OnInit } from "@angular/core";
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from "@elemental-ui/core";
import { DeletedObjectInfo, UiActionData } from "imx-api-qer";
import { DbObjectKey } from "imx-qbm-dbts";
import { SnackBarService } from "qbm";
import { IRoleRestoreContext } from "./restore-handler";

@Component({
	templateUrl: "./restore.component.html",
	styleUrls: ['./restore.component.scss']
})
export class RestoreComponent implements OnInit {
	constructor(@Inject(EUI_SIDESHEET_DATA)
	public data: {
		isAdmin: boolean;
		restore: IRoleRestoreContext
	},
		private readonly busySvc: EuiLoadingService,
		private readonly snackbar: SnackBarService,
		private readonly sidesheetRef: EuiSidesheetRef,
	) { }

	public busy = false;
	public roles: DeletedObjectInfo[] = [];
	public role: DeletedObjectInfo[] = []; // array because of the list; but length <= 1
	public actions: UiActionData[] = [];
	public uidActions: string[] = [];
	private uidRole: string;

	public async ngOnInit(): Promise<void> {
		this.role = [];
		this.roles = [];
		this.actions = [];
		try {
			this.busy = true;
			this.roles = await this.data.restore.getRoles();
		} finally {
			this.busy = false;
		}
	}

	public async loadActions(): Promise<void> {
		try {
			this.busy = true;
			this.actions = [];
			this.uidRole = DbObjectKey.FromXml(this.role[0].DbObjectKey).Keys[0];
			this.actions = (await this.data.restore.getRestoreActions(this.uidRole)).Actions;
			this.uidActions = this.actions.filter(a => a.CanExecute).map(a => a.Id);
		} finally {
			this.busy = false;
		}
	}

	public async Execute(): Promise<void> {
		const b = this.busySvc.show();
		try {
			await this.data.restore.restore(this.uidRole, { ActionId: this.uidActions });

			this.sidesheetRef.close(true);
			this.snackbar.open({ key: this.LdsSuccessMessage });
		} finally {
			this.busySvc.hide(b);
		}
	}

	public LdsActionsList = '#LDS#The following actions will be made to restore the role.';
	public LdsNoObjectsFound = '#LDS#No deleted objects were found.';
	public LdsSuccessMessage = '#LDS#The object has been successfully restored.';
}
