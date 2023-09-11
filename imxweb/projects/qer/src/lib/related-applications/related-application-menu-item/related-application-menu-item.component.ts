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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RelatedApplicationsService } from '../related-applications.service';

@Component({
  selector: 'imx-related-application-menu-item',
  templateUrl: './related-application-menu-item.component.html',
  styleUrls: ['./related-application-menu-item.component.scss']
})
export class RelatedApplicationMenuItemComponent implements OnInit{
  showButton = false;

  constructor(
    private readonly router: Router,
    private readonly relatedApplicationsService: RelatedApplicationsService
  ) { }

    async ngOnInit(): Promise<void>{
      const applcications = await this.relatedApplicationsService.getRelatedApplications()
      this.showButton = applcications?.length > 0;
    }

  public onNavigateToApplications():void{
    this.router.navigate(['applications/relatedapplications']);
  }

}
