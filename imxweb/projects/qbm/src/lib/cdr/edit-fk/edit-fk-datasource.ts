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
 * Copyright 2021 One Identity LLC.
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

import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';

import { CollectionLoadParameters, IForeignKeyInfo } from 'imx-qbm-dbts';
import { Candidate } from '../../fk-advanced-picker/candidate.interface';
import { ClassloggerService } from '../../classlogger/classlogger.service';
import { Injectable } from '@angular/core';

export class EditFkDatasource extends DataSource<Candidate> {
  public loading: Subject<boolean> = new Subject<boolean>();

  private pageSize = 20;
  private cachedData: Candidate[] = [];
  private dataStream = new BehaviorSubject<Candidate[]>(this.cachedData);
  private subscription = new Subscription();
  private params: CollectionLoadParameters = {};

  constructor(
    private readonly logger: ClassloggerService,
    private readonly selectedTable: IForeignKeyInfo,
    private readonly fkRelations: readonly IForeignKeyInfo[]
  ) {
    super();
  }

  public connect(collectionViewer: CollectionViewer): Observable<Candidate[] | readonly Candidate[]> {
    console.log('*** Connected ***');
    this.params = {
      PageSize: this.pageSize,
      StartIndex: 0
    };
    this.fetchPage();

    this.subscription.add(collectionViewer.viewChange.subscribe(async range => {
      if (range.end === (this.pageSize + this.params.StartIndex)) {
        this.params.StartIndex = this.params.StartIndex + this.pageSize;
        await this.fetchPage();
      }

    }));
    return this.dataStream;
  }

  public disconnect(): void {
    console.log('*** Disconnected ***');
    this.subscription.unsubscribe();
  }

  public updateSearchParams(params: CollectionLoadParameters): void {
    this.params.filter = params.filter;
    this.params.search = params.search;
    this.cachedData = [];
  }

  public async fetchPage(): Promise<void> {
    this.loading.next(true);

    try {
      this.logger.debug(this, `Gettting chunk with params ${this.params}`);
      const candidateCollection = await this.selectedTable.Get(this.params);

      const multipleFkRelations = this.fkRelations && this.fkRelations.length > 1;
      const identityRelatedTable = this.selectedTable.TableName === 'Person';

      const tempCache = candidateCollection.Entities.map(entityData => {
        let key: string = null;
        let detailValue: string = entityData.LongDisplay;
        const defaultEmailColumn = entityData.Columns.DefaultEmailAddress;
        /**
         * If the candidates data relate to identities (fkRelation Person table)
         * then we want to use the email address for the detail line (displayLong)
         */
        if (defaultEmailColumn && identityRelatedTable) {
          detailValue = defaultEmailColumn.Value;
        }
        if (multipleFkRelations) {
          this.logger.trace(this, 'dynamic foreign key');
          const xObjectKeyColumn = entityData.Columns.XObjectKey;
          key = xObjectKeyColumn ? xObjectKeyColumn.Value : undefined;
        } else {
          this.logger.trace(this, 'foreign key');
          const parentColumn = entityData.Columns ? entityData.Columns[this.fkRelations[0].ColumnName] : undefined;
          if (parentColumn != null) {
            this.logger.trace(this, 'Use value from explicit parent column');
            key = parentColumn.Value;
          } else {
            const keys = entityData.Keys;
            key = keys && keys.length ? keys[0] : undefined;
          }
        }
        return {
          DataValue: key,
          DisplayValue: entityData.Display,
          displayLong: detailValue
          // displayLong: (this.params.StartIndex / this.pageSize).toString()
        };
      });

      this.cachedData = this.cachedData.concat(tempCache);
      this.dataStream.next(this.cachedData);
    } finally {
      this.loading.next(false);
    }
  }
}
