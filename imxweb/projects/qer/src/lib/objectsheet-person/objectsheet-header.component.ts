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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EuiLoadingService } from '@elemental-ui/core';

import { ObjectsheetPersonService } from './objectsheet-person.service';
import { IEntity } from 'imx-qbm-dbts';

@Component({
  selector: 'imx-objectsheet-header',
  templateUrl: './objectsheet-header.component.html',
  styleUrls: ['./objectsheet-header.component.scss']
})
export class ObjectsheetHeaderComponent implements OnInit {

  @Input() public caption: string;

  public person: IEntity;

  private uidPerson: string;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly busyService: EuiLoadingService,
    private readonly objectsheetPersonService: ObjectsheetPersonService,
  ) {
    this.uidPerson = this.route.snapshot.params.UID;
  }

  public async ngOnInit(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      this.person = (await this.objectsheetPersonService.getPerson(this.uidPerson)).GetEntity();
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }
}
