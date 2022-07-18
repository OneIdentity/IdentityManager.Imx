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

export interface DataIssuesModel {
  identities: number;
  accounts: number;
  accountsManager: number;
  groups: number;
}

export class DataIssues implements DataIssuesModel {
  private _identities: number;
  private _accounts: number;
  private _accountsManager: number;
  private _groups: number;
  private _requestableGroups: number;

  public get identities(): number {
    return this._identities || 0;
  }

  public get accounts(): number {
    return this._accounts || 0;
  }

  public get accountsManager(): number {
    return this._accountsManager || 0;
  }

  public get groups(): number {
    return this._groups || 0;
  }

  public get noRequestableGroups(): boolean {
    return this._requestableGroups === 0;
  }

  constructor(
    identitiesIssues?: number,
    accountsIssues?: number,
    accountsManagerIssues?: number,
    groupsIssues?: number,
    requestableGroups?: number
  ) {
    this._identities = identitiesIssues;
    this._accounts = accountsIssues;
    this._accountsManager = accountsManagerIssues;
    this._groups = groupsIssues;
    this._requestableGroups = requestableGroups;
  }

  public get readinessCount(): number {
    let count = this.identities + this.accounts + this.groups;
    if (this.noRequestableGroups) {
      count++;
    }
    return count;
  }

  public get count(): number {
    return this.readinessCount + this.accountsManager;
  }
}
