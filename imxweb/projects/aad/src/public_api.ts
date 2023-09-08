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

/*
 * Public API Surface of cpl
 */

export { AadConfigModule } from './lib/aad-config.module';
export { ApiService } from './lib/api.service';
export { AadPermissionsService } from './lib/admin/aad-permissions.service';
export { AadUserSubscriptionsComponent } from './lib/azure-ad/aad-user/aad-user-subscriptions.component';
export { AadUserDeniedPlansComponent } from './lib/azure-ad/aad-user/aad-user-denied-plans.component';
export { AadGroupSubscriptionsComponent } from './lib/azure-ad/aad-group/aad-group-subscriptions.component';
export { AadGroupDeniedPlansComponent } from './lib/azure-ad/aad-group/aad-group-denied-plans.component';
export { AzureAdModule } from './lib/azure-ad/azure-ad.module';
export { LicenceOverviewButtonComponent} from './lib/aad-extension/licence-overview-button/licence-overview-button.component'
