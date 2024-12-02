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

import { CommonModule } from '@angular/common';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { TranslateModule } from '@ngx-translate/core';
import { AboutService, LdsReplaceModule, MetadataService, QbmModule } from 'qbm';
import { PasswordModule } from '../password/password.module';
import { OpsAboutService } from './about/ops-about.service';
import { OpsMetadataService } from './metadata/ops-metadata.service';
import { ObjectOverviewPersonComponent } from './objectOverviewPerson.component';
import { OpsService } from './ops.service';
import { PasscodeViewerComponent } from './passcodeViewer.component';

export function initService(service: OpsService): () => Promise<any> {
  return () =>
    new Promise<any>(async (resolve: any) => {
      if (service) {
        service.init();
      }
      resolve();
    });
}

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initService,
      deps: [OpsService],
      multi: true,
    },
    {
      provide: AboutService,
      useClass: OpsAboutService,
    },
    {
      provide: MetadataService,
      useClass: OpsMetadataService,
    },
  ],
  declarations: [PasscodeViewerComponent, ObjectOverviewPersonComponent],
  imports: [CommonModule, TranslateModule, QbmModule, LdsReplaceModule, PasswordModule, MatButtonModule, MatDialogModule],
  exports: [ObjectOverviewPersonComponent],
})
export class OpsModule {}
