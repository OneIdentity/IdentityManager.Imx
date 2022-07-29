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

import { Injectable } from '@angular/core';
import { ArcApiService } from '../../services/arc-api-client.service';
import { DataIssues } from './data-issues.models';
import { forkJoin, from, Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { EuiLoadingService } from '@elemental-ui/core';
import { ApiService } from 'att';
import { QerApiService } from 'qer';
import { ADS_NAMESPACE_FILTER } from '../../responsibilities/unsgroups/unsgroups.service';
import { ExtendedTypedEntityCollection } from 'imx-qbm-dbts';
import { PortalPersonAll } from 'imx-api-qer';
import { QerPermissionsService } from 'qer';

@Injectable()
export class DataIssuesService {
  constructor(
    private readonly arcClient: ArcApiService,
    private readonly qerClient: QerApiService,
    private readonly loader: EuiLoadingService,
    private readonly attClient: ApiService,
    private qerPersmission: QerPermissionsService
  ) { }

  public startIdentitiesManagerWorkflow(): Promise<void> {
    const loaderRef = this.loader.show();

    return this.attClient.client.portal_attestation_managerattestation_post().finally(() => this.loader.hide(loaderRef));
  }

  public checkIssues(hideLoader?: boolean): Observable<DataIssues> {
    let loaderRef;

    if (!hideLoader) {
      loaderRef = this.loader.show();
    }
    return forkJoin([
      this.getIdentityIssues(),
      this.getAccountIssues(),
      this.getAccountManagerIssues(),
      this.getGroupIssues(),
      this.getRequestableGroups(),
    ]).pipe(
      map((issues: number[]) => {
        return new DataIssues(issues[0], issues[1], issues[2], issues[3], issues[4]);
      }),
      finalize(() => {
        if (loaderRef) {
          this.loader.hide(loaderRef);
        }
      })
    );
  }

  public getRequestableGroups(): Observable<number> {
    return from(
      this.arcClient.typedClient.PortalTargetsystemUnsGroup.Get({ PageSize: -1, published: '1', filter: [ADS_NAMESPACE_FILTER] })
    ).pipe(
      map((data) => {
        return data.totalCount;
      })
    );
  }

  private getIdentityIssues(): Observable<number> {
    return from(this.getPersons()).pipe(
      map((data) => {
        return data.totalCount;
      })
    );
  }

  private async getPersons(): Promise<ExtendedTypedEntityCollection<PortalPersonAll, unknown>> {
    const nav = (await this.qerPersmission.isPersonAdmin()) ? { PageSize: -1, withmanager: '0' } : { PageSize: -1 };
    return this.qerClient.typedClient.PortalPersonAll.Get(nav);
  }

  private getAccountIssues(): Observable<number> {
    return from(
      this.arcClient.typedClient.PortalTargetsystemUnsAccount.Get({
        PageSize: -1,
        orphaned: '1',
        filter: [ADS_NAMESPACE_FILTER],
      })
    ).pipe(
      map((data) => {
        return data.totalCount;
      })
    );
  }

  private getAccountManagerIssues(): Observable<number> {
    return from(
      this.arcClient.typedClient.PortalTargetsystemUnsAccount.Get({ PageSize: -1, managerdiscrepancy: '1', filter: [ADS_NAMESPACE_FILTER] })
    ).pipe(
      map((data) => {
        return data.totalCount;
      })
    );
  }

  private getGroupIssues(): Observable<number> {
    return from(
      this.arcClient.typedClient.PortalTargetsystemUnsGroup.Get({ PageSize: -1, withowner: '0', filter: [ADS_NAMESPACE_FILTER] })
    ).pipe(
      map((data) => {
        return data.totalCount;
      })
    );
  }
}
