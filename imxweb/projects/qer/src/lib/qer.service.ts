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

import { TwoFactorAuthenticationService, ExtService, MenuService } from 'qbm';

import { ObjectOverviewPersonComponent } from './ops/objectOverviewPerson.component';
import { ObjectsheetPersonComponent } from './objectsheet-person/objectsheet-person.component';
import { ShoppingCartValidationDetailService } from './shopping-cart-validation-detail/shopping-cart-validation-detail.service';
import { ExclusionCheckComponent } from './shopping-cart-validation-detail/exclusion-check/exclusion-check.component';
import { DuplicateCheckComponent } from './shopping-cart-validation-detail/duplicate-check/duplicate-check.component';
// tslint:disable-next-line: max-line-length
import { ProductDependencyCheckComponent } from './shopping-cart-validation-detail/product-dependency-check/product-dependency-check.component';
import { ObjectSheetService } from './object-sheet/object-sheet.service';

@Injectable({
  providedIn: 'root'
})
export class QerService {
  constructor(
    private authService: TwoFactorAuthenticationService,
    private extService: ExtService,
    private objectsheetService: ObjectSheetService,
    private readonly validationDetailService: ShoppingCartValidationDetailService,
    private readonly menuService: MenuService
  ) { }

  public init(): void {

    this.extService.register('QBM_ops_ObjectOverview_Actions', { instance: ObjectOverviewPersonComponent });

    this.objectsheetService.register('Person', ObjectsheetPersonComponent);

    this.validationDetailService.register(ExclusionCheckComponent, 'ExclusionCheck');
    this.validationDetailService.register(DuplicateCheckComponent, 'DuplicateCheck');
    this.validationDetailService.register(ProductDependencyCheckComponent, 'ProductDependencyCheck');
    this.setupMenu();
  }

  /** This method defines the menu structure for the portal. */
  private setupMenu(): void {
    // this.menuService.addMenuFactories(
    //   //TODO later #206706
    //   (preProps: string[], __: string[]) => {
    //     if (!preProps.includes('ITSHOP')) {
    //       return null;
    //     }

    //     return {
    //       id: 'ROOT_RelatedApplications',
    //       title: '#LDS#Related applications',
    //       sorting: '100',
    //       // TODO (TFS number 805756): get from API; has a tree structure
    //       items: [].map(relatedApplication => new RelatedApplicationMenuItem(relatedApplication))
    //     };
    //   }
    // );
  }
}
