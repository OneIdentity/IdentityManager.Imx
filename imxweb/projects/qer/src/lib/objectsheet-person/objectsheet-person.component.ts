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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';

import { ObjectSheetInterface, NavigationService, SystemInfoService, AuthenticationService, ISessionState } from 'qbm';
import { PortalPersonMasterdata } from 'imx-api-qer';
import { DbObjectKey, EntitySchema, IClientProperty, IEntity, IEntityColumn, ReadOnlyEntity } from 'imx-qbm-dbts';

import { ObjectsheetPersonService } from './objectsheet-person.service';
import { UserModelService } from '../user/user-model.service';
import { QerApiService } from '../qer-api-client.service';
import { Subscription } from 'rxjs';
import { PasscodeService } from '../ops/passcode.service';

/** This component is the ObjectSheet implementation for Person objects. */
@Component({
  templateUrl: './objectsheet-person.component.html',
  styleUrls: ['./objectsheet-person.component.scss']
})
export class ObjectsheetPersonComponent implements OnInit, OnChanges, OnDestroy, ObjectSheetInterface {

  public object: PortalPersonMasterdata;
  public objectEntity: IEntity;
  public objectKey: DbObjectKey;

  public countLastPWOs = 0;
  public detailProperties: IEntityColumn[] = [];
  public isSameUser: boolean;

  private readonly personMasterDataEntitySchema: EntitySchema;

  private isHistoryActive: boolean;
  private preProps: string[] = [];
  private isAdmin: boolean;
  private isManager: boolean;
  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly qerClient: QerApiService,
    private readonly busyService: EuiLoadingService,
    private readonly navigationService: NavigationService,
    private readonly passcodeService: PasscodeService,
    private readonly userModelService: UserModelService,
    private readonly authentication: AuthenticationService,
    private readonly systemInfoService: SystemInfoService,
    private readonly objectsheetPersonService: ObjectsheetPersonService) {
    this.personMasterDataEntitySchema = this.qerClient.typedClient.PortalPersonMasterdata.GetSchema();
  }

  public async ngOnInit(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      const systemInfo = await this.systemInfoService.get();
      this.preProps = systemInfo.PreProps;

      const userConfig = await this.userModelService.getUserConfig();
      this.isHistoryActive = userConfig.IsHistoryActive;

      const entityData = await this.qerClient.client.portal_dbobject_get(this.objectKey.TableName, this.objectKey.Keys.join(','));
      this.object = new PortalPersonMasterdata(new ReadOnlyEntity(this.personMasterDataEntitySchema, entityData));
      this.objectEntity = this.object.GetEntity();

      await this.calculatePWOsInLast30Days();

      await this.load();
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.objectKey) {
      await this.load();
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public goToHyperview(): void {
    this.navigationService.navigate(['person', this.object.UID_Person.value, 'hyperview'], this.objectKey);
  }

  public goToMainData(): void {
    this.navigationService.navigate(['person', this.object.UID_Person.value, 'masterdata'], this.objectKey);
  }

  public goToRequests(): void {
    this.navigationService.navigate(['person', this.object.UID_Person.value, 'requests'], this.objectKey);
  }

  public goToEntitlements(): void {
    this.navigationService.navigate(['person', this.object.UID_Person.value, 'entitlements'], this.objectKey);
  }

  public goToRiskAnalysis(): void {
    this.navigationService.navigate(['riskanalysis/Person', this.object.UID_Person.value], this.objectKey);
  }

  public goToHistory(): void {
    this.navigationService.navigate(['history/Person', this.object.UID_Person.value], this.objectKey);
  }

  public showHistory(): boolean {
    return this.isHistoryActive && this.isManagerOrAdmin();
  }

  public showShop(): boolean {
    return this.preProps.includes('ITSHOP') && this.isManagerOrAdmin();
  }

  public showRisk(): boolean {
    return this.preProps.includes('RISKINDEX')
      /* TODO later
  (from object select current isManagerOrAdmin OR (
  exists("personinaerole", variable("uid_aerole in ('ATT-AEROLE-ATTESTATIONADMIN-ADMIN',
  'POL-AEROLE-QERPOLICY-ADMIN', 'CPL-AEROLE-RULEADMIN-ADMIN') and uid_person = '%useruid%'"))))*/
      && (this.isManagerOrAdmin() || true);
  }

  public isManagerOrAdmin(): boolean {
    return this.isAdmin || this.isManager;
  }

  private async calculatePWOsInLast30Days(): Promise<void> {
    const pwos = await this.objectsheetPersonService.getRequests(this.object.UID_Person.value, 30);
    this.countLastPWOs = pwos.totalCount;
  }

  private async load(): Promise<void> {
    this.subscriptions.push(this.authentication.onSessionResponse.subscribe(async (sessionState: ISessionState) => {
      if (sessionState) {
        this.isSameUser = sessionState.UserUid === this.objectKey.Keys.join(',');
      }
    }));

    const result = await this.qerClient.typedClient.PortalView.Get(this.objectKey.TableName, this.objectKey.Keys.join(','));
    this.isAdmin = result.Data[0].IsAdmin.value;
    this.isManager = result.Data[0].IsOwner.value;
    const entity = result.Data[0].GetEntity();
    const properties = result.extendedData as IClientProperty[];
    if (properties) {
      entity.AddColumns(properties);
      this.detailProperties = properties.map(colName => entity.GetColumn(colName.ColumnName));
    }
  }
}
