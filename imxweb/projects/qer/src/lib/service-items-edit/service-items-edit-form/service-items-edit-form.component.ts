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

import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TranslateService } from '@ngx-translate/core';
import { PortalServiceitemsInteractive } from 'imx-api-qer';
import { IEntity, IEntityColumn } from 'imx-qbm-dbts';

import { BaseCdr, ClassloggerService, ColumnDependentReference } from 'qbm';
import { Subscription } from 'rxjs';
import { QerPermissionsService } from '../../admin/qer-permissions.service';
import { OwnerControlComponent } from '../../owner-control/owner-control.component';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { ServiceItemTagsService } from '../../service-item-tags/service-item-tags.service';
import { ServiceItemsEditService } from '../../service-items-edit/service-items-edit.service';
import { UserModelService } from '../../user/user-model.service';

@Component({
  selector: 'imx-service-items-edit-form',
  templateUrl: './service-items-edit-form.component.html',
  styleUrls: ['./service-items-edit-form.component.scss']
})
export class ServiceItemsEditFormComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild('ownerControl') public ownercontrol: OwnerControlComponent;
  @Input() public serviceItem: PortalServiceitemsInteractive;
  @Output() public formControlCreated = new EventEmitter<AbstractControl>();

  public readonly formGroup: FormGroup;
  public cdrList: ColumnDependentReference[] = [];
  public isInActiveFormControl = new FormControl();
  public canEditOwner: boolean;

  public productTagsInitial: string[] = [];
  public productTagsSelected: string[];
  public loadingTags: boolean;

  private editableServiceItemColumns: string[] = [];
  private readonly subscriptions: Subscription[] = [];

  constructor(
    formBuilder: FormBuilder,
    private serviceItemsEditService: ServiceItemsEditService,
    private serviceItemTagsService: ServiceItemTagsService,
    private readonly logger: ClassloggerService,
    private readonly userModelService: UserModelService,
    private readonly translate: TranslateService,
    private readonly permission: QerPermissionsService,
    private readonly projectConfig: ProjectConfigurationService
  ) {
    this.formGroup = new FormGroup({ formArray: formBuilder.array([]) });
  }

  get formArray(): FormArray {
    return this.formGroup.get('formArray') as FormArray;
  }

  get getSelectedUidPerson(): string {
    return this.ownercontrol?.uidPersonSelected;
  }

  get key(): string {
    return this.serviceItem.GetEntity().GetKeys().join(',');
  }

  public async ngOnInit(): Promise<void> {
    this.canEditOwner = await this.permission.isShopAdmin();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.serviceItem) {
      this.setup();
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public async onFormControlCreated(control: AbstractControl, cdr?: BaseCdr): Promise<void> {
    this.formArray.push(control);
    this.formControlCreated.emit(control);

    if (cdr) {
      await this.updateImageHint(cdr);
      this.subscriptions.push(control.valueChanges.subscribe(async () => {
        await this.updateImageHint(cdr);
      }));
    }
  }


  public onRequestableToggleChanged(checkboxChange: MatSlideToggleChange): void {
    // Invert the toggle value to match with the inverted state of the column 'IsInActive'
    const value = !checkboxChange?.checked;
    if (this.serviceItem.IsInActive.GetMetadata().CanEdit()) {
      this.serviceItem.IsInActive.value = value;
    }
  }

  public canEditProperty(property: string): boolean {
    return this.editableServiceItemColumns?.includes(property);
  }

  public async saveTags(): Promise<void> {
    const changeSet = this.getTagsChangeSet();
    return this.serviceItemTagsService.updateTags(this.key, changeSet.add, changeSet.remove);
  }

  private getTagsChangeSet(): { add: string[], remove: string[] } {
    this.logger.trace(this, 'save tags initial', this.productTagsInitial);
    this.logger.trace(this, 'save tags selected', this.productTagsSelected);

    return {
      add: this.productTagsSelected.filter(elem => this.productTagsInitial.indexOf(elem) < 0),
      remove: this.productTagsInitial.filter(elem => this.productTagsSelected.indexOf(elem) < 0)
    };
  }

  private async setup(): Promise<void> {
    this.serviceItemsEditService.handleOpenLoader();
    try {
      this.editableServiceItemColumns = (await this.projectConfig.getConfig()).OwnershipConfig?.EditableFields?.AccProduct;
      const showTermsOfUseCdr = await this.serviceItemsEditService.hasTermsOfUseCancdidates();
      const showProductParamCategory = await this.serviceItemsEditService.hasAccproductparamcategoryCandidates();
      const showFunctionalArea = await this.serviceItemsEditService.hasFunctionalAreaCandidates();
      this.createCdrList(
        this.serviceItem.GetEntity(),
        showTermsOfUseCdr,
        showFunctionalArea,
        showProductParamCategory
      );
    } finally {
      this.serviceItemsEditService.handleCloseLoader();
    }

    if (this.editableServiceItemColumns.includes('IsInActive')) {
      // Handle the requestable (IsInActive column) outside the context of a CDR editor so the UI can invert the meaning to make
      // more sense to the user
      // This should be inversed on the api data response at some point, but until then we handle it in the UI
      this.isInActiveFormControl.setValue(!this.serviceItem.IsInActive.value);
      this.onFormControlCreated(this.isInActiveFormControl);
    }

    await this.initTags();
  }

  private createCdrList(
    entity: IEntity,
    showTermsOfUseCdr: boolean,
    showFunctionalArea: boolean,
    showProductParamCategory: boolean
  ): void {
    this.editableServiceItemColumns
      .filter(name => !['IsInActive', 'UID_OrgRuler'].includes(name))
      .filter(name => name !== 'UID_QERTermsOfUse' || showTermsOfUseCdr)
      .filter(name => name !== 'UID_FunctionalArea' || showFunctionalArea)
      .filter(name => name !== 'UID_AccProductParamCategory' || showProductParamCategory)
      .map(columnName => {
        const column = this.tryGetColumn(entity, columnName);
        if (column != null) {
          this.cdrList.push(new BaseCdr(column));
        }
      });
  }

  private async updateImageHint(cdr: BaseCdr): Promise<BaseCdr> {
    const column = cdr.column;
    // TODO #290223 show the hint, only when value is not set (column.GetValue().length === 0)
    cdr.hint = column.ColumnName === 'JPegPhoto'
      ? await this.translate.get('#LDS#If you do not specify an image, the image of the assigned service category will be used.').toPromise()
      : '';
    return cdr;
  }

  private tryGetColumn(entity: IEntity, name: string): IEntityColumn {
    try {
      return entity.GetColumn(name);
    } catch {
      return undefined;
    }
  }

  private async initTags(): Promise<void> {
    this.loadingTags = true;

    this.productTagsInitial = (await this.serviceItemTagsService.getTags(this.key))
      .Data.map(elem => elem.Ident_DialogTag.value);
    this.productTagsSelected = this.productTagsInitial.slice();

    this.loadingTags = false;
  }

}
