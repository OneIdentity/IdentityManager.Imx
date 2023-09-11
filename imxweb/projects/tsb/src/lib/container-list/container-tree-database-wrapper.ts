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

import { CollectionLoadParameters, IEntity } from 'imx-qbm-dbts';
import { BusyService, EntityTreeDatabase } from 'qbm';
import { DeHelperService } from '../de-helper.service';

export class ContainerTreeDatabaseWrapper {

  public get targetSystemFilterValue(): string {
    return this.system;
  }

  public set targetSystemFilterValue(value: string) {
    this.system = value;
    this.entityTreeDatabase = new EntityTreeDatabase(
      parameters => this.getEntities(parameters, value),
      this.busyService
    );
  }

  public selectionEnabled = false;

  public entityTreeDatabase: EntityTreeDatabase;

  private system: string;

  constructor(
    private readonly busyService: BusyService,
    private readonly dataHelper: DeHelperService
  ) {
    this.entityTreeDatabase = new EntityTreeDatabase(
      parameters => this.getEntities(parameters),
      this.busyService
    );
  }

  private async getEntities(parameters: CollectionLoadParameters = {}, system: string = ''): Promise<IEntity[]> {
    const navigationState: any = { PageSize: 1000, StartIndex: 0, ParentKey: '' };
    if (parameters.ParentKey) {
      navigationState.ParentKey = parameters.ParentKey;
    }
    if (system) {
      navigationState.system = system;
    }
    const containerData = await this.dataHelper.getContainers(navigationState);
    return containerData.Data.map(element => element.GetEntity());
  }
}
