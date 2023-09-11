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

import { FormControl } from '@angular/forms';

import { DeferredOperationMControlData, PortalPersonMitigatingcontrols } from 'imx-api-cpl';
import { ValType } from 'imx-qbm-dbts';
import { BaseReadonlyCdr, ColumnDependentReference, EntityService } from 'qbm';
import { MitigatingControlData } from './mitigating-control-data.interface';

export class ExtendedDeferredOperationsData implements MitigatingControlData {
  public formControl = new FormControl<string | undefined>(undefined);
  public cdrs: ColumnDependentReference[];
  public isDeferredData = true;
  public editable: boolean = false;
  public get uidMitigatingControl() {
    return this.deferred.Uid;
  }
  public get displayMitigatingControls() {
    return this.deferred.Display;
  }

  public isInActive = true;

  public data = undefined;

  constructor(private readonly deferred: DeferredOperationMControlData, entiyService: EntityService) {
    const schema = PortalPersonMitigatingcontrols.GetEntitySchema();
    this.cdrs = [
      new BaseReadonlyCdr(
        entiyService.createLocalEntityColumn(
          {
            ColumnName: 'UID_MitigatingControl',
            Type: ValType.String,
          },
          undefined,
          {
            Value: deferred.Uid,
            DisplayValue: deferred.Display,
          }
        ),
        '#LDS#Mitigating control'
      ),
      new BaseReadonlyCdr(
        entiyService.createLocalEntityColumn(
          {
            ColumnName: 'IsInActive',
            Type: ValType.Bool,
          },
          undefined,
          {
            Value: true,
            DisplayValue: '#LDS#Yes',
          }
        ),
        '#LDS#Inactive'
      ),
    ];
  }
}
