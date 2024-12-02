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

import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

import { PortalTermsofuse } from '@imx-modules/imx-api-qer';

import { TermsOfUseItem } from './terms-of-use-item';
import { TermsOfUseService } from './terms-of-use.service';

/**
 * A component for viewing and accepting all {@link PortalTermsofuse|terms of use} related
 * to a given list of {@link PortalTermsofuse} items.
 */
@Component({
  selector: 'imx-terms-of-use-list',
  templateUrl: './terms-of-use-list.component.html',
  styleUrls: ['./terms-of-use-list.component.scss'],
})
export class TermsOfUseListComponent {
  /** The list of terms of use {@link items|PortalTermsofuse} to show. */
  @Input() public termsOfUseItems: PortalTermsofuse[];

  /** The {@link items|TermsOfUseItem} for determining the list of associated products. */
  @Input() public productItems: TermsOfUseItem[];

  /** The {@link FormGroup} for the list of terms of use. */
  @Input() public formGroup: UntypedFormGroup;

  @Input() public itemsHeading: string;

  public isLoading: boolean = false;

  constructor(protected readonly termsOfUseService: TermsOfUseService) {}

  /**
   * Gets the {@link TermsOfUseItem|TermsOfUseItem} for the given UID_QERTermsOfUse.
   */
  protected getProducts(key: string): TermsOfUseItem[] {
    return this.productItems.filter((product) => product?.UID_QERTermsOfUse?.value === key);
  }
}
