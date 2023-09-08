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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EuiCoreModule } from '@elemental-ui/core';

import { TileModule } from 'qbm';
import { NotificationTileComponent } from './notification-tile/notification-tile.component';
import { IconTileComponent } from './icon-tile/icon-tile.component';
import { BadgeTileComponent } from './badge-tile/badge-tile.component';


@NgModule({
  declarations: [
    NotificationTileComponent,
    BadgeTileComponent,
    IconTileComponent
  ],
  imports: [
    CommonModule,
    TileModule,
    TranslateModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
    EuiCoreModule
  ],
  exports: [
    NotificationTileComponent,
    BadgeTileComponent,
    IconTileComponent
  ]

})
export class TilesModule { }
