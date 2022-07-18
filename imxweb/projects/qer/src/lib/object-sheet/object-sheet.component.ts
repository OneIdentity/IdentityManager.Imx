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
 * Copyright 2022 One Identity LLC.
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

import { Component, OnInit, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NGXLogger } from 'ngx-logger';

import { DbObjectKey } from 'imx-qbm-dbts';
import { ExtDirective } from 'qbm';
import { ObjectSheetService } from './object-sheet.service';

/** This is the host component for an object sheet for any kind of object */
@Component({
  templateUrl: './object-sheet.component.html',
  styleUrls: ['./object-sheet.component.scss'],
  selector: 'imx-object-sheet'
})
export class ObjectSheetComponent implements OnInit {
  @ViewChild(ExtDirective, { static: true }) public directive: ExtDirective;

  public objectKey: DbObjectKey;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    private readonly logger: NGXLogger,
    private readonly objectSheetService: ObjectSheetService) { }

  public ngOnInit(): void {
    // -- either take the object key request(\"objectkey\") or the table name + UID

    this.route.params.subscribe(params => {
      const objectKey = params.objectkey;
      if (objectKey == null) {
        const tableName = params.TableName;
        const uid = params.UID;
        this.objectKey = new DbObjectKey(tableName, uid.split(','));
      } else {
        this.objectKey = DbObjectKey.FromXml(objectKey);
      }

      // look up the object sheet component for this
      const selectedProvider = this.objectSheetService.getType(this.objectKey.TableName);
      this.logger.debug('Getting object sheet component for ' + this.objectKey.TableName);
      if (selectedProvider) {
        this.directive.viewContainerRef.clear();
        const instance = this.directive.viewContainerRef
          .createComponent(this.componentFactoryResolver.resolveComponentFactory(selectedProvider));
        instance.instance.objectKey = this.objectKey;
      }
    });
  }
}
