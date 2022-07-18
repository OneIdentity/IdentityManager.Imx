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

import { Component, Input, ErrorHandler, OnChanges, SimpleChanges, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiLoadingService } from '@elemental-ui/core';

import { PortalEntitlement, PortalEntitlementServiceitem } from 'imx-api-aob';
import { ClassloggerService } from 'qbm';
import { TypedEntity } from 'imx-qbm-dbts';
import { ServiceItemTagsService } from 'qer';

/**
 * A component that provides a form for viewing and editing entitlements/roles.
 */
@Component({
  selector: 'imx-entitlement-edit',
  templateUrl: './entitlement-edit.component.html',
  styleUrls: ['./entitlement-edit.component.scss']
})
export class EntitlementEditComponent implements OnChanges, OnInit {
  public readonly form = new FormGroup({});

  public productTagsInitial: string[] = [];
  public productTagsSelected: string[];
  public loadingTags: boolean;

  @Input() public entitlement: PortalEntitlement;
  @Input() public serviceItem: PortalEntitlementServiceitem;

  @Output() public readonly controlCreated = new EventEmitter<AbstractControl>();
  @Output() public readonly saved = new EventEmitter();

  constructor(
    private readonly tagProvider: ServiceItemTagsService,
    private readonly logger: ClassloggerService,
    private readonly errorHandler: ErrorHandler,
    private readonly busyService: EuiLoadingService
  ) { }

  public ngOnInit(): void {
    this.controlCreated.emit(this.form);
  }

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.entitlement || changes.serviceItem) {
      if (changes.entitlement && this.entitlement) {
        if (this.entitlement.UID_AccProduct.value !== '') {
          await this.initTags(this.entitlement);
        }
      }

      this.form.markAsPristine();
    }
  }

  /**
   * Saves all changes of specified  {@link PortalEntitlement|entitlement}.
   * @param entitlement The {@link PortalEntitlement|entitlement} to be saved.
   */
  public async save(): Promise<void> {
    this.logger.trace(this, 'Save clicked for entitlement', this.entitlement);
    const success = await this.tryCommit([this.entitlement, this.serviceItem]);
    this.saved.emit(success);
  }

  private async initTags(entitlement: PortalEntitlement): Promise<void> {
    this.loadingTags = true;

    this.productTagsInitial = (await this.tagProvider.getTags(entitlement.UID_AccProduct.value))
      .Data.map(elem => elem.Ident_DialogTag.value);
    this.productTagsSelected = this.productTagsInitial.slice();

    this.loadingTags = false;
  }

  private async tryCommit(typedEntities: TypedEntity[]): Promise<boolean> {
    let success = false;

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());

    try {
      for (const typedEntity of typedEntities) {
        if (typedEntity) {
          await typedEntity.GetEntity().Commit(true);
        }
      }

      if (this.entitlement.UID_AccProduct.value !== '') {
        await this.saveTags();
        this.productTagsInitial = this.productTagsSelected.slice();
      }

      this.form.markAsPristine();

      success = true;
    } catch (error) {
      this.errorHandler.handleError(error);
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }

    return success;
  }

  private async saveTags(): Promise<void> {
    const changeSet = this.getTagsChangeSet();

    return this.tagProvider.updateTags(
      this.entitlement.UID_AccProduct.value,
      changeSet.add,
      changeSet.remove
    );
  }

  private getTagsChangeSet(): { add: string[], remove: string[] } {
    this.logger.trace(this, 'save tags initial', this.productTagsInitial);
    this.logger.trace(this, 'save tags selected', this.productTagsSelected);

    return {
      add: this.productTagsSelected.filter(elem => this.productTagsInitial.indexOf(elem) < 0),
      remove: this.productTagsInitial.filter(elem => this.productTagsSelected.indexOf(elem) < 0)
    };
  }
}
