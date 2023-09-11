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

import { Component, Inject } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { PersonForProduct, ShelfObject, ShelfSelectionObject } from './shelf-selection-sidesheet.model';

@Component({
  selector: 'imx-shelf-selection',
  templateUrl: './shelf-selection.component.html',
  styleUrls: ['./shelf-selection.component.scss']
})
export class ShelfSelectionComponent {

  public showHelperAlert = true;


  public shelfSelectionObjects: ShelfSelectionObject[] = [];
  public formGroup: UntypedFormGroup;

  public shelfObjects: ShelfObject[];

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: ShelfSelectionObject[],
    public readonly sideSheetRef: EuiSidesheetRef) {
    this.setup();
  }

  public optionSelected(uidItShopOrg: string, uidAccproduct: string): void {
    const group = this.formGroup.get(uidAccproduct) as UntypedFormGroup;
    const persons = this.shelfSelectionObjects.find(elem => elem.uidAccproduct === uidAccproduct);
    persons.personsForProduct.forEach(person => {
      const control = group.get(person.uidPerson);
      if (control?.value === '' && person.shelfsObjects.some(shelf => shelf.uidItShopOrg === uidItShopOrg)) {
        control.setValue(uidItShopOrg);
      }
    });
    this.formGroup.markAsDirty();
    this.formGroup.updateValueAndValidity();
  }

  public onHelperDismissed(): void {
    this.showHelperAlert = false;
  }

  public needsDefaultShelf(product: ShelfSelectionObject): boolean {
    return product.personsForProduct.filter(person => person.shelfsObjects.length > 1).length > 1;
  }


  public getFormControl(shelfSelectionObject: ShelfSelectionObject, personForProduct: PersonForProduct): UntypedFormControl {
    return (this.formGroup.get(shelfSelectionObject.uidAccproduct) as UntypedFormGroup).get(personForProduct.uidPerson) as UntypedFormControl;
  }

  public submit(): void {
    this.shelfSelectionObjects.forEach(product => {
      product.personsForProduct.filter(elem => elem.shelfsObjects.length > 1).forEach(person => {
        const control = this.getFormControl(product, person);
        person.uidItShopOrg = control.value;
      }
      );
    });
    this.sideSheetRef.close(this.shelfSelectionObjects);
  }

  private setup(): void {
    this.shelfSelectionObjects = this.data;

    this.formGroup = new UntypedFormGroup({});
    this.shelfSelectionObjects.forEach(element => {
      const personGroup = new UntypedFormGroup({});
      element.personsForProduct.filter(elem => elem.shelfsObjects.length > 1).forEach(person =>
        personGroup.addControl(person.uidPerson, new UntypedFormControl(person.uidItShopOrg, Validators.required))
      );
      this.formGroup.addControl(element.uidAccproduct, personGroup);
    });
  }


}
