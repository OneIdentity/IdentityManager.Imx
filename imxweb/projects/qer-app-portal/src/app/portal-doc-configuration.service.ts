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

import { Injectable } from "@angular/core";
import { DocDocument, DocChapterService } from "qbm";

@Injectable({
  providedIn: 'root'
})
export class PortalDocConfigurationService {

  constructor(private readonly docSvc: DocChapterService) { }

  setupPaths() {
    // Web Portal User Guide
    var portalDoc: DocDocument = {
      paths: {
        "en-US": "imx/doc/OneIM_QER_WebPortal_en-us.html5/OneIM_QER_WebPortal.html",
        "de-DE": "imx/doc/OneIM_QER_WebPortal_de-de.html5/OneIM_QER_WebPortal.html",
        "de-CH": "imx/doc/OneIM_QER_WebPortal_de-de.html5/OneIM_QER_WebPortal.html",
        "de-AT": "imx/doc/OneIM_QER_WebPortal_de-de.html5/OneIM_QER_WebPortal.html"
      }
    };

    // Declare the route/chapter mapping. Extend this section as new routes get added.
    this.docSvc.chapters["addressbook"] = {
      chapterUid: "443F4A50-2D9E-4886-9805-E780645F2B3B",
      document: portalDoc
    };
  }
}