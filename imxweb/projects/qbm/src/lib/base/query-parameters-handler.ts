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

import { ActivatedRouteSnapshot, ParamMap, DefaultUrlSerializer } from '@angular/router';

export class QueryParametersHandler {
  public get path(): string { return this.lastPath || this.route?.routeConfig?.path; }

  private readonly urlSerializer = new DefaultUrlSerializer();
  private readonly queryParametersCollection: ParamMap[] = [];
  private readonly lastPath: string;

  constructor(search?: string, private readonly route?: ActivatedRouteSnapshot, lastUrl?: string) {
    if (lastUrl) {
      const lastLocation = lastUrl.split('?');

      if (lastLocation.length > 0) {
        this.lastPath = lastLocation[0];
        this.queryParametersCollection.push(this.urlSerializer.parse(lastUrl).queryParamMap);
      }
    } else if (search) {
      this.queryParametersCollection.push(this.urlSerializer.parse(search).queryParamMap);
    }

    if (route) {
      this.queryParametersCollection.push(route.queryParamMap);
    }
  }

  public GetQueryParameters(filter: (name: string) => boolean = null): { [key: string]: any } {
    const outparams: { [id: string]: any } = {};
    this.queryParametersCollection.forEach(params => {
      if (params.keys) {
        params.keys
          .filter(name => filter == null || filter(name))
          .forEach((name: string) => {
            outparams[name] = params.get(name);
          });
      }
    });
    return Object.keys(outparams).length > 0 ? outparams : undefined;
  }
}
