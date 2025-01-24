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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ViewDevicesService } from '../view-devices.service';
import {
  AuthenticationService,
  BusyService,
  DataModelWrapper,
  DataSourceToolbarSettings,
  DataSourceWrapper,
  HelpContextualComponent,
  HelpContextualService,
  HELP_CONTEXTUAL,
  SideNavigationComponent,
} from 'qbm';
import { DeviceConfig, PortalCandidatesHardwaretype, PortalDevices } from 'imx-api-qer';
import { CollectionLoadParameters, DisplayColumns, EntitySchema, ValueStruct } from 'imx-qbm-dbts';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { ViewDevicesSidesheetComponent } from '../view-devices-sidesheet/view-devices-sidesheet.component';
import { TranslateService } from '@ngx-translate/core';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { QerPermissionsService } from '../../admin/qer-permissions.service';
import { Subscription } from 'rxjs';
import { IdentitiesService } from '../../identities/identities.service';
import { CreateNewDeviceComponent } from '../create-new-device/create-new-device.component';

@Component({
  selector: 'imx-view-devices-home',
  templateUrl: './view-devices.component.html',
  styleUrls: ['./view-devices.component.scss'],
})
export class ViewDevicesComponent implements OnInit, OnDestroy, SideNavigationComponent {
  public dataModelWrapper: DataModelWrapper;
  public hardwareTypeDataModelWrapper: DataModelWrapper;
  public dstWrapper: DataSourceWrapper<PortalDevices>;
  public dstWrapperHardwareType: DataSourceWrapper<PortalCandidatesHardwaretype>;
  public entitySchema: EntitySchema;
  public entitySchemaHardwareType: EntitySchema;
  public dstSettings: DataSourceToolbarSettings;
  public dstSettingsHardwareType: DataSourceToolbarSettings;
  public DisplayColumns = DisplayColumns;
  public deviceModelValueStruct: ValueStruct<string>[];
  public hardwareBasicTypeList: { type: string; basicType: string; key: string }[];
  public busyService = new BusyService();
  public contextId = HELP_CONTEXTUAL.PortalDevices;

  public deviceConfig: DeviceConfig;
  public managerId: string;
  public isAdmin = false;

  public currentUser: string;
  public isManagerForPersons: boolean;
  public isAuditor: boolean;
  private sessionResponse$: Subscription;

  constructor(
    private readonly viewDevicesService: ViewDevicesService,
    private readonly euiBusyService: EuiLoadingService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly projectConfigService: ProjectConfigurationService,
    private readonly authService: AuthenticationService,
    private readonly identitiesService: IdentitiesService,
    private readonly helpContextualService: HelpContextualService,
    qerPermissionService: QerPermissionsService
  ) {
    this.entitySchema = this.viewDevicesService.devicesSchema;

    this.entitySchemaHardwareType = this.viewDevicesService.hardwareTypeSchema;

    this.sessionResponse$ = this.authService.onSessionResponse.subscribe(async (session) => {
      if (session.IsLoggedIn) {
        (this.currentUser = session.UserUid), (this.isManagerForPersons = await qerPermissionService.isPersonManager());
        this.isAuditor = await qerPermissionService.isStructStatistics();
      }
    });

    this.hardwareBasicTypeList = [
      { type: '#LDS#Default computer', basicType: 'PC', key: 'QER-F098E96A4CA84FBBAFD7151436C4DD93' },
      { type: '#LDS#Default mobile phone', basicType: 'MP', key: 'QER-b945c1e156f34a0093315de7d66bb709' },
      { type: '#LDS#Default monitor', basicType: 'MO', key: 'QER-08BDA0B2A18D4C1697E991EF420BC6FB' },
      { type: '#LDS#Default printer', basicType: 'PR', key: 'QER-22D384E59B4A412287E10EA51E99735D' },
      { type: '#LDS#Default server', basicType: 'SRV', key: 'QER-B5BC91B95707471ABB9EBC00898C82ED' },
      { type: '#LDS#Default tablet', basicType: 'TAB', key: 'QER-4e8169e76bb249ca105c355adb1e0640' },
      { type: '#LDS#Miscellaneous devices', basicType: 'Default', key: 'QER-8A0F010A2BA54031A2320E078A6D8E26' },
    ];
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.managerId = (await this.identitiesService.getPerson(this.currentUser)).UID_PersonHead.Column.GetEntity().GetKeys()[0];

      if (this.deviceConfig == null) {
        this.deviceConfig = (await this.projectConfigService.getConfig()).DeviceConfig;
      }

      this.dataModelWrapper = {
        dataModel: await this.viewDevicesService.getDataModel(),
      };

      this.hardwareTypeDataModelWrapper = {
        dataModel: await this.viewDevicesService.getHardwareTypeDataModel(),
      };
    } finally {
      isBusy.endBusy();
    }

    this.dstWrapper = new DataSourceWrapper(
      (state, requestOpts, isInitial) => (isInitial ? Promise.resolve({ totalCount: 0, Data: [] }) : this.viewDevicesService.get(state)),
      [
        this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
        this.entitySchema.Columns.UID_HardwareType,
        this.entitySchema.Columns.UID_PersonOwner,
      ],
      this.entitySchema,
      this.dataModelWrapper,
      'view-devices'
    );

    this.dstWrapperHardwareType = new DataSourceWrapper(
      (state, requestOpts, isInitial) =>
        isInitial ? Promise.resolve({ totalCount: 0, Data: [] }) : this.viewDevicesService.getPortalCandidatesHardwaretype(state),
      [this.entitySchemaHardwareType.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]],
      this.entitySchemaHardwareType,
      this.hardwareTypeDataModelWrapper,
      'hardware-type'
    );

    this.getData(undefined, true);
  }

  public async getData(newState?: CollectionLoadParameters, isInitialLoad: boolean = false): Promise<void> {
    const isbusy = this.busyService.beginBusy();
    try {
      this.dstSettings = await this.dstWrapper.getDstSettings(newState, undefined, isInitialLoad);

      const dstSettingsHardwareType = await this.dstWrapperHardwareType.getDstSettings(newState, undefined, isInitialLoad);
      if (dstSettingsHardwareType) {
        this.dstSettingsHardwareType = dstSettingsHardwareType;
        this.deviceModelValueStruct = this.dstSettingsHardwareType.dataSource.Data.map((d) => {
          return {
            DataValue: d.GetEntity().GetKeys()[0],
            DisplayValue: d.GetEntity().GetDisplay(),
          };
        });
      }
    } finally {
      isbusy.endBusy();
    }
  }

  public async onHighlightedEntityChanged(portalDevices: PortalDevices): Promise<void> {
    if (portalDevices) {
      let overlayRef: OverlayRef;
      setTimeout(() => (overlayRef = this.euiBusyService.show()));

      let extendedEntity;
      let deviceEntityConfig = this.deviceConfig['VI_Hardware_Fields_Default'];
      try {
        const key = portalDevices.GetEntity().GetKeys().join(',');
        extendedEntity = await this.viewDevicesService.getPortalDeviceEntity(key);

        const hardwareBasicType = extendedEntity.Data[0].HardwareBasicType.value;

        if (this.deviceConfig[`VI_Hardware_Fields_${hardwareBasicType}`]) {
          deviceEntityConfig = this.deviceConfig[`VI_Hardware_Fields_${hardwareBasicType}`];
        }
      } finally {
        setTimeout(() => this.euiBusyService.hide(overlayRef));
      }

      if (!extendedEntity || !deviceEntityConfig) {
        return;
      }

      this.helpContextualService.setHelpContextId(HELP_CONTEXTUAL.PortalDevicesEdit);
      const result = await this.sideSheet
        .open(ViewDevicesSidesheetComponent, {
          title: await this.translate.get('#LDS#Heading Edit Device').toPromise(),
          subTitle: portalDevices.GetEntity().GetDisplay(),
          padding: '0',
          width: 'max(600px, 60%)',
          disableClose: true,
          testId: 'devices-sidesheet',
          data: {
            device: extendedEntity.Data[0],
            deviceEntityConfig: deviceEntityConfig,
          },
          headerComponent: HelpContextualComponent,
        })
        .afterClosed()
        .toPromise();

      if (result) {
        this.getData();
      }
    }
  }

  public async createNewDevice(key: string, index: number): Promise<void> {
    let deviceEntityConfig = this.deviceConfig['VI_Hardware_Fields_Default'];
    const hardwareBasicTypeListElement = this.hardwareBasicTypeList.find((hardwareType) => hardwareType.key === key);
    if (hardwareBasicTypeListElement) {
      const hardwareBasicType = this.hardwareBasicTypeList[this.hardwareBasicTypeList.indexOf(hardwareBasicTypeListElement)].basicType;
      deviceEntityConfig = this.deviceConfig[`VI_Hardware_Fields_${hardwareBasicType}`];
    }
    let deviceModelValueStruct = this.deviceModelValueStruct[index];

    this.helpContextualService.setHelpContextId(HELP_CONTEXTUAL.PortalDevicesCreate);
    const result = await this.sideSheet
      .open(CreateNewDeviceComponent, {
        title: await this.translate.get('#LDS#Heading Create Device').toPromise(),
        padding: '0px',
        width: 'max(650px, 65%)',
        disableClose: false,
        testId: 'create-new-device-sidesheet',
        data: {
          newDevice: await this.viewDevicesService.createNewDevice(),
          deviceEntityConfig: deviceEntityConfig,
          deviceModelValueStruct: deviceModelValueStruct,
        },
        headerComponent: HelpContextualComponent,
      })
      .afterClosed()
      .toPromise();

    if (result) {
      this.getData();
    }
  }

  ngOnDestroy(): void {
    if (this.sessionResponse$) {
      this.sessionResponse$.unsubscribe();
    }
  }
}
