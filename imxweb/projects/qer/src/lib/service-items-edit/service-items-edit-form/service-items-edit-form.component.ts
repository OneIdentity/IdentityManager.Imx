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

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  UntypedFormArray,
} from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TranslateService } from '@ngx-translate/core';
import { IEntity, IEntityColumn, TypedEntity } from 'imx-qbm-dbts';

import { BaseCdr, ClassloggerService, ColumnDependentReference, CdrFactoryService, ExtService, BusyService } from 'qbm';
import { QerPermissionsService } from '../../admin/qer-permissions.service';
import { OwnerControlComponent } from '../../owner-control/owner-control.component';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { ServiceItemTagsService } from '../../service-item-tags/service-item-tags.service';
import { ServiceItemsEditService } from '../../service-items-edit/service-items-edit.service';

export interface AdditionalCdrColumn {
  columnName: string;
}

/**
 * Interface for the service items form
 */
interface ServiceItemsFormGroup {
  array: UntypedFormArray;
}

export const additionalColumnsForServiceItemsKey = 'additionalCdrColumns';

@Component({
  selector: 'imx-service-items-edit-form',
  templateUrl: './service-items-edit-form.component.html',
  styleUrls: ['./service-items-edit-form.component.scss'],
})
export class ServiceItemsEditFormComponent implements OnInit, OnChanges {
  @ViewChild('ownerControl') public ownercontrol: OwnerControlComponent;
  @Input() public serviceItem: TypedEntity;
  @Input() public busyService: BusyService;
  @Output() public formControlCreated = new EventEmitter<AbstractControl>();

  public readonly formGroup: FormGroup<ServiceItemsFormGroup> = new FormGroup<ServiceItemsFormGroup>({ array: new UntypedFormArray([]) });
  public cdrList: ColumnDependentReference[] = [];
  public isInActiveFormControl = new FormControl<boolean>(false);
  public canEditOwner: boolean;

  public static readonly alertExtId = 'serviceItemEditForm.alert';
  public ServiceItemsEditFormComponent = ServiceItemsEditFormComponent;

  public productTagsInitial: string[] = [];
  public productTagsSelected: string[];
  public loadingTags: boolean;

  private editableServiceItemColumns: string[] = [];
  private inheritCategoryImagesToItems = false;
  private imageHint: string;

  constructor(
    private serviceItemsEditService: ServiceItemsEditService,
    private serviceItemTagsService: ServiceItemTagsService,
    private readonly logger: ClassloggerService,
    private readonly ext: ExtService,
    private readonly translate: TranslateService,
    private readonly permission: QerPermissionsService,
    private readonly projectConfig: ProjectConfigurationService,
    private readonly cdrFactoryService: CdrFactoryService
  ) {}

  get getSelectedUidPerson(): string {
    return this.ownercontrol?.uidPersonSelected;
  }

  get key(): string {
    return this.serviceItem.GetEntity().GetKeys().join(',');
  }

  public async ngOnInit(): Promise<void> {
    this.canEditOwner = await this.permission.isShopAdmin();
    this.imageHint = await this.translate
      .get('#LDS#If you do not specify an image, the image of the assigned service category will be used.')
      .toPromise();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.serviceItem) {
      this.setup();
    }
  }

  public onImageValueChanged(control: AbstractControl, cdr: BaseCdr): void {
    this.updateImageHint(cdr);
  }

  public onFormControlCreated(control: AbstractControl, cdr?: BaseCdr): void {
    this.formGroup.controls.array.push(control);
    this.formControlCreated.emit(control);

    if (cdr) {
      this.updateImageHint(cdr);
    }
  }

  public async onRequestableToggleChanged(checkboxChange: MatSlideToggleChange): Promise<void> {
    // Invert the toggle value to match with the inverted state of the column 'IsInActive'
    const value = !checkboxChange?.checked;
    if (this.getColumn('IsInActive')?.GetMetadata().CanEdit()) {
      await this.getColumn('IsInActive').PutValue(value);
    }
  }

  public canEditProperty(property: string): boolean {
    return this.editableServiceItemColumns?.includes(property);
  }

  public getColumn(name: string): IEntityColumn {
    return CdrFactoryService.tryGetColumn(this.serviceItem.GetEntity(), name);
  }

  public async saveTags(): Promise<void> {
    const changeSet = this.getTagsChangeSet();
    return this.serviceItemTagsService.updateTags(this.key, changeSet.add, changeSet.remove);
  }

  private getTagsChangeSet(): { add: string[]; remove: string[] } {
    this.logger.trace(this, 'save tags initial', this.productTagsInitial);
    this.logger.trace(this, 'save tags selected', this.productTagsSelected);

    return {
      add: this.productTagsSelected.filter((elem) => this.productTagsInitial.indexOf(elem) < 0),
      remove: this.productTagsInitial.filter((elem) => this.productTagsSelected.indexOf(elem) < 0),
    };
  }

  private async setup(): Promise<void> {
    let isBusy: { endBusy: () => void };
    if (this.busyService) {
      isBusy = this.busyService.beginBusy();
    } else {
      this.serviceItemsEditService.handleOpenLoader();
    }
    try {
      this.formGroup.controls.array.clear();
      this.formGroup.markAsPristine();
      const projectConfig = await this.projectConfig.getConfig();
      this.inheritCategoryImagesToItems = projectConfig.ITShopConfig?.InheritCategoryImagesToItems;
      this.editableServiceItemColumns = projectConfig.OwnershipConfig?.EditableFields?.AccProduct;
      const showTermsOfUseCdr = await this.serviceItemsEditService.hasTermsOfUseCancdidates();
      const showProductParamCategory = await this.serviceItemsEditService.hasAccproductparamcategoryCandidates();
      const showFunctionalArea = await this.serviceItemsEditService.hasFunctionalAreaCandidates();
      await this.createCdrList(this.serviceItem.GetEntity(), showTermsOfUseCdr, showFunctionalArea, showProductParamCategory);
    } finally {
      if (isBusy) {
        isBusy.endBusy();
      } else {
        this.serviceItemsEditService.handleCloseLoader();
      }
    }

    if (this.editableServiceItemColumns.includes('IsInActive')) {
      // Handle the requestable (IsInActive column) outside the context of a CDR editor so the UI can invert the meaning to make
      // more sense to the user
      // This should be inversed on the api data response at some point, but until then we handle it in the UI
      this.isInActiveFormControl.setValue(!this.getColumn('IsInActive')?.GetValue());
      this.onFormControlCreated(this.isInActiveFormControl);
    }

    await this.initTags();
  }

  private async createCdrList(
    entity: IEntity,
    showTermsOfUseCdr: boolean,
    showFunctionalArea: boolean,
    showProductParamCategory: boolean
  ): Promise<void> {
    this.cdrList = [];
    const isToHideFromITShopText = await this.translate.get('#LDS#Hide in product selection').toPromise();
    this.editableServiceItemColumns
      .filter((name) => !['IsInActive', 'UID_OrgRuler'].includes(name))
      .filter((name) => name !== 'UID_QERTermsOfUse' || showTermsOfUseCdr)
      .filter((name) => name !== 'UID_FunctionalArea' || showFunctionalArea)
      .filter((name) => name !== 'UID_AccProductParamCategory' || showProductParamCategory)
      .map((columnName) => {
        let cdr: ColumnDependentReference;
        // Special case the text texts
        if (columnName === 'IsToHideFromITShop') {
          cdr = this.cdrFactoryService.buildCdr(entity, columnName, false, isToHideFromITShopText);
        } else {
          cdr = this.cdrFactoryService.buildCdr(entity, columnName);
        }
        if (cdr != null) {
          this.cdrList.push(cdr);
        }
      });

    const extensions = this.ext.Registry[additionalColumnsForServiceItemsKey] ?? [];
    for (const ext of extensions) {
      const additionalColumn = ext.inputData as AdditionalCdrColumn;
      const columnName = additionalColumn.columnName;
      const cdr = this.cdrFactoryService.buildCdr(entity, columnName);
      if (cdr != null) {
        this.cdrList.push(cdr);
      }
    }
  }

  private updateImageHint(cdr: BaseCdr): BaseCdr {
    const column = cdr.column;
    cdr.hint = this.inheritCategoryImagesToItems && column.GetValue().length === 0 ? this.imageHint : '';
    return cdr;
  }

  private async initTags(): Promise<void> {
    this.loadingTags = true;

    this.productTagsInitial = (await this.serviceItemTagsService.getTags(this.key)).Data.map((elem) => elem.Ident_DialogTag.value);
    this.productTagsSelected = this.productTagsInitial.slice();

    this.loadingTags = false;
  }
}
