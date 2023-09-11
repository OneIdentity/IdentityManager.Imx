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

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, ValidatorFn, AbstractControl, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Platform } from '@angular/cdk/platform';
import moment from 'moment-timezone';

import { LdsReplacePipe, ClassloggerService, DataSourceToolbarSettings, MetadataService } from 'qbm';
import { MetaTableData } from 'imx-api-qbm';
import { LifecycleActionParameter } from './lifecycle-action-parameter.interface';
import { LifecycleAction } from './lifecycle-action.enum';
import { EntitySchema, DisplayColumns, TypedEntityCollectionData, TypedEntity, IClientProperty } from 'imx-qbm-dbts';
import { AobApiService } from '../aob-api-client.service';

/**
 * A component that represents a dialog for submitting an {@link LifecycleAction|action} on the
 * given {@link PortalApplication|PortalApplication} or {@link PortalEntitlement|PortalEntitlements}.
 *
 */
@Component({
  selector: 'imx-entitlements-action',
  templateUrl: './lifecycle-action.component.html',
  styleUrls: ['./lifecycle-action.component.scss']
})
export class LifecycleActionComponent implements OnDestroy, OnInit {

  public readonly DisplayColumns = DisplayColumns; // Enables use of this static class in Angular Templates.
  public dstSettings: DataSourceToolbarSettings;

  public entitySchema: EntitySchema;

  /** The caption for the button with the corresponding action for specified {@link LifecycleAction|action} */
  public actionButtonText: string;

  /** The caption for the heading title of this dialog. */
  public dialogTitle: string;

  /** The display value for the specified type. */
  public tableDisplay: string;

  /** the mininum date for the datepicker */
  public readonly minDate: any;

  public publishFuture: boolean;

  public readonly publishDateForm: UntypedFormGroup;
  public readonly datepickerFormControl: UntypedFormControl;

  public readonly browserCulture: string;

  public whenToPublish: 'now' | 'future' = 'now';

  public get dateString(): string {
    return this.datepickerFormControl.value.toDate().toLocaleDateString(this.browserCulture);
  }

  public get timeString(): string {
    return this.datepickerFormControl.value.toDate().toLocaleTimeString(this.browserCulture);
  }

  private dataSource: TypedEntityCollectionData<TypedEntity>;

  /**
   * @ignore
   * List of subscriptions.
   */
  private subscriptions: Subscription[] = [];

  /** The list of colums to display in the dialog. */
  private displayedColumns: IClientProperty[];

  constructor(
    public dialogRef: MatDialogRef<LifecycleActionComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: LifecycleActionParameter,
    private readonly logger: ClassloggerService,
    private readonly ldsReplace: LdsReplacePipe,
    private readonly translateService: TranslateService,
    private readonly metadataProvider: MetadataService,
    private readonly aobApiService: AobApiService,
    private readonly platform: Platform) {
    this.browserCulture = this.translateService.currentLang;

    this.initCaptions();

    const curDate = new Date();
    curDate.setHours(24, 0, 0, 0);
    // set date to tomorrow
    this.minDate = moment(curDate);

    this.datepickerFormControl = new UntypedFormControl(this.minDate, this.validateDate(this.minDate, () => this.publishFuture));

    this.publishDateForm = new UntypedFormGroup({
      datepickerFormControl: this.datepickerFormControl,
      whenToPublish: new UntypedFormControl('now'),
    });

    this.subscriptions.push(this.publishDateForm.get('whenToPublish').valueChanges
      .subscribe((when: 'now' | 'future') => {
        this.whenToPublish = when;
        this.publishFuture = this.whenToPublish === 'future';
      }));

    this.publishFuture = false;

    this.dataSource = {
      Data: data.elements,
      totalCount: data.elements.length
    };
  }

  /**
   * @ignore Used internally.
   */
  public async ngOnInit(): Promise<void> {

    this.entitySchema = this.isApplication()
      ? this.aobApiService.typedClient.PortalApplication.GetSchema()
      : this.aobApiService.typedClient.PortalEntitlement.GetSchema();

    this.displayedColumns = [
      this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchema.Columns.UID_AERoleOwner
    ];

    this.dstSettings = {
      dataSource: this.dataSource,
      entitySchema: this.entitySchema,
      displayedColumns: this.displayedColumns,
      navigationState: {
        StartIndex: 0
      }
    };

    await this.metadataProvider
      .GetTableMetadata(this.entitySchema.TypeName)
      .then((metadata: MetaTableData) => (this.tableDisplay = metadata.DisplaySingular));
  }

  /**
   * @ignore Used internally.
   * Unsubscribes all listeners.
   */
  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Closes the {@link MatDialog|dialog} and returns the publish-data (in the publish-mode) or true (for all modes).
   */
  public submitData(): void {
    this.logger.debug(this, `Close the ${this.data.action} dialog for ${this.data.elements.length} ${this.data.type}(s).`);
    const result = this.data.action === LifecycleAction.Publish
      ? { publishFuture: this.publishFuture, date: this.datepickerFormControl.value.toDate() }
      : true;
    this.dialogRef.close(result);
  }

  public submitDataIe(): void {
    if (!this.platform.TRIDENT) {
      return;
    }

    this.submitData();
  }

  /** Returns true, if the dialog is used for unassigning items. */
  public isUnassign(): boolean {
    return this.data.action === LifecycleAction.Unassign;
  }

  /** Returns true, if the dialog is used for publishing items. */
  public isPublish(): boolean {
    return this.data.action === LifecycleAction.Publish;
  }

  /** Returns true, if the dialog is used for unpublishing items. */
  public isUnpublish(): boolean {
    return this.data.action === LifecycleAction.Unpublish;
  }

  /** Returns true, if the dialog is used for {@link PortalApplication|PortalApplication}. */
  public isApplication(): boolean {
    return this.data.type === 'AobApplication';
  }

  /** Returns true, if the dialog is used for {@link PortalEntitlement|PortalEntitlements}. */
  public isEntitlement(): boolean {
    return this.data.type === 'AobEntitlement';
  }

  private initCaptions(): void {
    this.logger.debug(this, `Init captions for the ${this.data.action.toString()}-mode depending on the application count.`);

    const multipleEntitlements = this.data != null && this.data.elements != null && this.data.elements.length > 1;
    let dialogTitle = multipleEntitlements ? '#LDS#Heading Unassign {0} Application Entitlements' : '#LDS#Heading Unassign Application Entitlement';
    let buttonText = multipleEntitlements ? '#LDS#Unassign' : '#LDS#Unassign';

    if (this.data.type === 'AobApplication') {
      dialogTitle = multipleEntitlements ? '#LDS#Heading Delete {0} Applications' : '#LDS#Heading Delete Application';
      buttonText = multipleEntitlements ? '#LDS#Delete' : '#LDS#Delete';
    }

    if (this.isPublish()) {
      if (this.data.type === 'AobApplication') {
        dialogTitle = multipleEntitlements ? '#LDS#Heading Publish {0} Applications' : '#LDS#Heading Publish Application';
        buttonText = multipleEntitlements ? '#LDS#Publish' : '#LDS#Publish';
      } else {
        dialogTitle = multipleEntitlements ? '#LDS#Heading Publish {0} Application Entitlements' : '#LDS#Heading Publish Application Entitlement';
        buttonText = multipleEntitlements ? '#LDS#Publish' : '#LDS#Publish';
      }
    } else if (this.isUnpublish()) {
      if (this.data.type === 'AobApplication') {
        dialogTitle = multipleEntitlements ? '#LDS#Heading Unpublish {0} Applications' : '#LDS#Heading Unpublish Application';
        buttonText = multipleEntitlements ? '#LDS#Unpublish' : '#LDS#Unpublish';
      } else {
        dialogTitle = multipleEntitlements ? '#LDS#Heading Unpublish {0} Application Entitlements' : '#LDS#Heading Unpublish Application Entitlement';
        buttonText = multipleEntitlements ? '#LDS#Unpublish' : '#LDS#Unpublish';
      }
    }

    this.translateService.get(dialogTitle)
      .subscribe((trans: string) => this.dialogTitle = this.ldsReplace.transform(trans, this.data.elements.length));

    this.translateService.get(buttonText).
      subscribe((trans: string) => this.actionButtonText = trans);
  }

  private validateDate(minDate: any, publishFuture: () => boolean): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (!publishFuture()) {
        return null;
      }
      if (!control.value || control.value.length > 0) {
        return { invalidDate: true };
      }
      if (control.value < minDate) {
        return { noFutureDateSelected: true };
      } else {
        return null;
      }
    };
  }
}
