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

import { ErrorHandler } from '@angular/core';

import { EntityValue, EntityData, CollectionLoadParameters, EntityCollectionData } from 'imx-qbm-dbts';

export class FkContainer {
  public property: EntityValue<string>;
  public candidateCollection: EntityCollectionData;
  public value: EntityData;

  constructor(private getProperty: () => EntityValue<string>) { }

  public async init(errorHandler: ErrorHandler, parameters?: CollectionLoadParameters): Promise<void> {
    this.property = this.getProperty();

    this.candidateCollection = await this.getCandidateCollection(this.property, errorHandler, parameters);

    if (this.property.value) {
      if (this.candidateCollection) {
        this.value = this.candidateCollection.Entities.find(candidate => this.getEntityKey(candidate) === this.property.value);
      }

      if (this.value == null) {
        this.value = {
          Display: this.property.Column.GetDisplayValue(),
          Keys: [this.property.value]
        };
      }
    } else {
      this.value = null;
    }
  }

  public setKey(value: EntityData): void {
    this.property.value = this.getEntityKey(value);
  }

  protected getEntityKey(data: EntityData): string {
    return data && data.Keys && data.Keys.length > 0 ? data.Keys[0] : undefined;
  }

  private async getCandidateCollection<TValue>(
    property: EntityValue<TValue>,
    errorHandler: ErrorHandler,
    parameters?: CollectionLoadParameters): Promise<EntityCollectionData> {
    const fkRelations = property.GetMetadata().GetFkRelations();

    if (fkRelations) {
      for (const fk of fkRelations) {
        try {
          const candidate = await fk.Get(parameters);
          if (candidate) {
            return candidate;
          }
        } catch (error) {
          errorHandler.handleError(error);
        }
      }
    }

    return undefined;
  }
}
