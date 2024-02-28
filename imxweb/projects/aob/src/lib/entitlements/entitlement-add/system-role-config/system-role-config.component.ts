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

import { ListRange } from '@angular/cdk/collections';
import { OverlayRef } from '@angular/cdk/overlay';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Subscription } from 'rxjs';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSelectionListChange } from '@angular/material/list';
import { MatRadioChange } from '@angular/material/radio';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { CollectionLoadParameters, TypedEntity } from 'imx-qbm-dbts';
import { SettingsService } from 'qbm';
import { SystemRoleConfigService } from './system-role-config.service';

@Component({
  templateUrl: './system-role-config.component.html',
  styleUrls: ['./system-role-config.component.scss']
})
export class SystemRoleConfigComponent implements AfterViewInit, OnDestroy {

  public readonly form: UntypedFormGroup;
  public type: 'new' | 'existing' = 'new';
  public selectedRole: string;

  public showHelperAlert = true;

  public candidates: TypedEntity[];

  @ViewChild('viewport') private viewport: CdkVirtualScrollViewport;
  private parameters: CollectionLoadParameters;
  private readonly subscriptions: Subscription[] = [];


  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly data: { uid: string, createOnly: boolean },
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly busyService: EuiLoadingService,
    private readonly addToExistingProvider: SystemRoleConfigService,
    private readonly settingsService: SettingsService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {
    this.form = new UntypedFormGroup({ name: new UntypedFormControl(undefined, Validators.required) });
  }

  public async ngAfterViewInit(): Promise<void> {
    this.parameters = { PageSize: this.settingsService.DefaultPageSize, StartIndex: 0 };

    if (this.viewport) {
      this.subscriptions.push(this.viewport.renderedRangeStream.subscribe(async (range: ListRange) => {
        if (range.end === (this.settingsService.DefaultPageSize + this.parameters.StartIndex)) {
          this.parameters.StartIndex += this.settingsService.DefaultPageSize;

          const tmpCandidates = Object.assign([], this.candidates);
          await this.loadData(this.parameters);

          this.candidates.unshift(...tmpCandidates);
          this.changeDetectorRef.detectChanges();
        }
      }));
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public async typeChanged(evt: MatRadioChange): Promise<void> {
    if (evt.value === 'existing') {
      if (this.viewport) {
        this.subscriptions.push(this.viewport.renderedRangeStream.subscribe(async (range: ListRange) => {
          if (range.end === (this.settingsService.DefaultPageSize + this.parameters.StartIndex)) {
            this.parameters.StartIndex += this.settingsService.DefaultPageSize;

            const tmpCandidates = Object.assign([], this.candidates);
            await this.loadData(this.parameters);

            this.candidates.unshift(...tmpCandidates);
            this.changeDetectorRef.detectChanges();
          }
        }));
      }
      this.selectedRole = null;
      await this.loadData({ ...this.parameters, ...{ StartIndex: 0 } });
    }
  }

  public async updateSelected(selection: MatSelectionListChange): Promise<void> {
    this.selectedRole = selection.options[0].value.GetEntity().GetKeys()[0];
  }

  public onHelperDismissed(): void {
    this.showHelperAlert = false;
  }

  public close(createNew: boolean): void {
    if (createNew) {
      this.sidesheetRef.close({ NameNewEset: this.form.get('name').value });
    } else {
      this.sidesheetRef.close({ UidEset: this.selectedRole });
    }
  }

  private async loadData(newState?: CollectionLoadParameters): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      this.candidates = (await this.addToExistingProvider.getExistingRoles(this.data.uid, newState))
        .Data;
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public LdsAddOrCreate = '#LDS#Here you can merge the application entitlements into a new system role or add the application entitlements to an existing system role. The system role will then be assigned to the application as an application entitlement.';

}
