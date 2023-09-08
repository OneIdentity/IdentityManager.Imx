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

import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Injectable, Inject, InjectionToken } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';

import { MethodDescriptor, MethodDefinition } from 'imx-qbm-dbts';

export const BASE_URL = new InjectionToken<string>('BASE_URL');

/**
 * Processes HTTP requests using the Angular HttpClient and imx-api method descriptors
 */
@Injectable()
export class ApiClientAngularService {
  constructor(private http: HttpClient, @Inject(BASE_URL) private baseUrl: string = '') {}

  public processRequest<T>(methodDescriptor: MethodDescriptor<T>): Observable<T> {
    const method = new MethodDefinition(methodDescriptor);

    return this.http
      .request<T>(method.httpMethod, this.baseUrl + method.path, {
        withCredentials: method.credentials === 'include',
        observe: method.observe,
        responseType: method.responseType,
        headers: new HttpHeaders(method.headers),
        body: method.body
      })
      .pipe(mergeMap((response: HttpResponse<T>) => of(response.body)));
  }
}
