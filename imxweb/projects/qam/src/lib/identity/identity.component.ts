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
 * Copyright 2024 One Identity LLC.
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

import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { BusyService, calculateSidesheetWidth, DynamicTabDataProviderDirective } from 'qbm';
import { SourceDetectiveSidesheetComponent, SourceDetectiveSidesheetData, SourceDetectiveType } from 'qer';
import { Subscription } from 'rxjs';
import { QamApiService } from '../qam-api-client.service';
import { TrusteeAccessData, TrusteeData } from '../TypedClient';

interface AccessForPath {
  DisplayPath: string;
  Accesses: AccessData[];
}

interface AccessData {
  Display: string;
  UidQamTrustee: string;
  Permissions: string[];
}

/** Shows access information for an identity. */
@Component({
  templateUrl: './identity.component.html',
  styleUrls: ['./identity.component.scss', '../qam.scss'],
  selector: 'imx-dge-identity',
})
export class IdentityComponent implements OnInit, OnDestroy {
  public data: TrusteeAccessData;

  public byPath: AccessForPath[] = [];

  public referrer: { objecttable: string; objectuid: string; display: string };

  public busyService: BusyService;
  public isLoading: boolean = true;
  @Input() public uid: string;
  @ViewChild(MatAccordion) public accordion: MatAccordion;
  private subscription: Subscription | undefined;

  constructor(
    @Optional() dataProvider: DynamicTabDataProviderDirective,
    private translate: TranslateService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly qamApi: QamApiService,
    private change: ChangeDetectorRef,
  ) {
    this.referrer = dataProvider?.data;
    this.busyService = new BusyService();
    this.subscription = this.busyService.busyStateChanged.subscribe((elem) => {
      this.isLoading = elem;
    });
  }

  public async ngOnInit() {
    const isBusy = this.busyService.beginBusy();
    try {
      this.data = await this.qamApi.client.portal_dge_access_identity_get(this.uid || this.referrer.objectuid);
    } finally {
      isBusy?.endBusy();
    }

    // pivot the data and store as byPath
    var allTrustees: TrusteeData[] = [];
    this.iterateRecursively(this.data.Trustees ?? [], allTrustees);
    const paths = [
      ...new Set(
        allTrustees
          .map((d) => d.Paths)
          .flat()
          .map((d) => d?.Path ?? ''),
      ),
    ];
    this.byPath = paths.map((path) => {
      return {
        DisplayPath: path,
        Accesses: allTrustees
          .map((t) => this.buildAccessData(t, path))
          .flat()
          .filter((x) => x.Permissions.length > 0),
      };
    });
    this.change.detectChanges();
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  public openSourceDetective(uidQamTrustee: string) {
    const data: SourceDetectiveSidesheetData = {
      UID_Person: this.referrer.objectuid,
      Type: SourceDetectiveType.MembershipOfEntitlement,
      UID: uidQamTrustee,
      TableName: 'QAMTrustee',
    };
    this.sideSheet.open(SourceDetectiveSidesheetComponent, {
      title: this.translate.instant('#LDS#Heading View Assignment Analysis'),
      padding: '0px',
      width: calculateSidesheetWidth(600, 0.4),
      disableClose: false,
      data,
    });
  }

  private iterateRecursively(t: TrusteeData[], result: TrusteeData[]) {
    t.forEach((trustee) => {
      result.push(trustee);
      if (trustee.Children) this.iterateRecursively(trustee.Children, result);
    });
  }

  private buildAccessData(t: TrusteeData, path: string): AccessData[] {
    return (
      t?.Paths?.map((p) => {
        if (p.Path != path)
          return {
            Display: '__WithoutPath',
            UidQamTrustee: '',
            Permissions: [],
          };
        return {
          Display: t.Display ?? '',
          UidQamTrustee: t.UidQamTrustee || '',
          Permissions: p.Permissions || [],
        };
      }).filter((x) => x.Display !== '__WithoutPath') ?? []
    );
  }
}
