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

import { FormControl } from '@angular/forms';
import { PortalPersonMitigatingcontrols } from '@imx-modules/imx-api-cpl';
import { IWriteValue } from '@imx-modules/imx-qbm-dbts';
import { BaseCdr, ColumnDependentReference } from 'qbm';

/**
 * Class thats extends the {@link PortalPersonMitigatingcontrols} with some additional properties that are needed for
 * the components in the approval context.
 */
export class PersonMitigatingControls extends PortalPersonMitigatingcontrols {
  /**
   * The property list depending on the value of the state of a {@link PortalPersonMitigatingcontrols}.
   */
  public cdrs: ColumnDependentReference[];

  public formControl: FormControl<string> = new FormControl('', { nonNullable: true });

  public readonly isDeferredData = false;
  constructor(
    public editable: boolean,
    readonly baseObject: PortalPersonMitigatingcontrols,
  ) {
    super(baseObject.GetEntity());

    this.cdrs = this.initPropertyInfo();
  }

  public get uidMitigatingControl(): string {
    return this.baseObject.UID_MitigatingControl.value;
  }
  public set uidMitigatingControl(value: string) {
    this.baseObject.UID_MitigatingControl.value = value;
  }
  private initPropertyInfo(): ColumnDependentReference[] {
    const properties: IWriteValue<any>[] = [this.UID_MitigatingControl, this.IsInActive];

    return properties.map((property) => new BaseCdr(property.Column));
  }
}
