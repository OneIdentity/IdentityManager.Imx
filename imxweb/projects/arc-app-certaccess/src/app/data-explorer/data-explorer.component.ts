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

import { Component, OnInit, HostListener } from '@angular/core';
import { DeleteDataComponent } from './delete-data/delete-data.component';
import { MatDialog } from '@angular/material/dialog';
import { DeHelperService, DataDeleteOptions } from 'tsb';
import { OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavigationEnd, ActivatedRoute } from '@angular/router';
import { DataIssues } from './data-issues/data-issues.models';
import { DataIssuesService } from './data-issues/data-issues.service';
import { PortalTargetsystemUnsSystem, UserGroupInfo } from 'imx-api-arc';
import { UserModelService } from 'qer';
import { IdentitiesService } from 'qer';

export interface SideNavItem {
  name: string;
  translationKey: string;
  icon: string;
}

@Component({
  selector: 'imx-data-explorer',
  templateUrl: './data-explorer.component.html',
  styleUrls: ['./data-explorer.component.scss'],
})
export class DataExplorerComponent implements OnInit, OnDestroy {
  get isMobile(): boolean {
    return document.body.offsetWidth <= 768;
  }
  public navigationItems: SideNavItem[] = [];
  public selectedPage: string;
  public mobileSideNavExpanded = false;
  public showBackdrop = false;
  public contentMargin = this.isMobile ? '58px' : '230px';
  public applyIssuesFilter = false;
  public issuesFilterMode: string;
  public dataIssues: DataIssues;
  public targetSystemData: PortalTargetsystemUnsSystem[];

  private hasSync = false;
  private hasData = false;
  private deleteDataOptions: DataDeleteOptions;
  private routerEvents$: Subscription;
  private userGroups: UserGroupInfo[] = [];
  private defaultSelectedPage = 'identities';

  constructor(
    private dialog: MatDialog,
    private dataHelper: DeHelperService,
    private router: Router,
    private route: ActivatedRoute,
    private readonly identitiesService: IdentitiesService,
    private issues: DataIssuesService,
    private userModelService: UserModelService,
  ) {
    this.routerEvents$ = this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.handleRouteParam();
      }
    });
  }

  @HostListener('window:resize')
  public onResize(): void {
    this.showBackdrop = this.isMobile && this.mobileSideNavExpanded;
    setTimeout(() => this.setContentMargin(), 50);
  }

  public async ngOnInit(): Promise<void> {
    await this.checkAuthorityData();

    if (!this.showSyncStatus) {
      this.userGroups = await this.userModelService.getGroups();
      this.setupNavItems();
      this.issues.checkIssues(this.selectedPage !== 'issues').subscribe((issues: DataIssues) => (this.dataIssues = issues));
    }
  }

  public ngOnDestroy(): void {
    this.dialog.closeAll();

    if (this.routerEvents$) {
      this.routerEvents$.unsubscribe();
    }
  }

  public get hasDataIssues(): boolean {
    return this.dataIssues && this.dataIssues.count > 0;
  }

  public get showSyncStatus(): boolean {
    if (this.hasData) {
      return false;
    }
    return !this.hasSync || !this.hasData;

  }

  public toggleMobileExpand(): void {
    this.mobileSideNavExpanded = !this.mobileSideNavExpanded;
    const showBackdrop = this.isMobile && this.mobileSideNavExpanded;
    setTimeout(
      () => {
        this.showBackdrop = showBackdrop;
      },
      showBackdrop ? 0 : 500
    );
  }

  public selectPage(page: string): void {
    this.router.navigate([`data/explorer/${page}`]);

    if (this.isMobile) {
      this.toggleMobileExpand();
    }
  }

  public showDeleteModal(): void {
    const dialogRef = this.dialog.open(DeleteDataComponent, {
      width: '600px',
      data: this.deleteDataOptions,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dataHelper.authorityDataDeleted.next(result);
        this.identitiesService.authorityDataDeleted.next(result);
        this.checkAuthorityData();
      }
    });
  }

  private setupNavItems(): void {
    this.navigationItems = [];

    const userIsIdentityAdmin = this.userGroups.find((group) => {
      const groupName = group.Name ? group.Name.toUpperCase() : '';
      return groupName === 'SIM_4_OPAADMIN' || groupName === 'VI_4_NAMESPACEADMIN_ADS';
    });
    if (userIsIdentityAdmin) {
      this.navigationItems.push({
        name: 'identities',
        translationKey: '#LDS#Identities',
        icon: 'contactinfo',
      });
    } else {
      // If the user is not an identity admin, we need to change the default selected page
      // because they will not have access to identities page
      this.defaultSelectedPage = 'accounts';
      this.selectPage(this.defaultSelectedPage);
    }
    this.navigationItems.push(
      { name: 'accounts', translationKey: '#LDS#User accounts', icon: 'account' },
      { name: 'groups', translationKey: '#LDS#System entitlements', icon: 'usergroup' },
    );

    // If user has permissions to see O3T
    const msTeamsAdmin = this.userGroups.find((group) => {
      const groupName = group.Name ? group.Name.toUpperCase() : '';
      return groupName === 'O3T_4_NAMESPACEADMIN_MSTEAMS';
    });
    if (msTeamsAdmin) {
      this.navigationItems.push({
        name: 'teams',
        translationKey: '#LDS#Teams',
        icon: 'usergroup',
      });
    }
  }

  private setContentMargin(): void {
    this.contentMargin = !this.isMobile ? '230px' : '58px';
  }

  private handleRouteParam(): void {
    const tab = this.route.snapshot.paramMap.get('tab');
    const issuesFilter = this.route.snapshot.paramMap.get('issues');
    const issuesFilterMode = this.route.snapshot.paramMap.get('mode');

    this.applyIssuesFilter = issuesFilter ? true : false;
    this.issuesFilterMode = issuesFilterMode;

    // If the url tab is pointing to a data-sync page but there is no need to show sync, redirect
    if ((tab === 'no-sync' || tab === 'no-data') && !this.showSyncStatus) {
      this.selectPage(this.defaultSelectedPage);
      return;
    }

    // Handle the selection case, to set the selected page
    if (tab === 'no-sync' || tab === 'no-data' || (!this.showSyncStatus)) {
      // Handle the case where the user does not have access to the identities page and has
      // attempted to access it directly through the route
      if (this.defaultSelectedPage === 'accounts' && tab === 'identities') {
        this.selectPage(this.defaultSelectedPage);
        return;
      }
      this.selectedPage = tab ? tab : this.defaultSelectedPage;
    }
  }

  private async checkAuthorityData(): Promise<void> {
    this.deleteDataOptions = await this.dataHelper.getAuthorityData();
    this.hasSync = false;
    this.hasData = false;

    this.targetSystemData = this.deleteDataOptions.authorities;

    if (this.deleteDataOptions.hasAuthorities) {
      const authsWithSync = this.deleteDataOptions.authorities.filter((a: PortalTargetsystemUnsSystem) => {
        return a.HasSync.value;
      });

      this.hasSync = authsWithSync.length > 0;

      const authsWithData = this.deleteDataOptions.authorities.filter((a: PortalTargetsystemUnsSystem) => {
        return a.HasData.value;
      });

      this.hasData = authsWithData.length > 0;
    }

    if (!this.hasData && !this.hasSync) {
      // Only show no-sync if there is no data for any domain
      this.selectPage('no-sync');
    } else if (!this.hasData) {
      this.selectPage('no-data');
    } else {
      this.handleRouteParam();
    }
  }
}
