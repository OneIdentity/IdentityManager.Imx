import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {ClassloggerService, QbmModule, RouteGuardService} from 'qbm';
// import { IdentityComponent } from './identity/identity.component';
import { CccService } from './ccc.service';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import {ReactiveFormsModule} from '@angular/forms';

const routes: Routes = [
//   {
//     path: 'identity',
//     component: IdentityComponent,
//     canActivate: [RouteGuardService],
//     resolve: [RouteGuardService]
//   }
];

@NgModule({
  declarations: [
    // IdentityComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    TranslateModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    QbmModule
  ]
})
export class CccModule {
  constructor(
    private readonly initializer: CccService, private readonly logger: ClassloggerService) {
    this.logger.info(this, '🔥 CCC loaded');
    this.initializer.onInit(routes);
    this.logger.info(this, '▶️ CCC initialized');
  }
}
