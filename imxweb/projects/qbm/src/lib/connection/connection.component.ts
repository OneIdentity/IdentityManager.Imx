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

import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { PermissionInfo, SessionInfoData } from 'imx-api-qbm';
import { DataSourceToolbarSettings } from '../data-source-toolbar/data-source-toolbar-settings';
import { BusyService } from '../base/busy.service';
import { SnackBarService } from '../snackbar/snack-bar.service';
import { BaseReadonlyCdr } from '../cdr/base-readonly-cdr';
import { FormControl } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs/operators';
import { ColumnDependentReference } from '../cdr/column-dependent-reference.interface';
import { EntityService } from '../entity/entity.service';
import { ValType } from 'imx-qbm-dbts';
import { ISessionState } from '../session/session-state';
import { AuthenticationService } from '../authentication/authentication.service';
import { Subscription } from 'rxjs';
import { ConnectionSessionInfoData, SystemUsers } from './connection';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss']
})

/** Shows connection data and can copy data for support */
export class ConnectionComponent implements OnInit, OnDestroy {
  public busyService = new BusyService();
  public systemUsers: SystemUsers;
  public dstSettings: DataSourceToolbarSettings;
  public displayedColumns = ['Display','Description'];
  public search: FormControl = new FormControl('');
  public searchValue: string;
  public permissionGroups: PermissionInfo[] = [];
  public cdrList:ColumnDependentReference[] = [];
  public sessionState: ISessionState;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: ConnectionSessionInfoData,
    private readonly clipboard: Clipboard,
    private readonly snackbar: SnackBarService,
    private readonly entityService: EntityService,
    private readonly authentication: AuthenticationService,
    private readonly translate: TranslateService
  ) {
    this.subscriptions.push(this.authentication.onSessionResponse.subscribe((sessionState: ISessionState) => (this.sessionState = sessionState)));
  }

  ngOnInit() {
    const { FeatureGroups, PermissionGroups, ...systemUsers} = this.data;
    this.systemUsers = {...systemUsers};
    this.systemUsers.UserUid = this.data.UserUid =  this.sessionState?.UserUid;
    this.cdrList = this.createCdrList();
    this.permissionGroups = this.data.PermissionGroups;
    this.subscriptions.push(this.search.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      const searchValue = this.search.value.toLowerCase();
      this.permissionGroups = this.data.PermissionGroups.filter(permission => {
        return permission.Display.toLowerCase().includes(searchValue)
          || permission.Description.toLowerCase().includes(searchValue);
      });
    }));
  }

  /**
   * Creates cdr list based on the system users
   * @returns List of read-only cdrs
   */
  private createCdrList(): BaseReadonlyCdr[] {
    const cdrList: BaseReadonlyCdr[] = [];
    const columnNames: string[] = Object.keys(this.systemUsers);
    const ldsKeys = {
      AuthenticatedBy: "#LDS#Authentication used",
      CultureFormat: "#LDS#Language for value formatting",
      CultureUi: "#LDS#Language",
      DialogUserUid: "#LDS#System user UID",
      IsReadOnly: "#LDS#Read-only",
      TimeZone: "#LDS#Time zone",
      UserUid: "#LDS#User UID",
    }

    columnNames?.forEach((name) => {
      try {
        cdrList.push(new BaseReadonlyCdr(this.entityService.createLocalEntityColumn(
          { Type: typeof(this.systemUsers[name]) === "boolean" ? ValType.Bool : ValType.String, ColumnName: name, Display: this.translate.instant(ldsKeys[name] ?? "") },
          undefined,
          { Value: this.systemUsers[name] }
        )));
      } catch(e) {}
    });

    //Sort cdrs in ascending order
    cdrList.sort((cdrA, cdrB) => {
      const cdrADisplay = cdrA.column.GetMetadata().GetDisplay();
      const cdrBDisplay = cdrB.column.GetMetadata().GetDisplay();

      return cdrADisplay < cdrBDisplay ? -1 : cdrADisplay > cdrBDisplay ? 1 : 0;
    });

    return cdrList;
  }

  /**
   * Copies connection data to the clipboard in stringified JSON format
   */
  public copyConnectionData(): void {
    this.clipboard.copy(JSON.stringify(this.data));
    this.snackbar.open({ key: '#LDS#The connection information has been successfully copied to the clipboard.'});
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
