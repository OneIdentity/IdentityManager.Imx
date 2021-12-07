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

import { Injectable } from '@angular/core';

import { EntityCollectionData, EntityWriteData, MethodDescriptor, TimeZoneInfo } from 'imx-qbm-dbts';
import { DynamicCollectionLoadParameters } from './dynamic-collection-load-parameters.interface';

@Injectable({
  providedIn: 'root'
})
export class MethodDescriptorService {
  public get(path: string, parameters: DynamicCollectionLoadParameters = {}): MethodDescriptor<EntityCollectionData> {
    return {
      path,
      parameters: [
        {
          name: 'OrderBy',
          value: parameters.OrderBy,
          in: 'query'
        },
        {
          name: 'StartIndex',
          value: parameters.StartIndex,
          in: 'query'
        },
        {
          name: 'PageSize',
          value: parameters.PageSize,
          in: 'query'
        },
        {
          name: 'filter',
          value: parameters.filter,
          in: 'query'
        },
        {
          name: 'withProperties',
          value: parameters.withProperties,
          in: 'query'
        },
        {
          name: 'search',
          value: parameters.search,
          in: 'query'
        }
      ],
      method: 'GET',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json'
    };
  }

  /** Builds a method descriptor for a PUT  method. */
  public put(path: string, inputParameterName: EntityWriteData): MethodDescriptor<EntityCollectionData> {
    return this.putorpost('PUT', path, inputParameterName);
  }

  /** Builds a method descriptor for a POST method. */
  public post(path: string, inputParameterName: EntityWriteData): MethodDescriptor<EntityCollectionData> {
    return this.putorpost('POST', path, inputParameterName);
  }

  private putorpost(method: 'PUT' | 'POST', path: string, inputParameterName: EntityWriteData): MethodDescriptor<EntityCollectionData> {
    return {
      path,
      parameters: [
        {
          name: 'inputParameterName',
          value: inputParameterName,
          in: 'body'
        },
      ],
      method: method,
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json'
    };
  }

  public delete(path: string, pathParameters: { [name: string]: any }): MethodDescriptor<any> {
    const parameters = [];

    Object.keys(pathParameters).forEach(name =>
      parameters.push({
        name,
        value: pathParameters[name],
        in: 'path',
        required: true
      })
    );

    return {
      path,
      parameters,
      method: 'DELETE',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json'
    };
  }
}
