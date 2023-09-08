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

import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { EuiDownloadOptions } from '@elemental-ui/core';

import { PortalTermsofuse } from 'imx-api-qer';
import { TermsOfUseItem } from './terms-of-use-item';

import { TermsOfUseService } from './terms-of-use.service';

/**
 * A component for viewing and accepting all {@link PortalTermsofuse|terms of use} related
 * to a given list of {@link TermsOfUseItem|TermsOfUseItem}.
 */
@Component({
  selector: 'imx-terms-of-use-list',
  templateUrl: './terms-of-use-list.component.html',
  styleUrls: ['./terms-of-use-list.component.scss'],
})
export class TermsOfUseListComponent implements OnInit {
  /** The {@link items|TermsOfUseItem} for determining the list of {@link PortalTermsofuse|terms of use}. */
  @Input() public items: TermsOfUseItem[];

  /** The {@link FormGroup} for the list of terms of use. */
  @Input() public formGroup: UntypedFormGroup;

  @Input() public itemsHeading: string;

  public isLoading: boolean = false;

  /** The list of {@link PortalTermsofuse|terms of use} which have been determined by the {@link TermsOfUseItem|TermsOfUseItem}. */
  public termsOfUse: PortalTermsofuse[] = [];

  constructor(private readonly termsOfUseService: TermsOfUseService) {}

  public async ngOnInit(): Promise<void> {
    // get the distinct terms-of-use identifiers
    this.isLoading = true;
    try {
      const termsOfUseUids = Array.from(new Set(this.items.map((c) => c.UID_QERTermsOfUse.value)));
      this.termsOfUse = await this.termsOfUseService.getTermsOfUse(termsOfUseUids);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Gets the {@link TermsOfUseItem|TermsOfUseItem} for the given comma-separated list of UIDs.
   */
  public getTermsOfUseItems(uidTermsOfUse: string): TermsOfUseItem[] {
    return this.items.filter((x) => x.UID_QERTermsOfUse.value === uidTermsOfUse);
  }

  /**
   * Gets the {@link EuiDownloadOptions|download options} for the given uid.
   */
  public getDownloadOptions(key: string, display: string): EuiDownloadOptions {
    return this.termsOfUseService.getDownloadOptions(key, display);
  }
}
