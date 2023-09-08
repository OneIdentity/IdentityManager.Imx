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
import { IReadValue, TypedEntity } from 'imx-qbm-dbts';

export class OutstandingObjectEntity extends TypedEntity {

  public readonly ObjectType: IReadValue<string> = this.GetEntityValue('ObjectType');
  public readonly ObjectKey: IReadValue<string> = this.GetEntityValue('ObjectKey');
  public readonly Display: IReadValue<string> = this.GetEntityValue('Display');
  public readonly CanPublish: IReadValue<boolean> = this.GetEntityValue('CanPublish');
  public readonly CanDelete: IReadValue<boolean> = this.GetEntityValue('CanDelete');
  public readonly CanDeleteRestrictionReason: IReadValue<string> = this.GetEntityValue("CanDeleteRestrictionReason");
  public readonly CanPublishRestrictionReason: IReadValue<string> = this.GetEntityValue("CanPublishRestrictionReason");

}
