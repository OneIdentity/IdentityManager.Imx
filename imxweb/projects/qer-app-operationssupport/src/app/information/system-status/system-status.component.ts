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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Observable, Subject, Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { SystemStatusService } from './system-status.service';
import { SystemStatusInformation } from './system-status-information.interface';
import { ConfirmationService } from 'qbm';

@Component({
  templateUrl: './system-status.component.html',
  styleUrls: ['./system-status.component.scss', '../issue-tiles.scss'],
})
export class SystemStatusComponent implements OnInit, OnDestroy {
  [x: string]: any;

  public status: SystemStatusInformation;

  public isAdmin = false;


  public get iconClassDb(): string {
    return this.status == null ? this.cssClassError : this.status.IsDbSchedulerDisabled ? this.cssClassWarning : this.cssClassOk;
  }

  public get iconClassJob(): string {
    return this.status == null ? this.cssClassError : this.status.IsJobServiceDisabled ? this.cssClassWarning : this.cssClassOk;
  }

  public get iconClassDbStatus(): string {
    return this.status == null
      ? this.cssClassError
      : this.status.IsInMaintenanceMode || this.status.IsCompilationRequired
        ? this.cssClassWarning
        : this.cssClassOk;
  }

  public get iconClassMaintenance(): string {
    return this.status == null ? this.cssClassDbError : this.status.IsInMaintenanceMode ? this.cssClassDbWarning : this.cssClassDbOk;
  }

  public get iconClassUpdateStatus(): string {
    return this.status == null ? this.cssClassDbError : this.status.IsCompilationRequired ? this.cssClassDbWarning : this.cssClassDbOk;
  }

  public get columns(): number {
    this._columnCount = Math.max(1, Math.round(document.body.clientWidth / 369) - 1);
    return this._columnCount;
  }

  public get listWidth(): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(this._columnCount * 369 + 'px');
  }
  private refreshTimer: Subscription;
  private sub = new Subject<any>();

  private cssClassError = 'error';
  private cssClassWarning = 'warning';
  private cssClassOk = 'check';
  private cssClassDbError = 'error';
  private cssClassDbWarning = 'warning';
  private cssClassDbOk = 'check';

  /**
   * @ignore
   * List of subscriptions.
   */
  private subscriptions: Subscription[] = [];

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly statusService: SystemStatusService,
    private readonly confirmationService: ConfirmationService
  ) { }

  public async ngOnInit(): Promise<void> {
    this.isAdmin = await this.statusService.isSystemAdmin();
    this.initServerObserver();
  }

  public ngOnDestroy(): void {
    this.refreshTimer.unsubscribe();
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  public async toggleDbQueue(): Promise<void> {
    if (!this.status.IsDbSchedulerDisabled) {
      this.changeIsDbServiceDisabled();
      return;
    }

    if (await this.confirmationService.confirm({
      Title: '#LDS#Heading Start DBQueue',
      Message: '#LDS#Are you sure you want to start the DBQueue?',
      identifier: 'system-status-confirm-start-dbqueue'
    })) {
      this.changeIsDbServiceDisabled();
    }
  }

  public async toggleJobQueue(): Promise<void> {
    if (!this.status.IsJobServiceDisabled) {
      this.changeIsJobServiceDisabled();
      return;
    }

    if (await this.confirmationService.confirm({
      Title: '#LDS#Heading Start Job Queue',
      Message: '#LDS#Are you sure you want to start the Job queue?',
      identifier: 'system-status-confirm-start-jobqueue'
    })) {
      this.changeIsJobServiceDisabled();
    }
  }

  private changeIsJobServiceDisabled(): void {
    const observer = this.statusService.setStatus(!this.status.IsJobServiceDisabled, this.status.IsDbSchedulerDisabled);
    this.subscriptions.push(observer.subscribe(res => {
      this.sub.next('foo');
    }));
  }

  private initServerObserver(): void {
    let statusObserver: Observable<SystemStatusInformation>;
    statusObserver = this.sub.pipe(switchMap((term: any) => this.statusService.getStatus()));
    this.subscriptions.push(statusObserver.subscribe(res => {
      this.status = res as SystemStatusInformation;
    }));

    this.sub.next('foo');
    this.refreshTimer = interval(30000).subscribe(x => this.sub.next('foo'));
  }

  private changeIsDbServiceDisabled(): void {
    const observer = this.statusService.setStatus(this.status.IsJobServiceDisabled, !this.status.IsDbSchedulerDisabled);
    this.subscriptions.push(observer.subscribe(res => {
      this.sub.next('foo');
    }));
  }
}
