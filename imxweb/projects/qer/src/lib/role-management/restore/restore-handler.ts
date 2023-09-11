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

import { DeletedObjectInfo, RestoreActionList, RestoreActions } from "imx-api-qer";

export interface IRoleRestoreContext {

  getRoles(): Promise<DeletedObjectInfo[]>;

  getRestoreActions(uidRole: string): Promise<RestoreActions>;

  restore(uidRole: string, uidActions: RestoreActionList): Promise<void>;
}

export interface IRoleRestoreHandler {

  asAdmin(): IRoleRestoreContext;

  asOwner(): IRoleRestoreContext;

}

export class BaseTreeRoleRestoreHandler implements IRoleRestoreHandler {

  constructor(private readonly admin: () => Promise<DeletedObjectInfo[]>,
    private readonly owner: () => Promise<DeletedObjectInfo[]>,
    private readonly adminRestoreActions: (uidRole: string) => Promise<RestoreActions>,
    private readonly ownerRestoreActions: (uidRole: string) => Promise<RestoreActions>,
    private readonly adminRestore: (uidRole: string, uidActions: RestoreActionList) => Promise<any>,
    private readonly ownerRestore: (uidRole: string, uidActions: RestoreActionList) => Promise<any>,
  ) { }

  asAdmin(): IRoleRestoreContext {
    return new BaseTreeRoleRestoreContext(this.admin, this.adminRestoreActions, this.adminRestore);
  }

  asOwner(): IRoleRestoreContext {
    return new BaseTreeRoleRestoreContext(() => this.owner(),
      uidRole => this.ownerRestoreActions(uidRole),
      (uidRole, uidActions) => this.ownerRestore(uidRole, uidActions));
  }

}

class BaseTreeRoleRestoreContext implements IRoleRestoreContext {
  constructor(private readonly api: () => Promise<DeletedObjectInfo[]>,
    private readonly restoreActionsApi: (uidRole) => Promise<RestoreActions>,
    private readonly restoreApi: (uidRole: string, uidActions: RestoreActionList) => Promise<void>) { }

  restore(uidRole: string, uidActions: RestoreActionList): Promise<void> {
    return this.restoreApi(uidRole, uidActions);
  }

  getRoles(): Promise<DeletedObjectInfo[]> {
    return this.api();
  }

  getRestoreActions(uidRole: string): Promise<RestoreActions> {
    return this.restoreActionsApi(uidRole);
  }
}