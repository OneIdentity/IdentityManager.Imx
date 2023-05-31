import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {ClassloggerService, QbmModule} from 'qbm';
import { CccInitService } from './ccc-init.service';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import {ReactiveFormsModule} from '@angular/forms';

const routes: Routes = [
];

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    TranslateModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule
  ]
})
export class CccModule {
  constructor(
    private readonly initializer: CccInitService,
    private readonly logger: ClassloggerService
    ) {
    this.logger.info(this, '🔥 CCC loaded');
    this.initializer.onInit(routes);
    this.logger.info(this, '▶️ CCC initialized');
  }
}
