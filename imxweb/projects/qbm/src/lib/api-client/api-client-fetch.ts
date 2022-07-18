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

import { MethodDefinition, MethodDescriptor, ApiClient } from 'imx-qbm-dbts';
import { ServerExceptionError } from '../base/server-exception-error';
import { ServerError } from '../base/server-error';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { TranslateService } from '@ngx-translate/core';

export class ApiClientFetch implements ApiClient {
    constructor(
        private readonly baseUrl: string = '',
        private readonly logger: ClassloggerService,
        private readonly translation: TranslateService,
        private readonly http: { fetch(input: RequestInfo, init?: RequestInit): Promise<Response> } = window) {
    }

    public async processRequest<T>(methodDescriptor: MethodDescriptor<T>): Promise<T> {
        const method = new MethodDefinition(methodDescriptor);
        const headers = new Headers(method.headers);

        this.addXsrfProtectionHeader<T>(headers, method);

        var response: Response;
        try {
            response = await this.http.fetch(this.baseUrl + method.path, {
                method: method.httpMethod,
                credentials: method.credentials,
                headers: headers,
                body: method.body
            });
        } catch (e) {
            throw new ServerError(await this.GetUnexpectedErrorText());
        }

        if (response) {

            // empty response, but success
            if (response.status === 204) {
                return null;
            }

            const actualContentType = response.headers.get('Content-Type');

            function getFirstContentType() { return actualContentType.split(';')[0]; }

            if (response.status === 200) {
                if (method.responseType === 'blob')
                    return <any>response.blob();

                if (actualContentType && 'application/json' != getFirstContentType()) {
                    throw new Error(this.append(await this.GetError(), response.statusText));
                }

                return response.json();
            }

            if (actualContentType && 'application/json' != getFirstContentType()) {
                throw new Error(this.append(await this.GetError(), response.statusText));
            }

            throw new ServerExceptionError(await response.json());
        }

        throw new ServerError(await this.GetUnexpectedErrorText());
    }

    private append(input: string, statusText: string): string {
        if (statusText)
            return input + " (" + statusText + ")";
        return input;
    }

    private async GetError(): Promise<string> {
        return await this.translation.get('#LDS#The server returned an unexpected data type.').toPromise();
    }

    private async GetUnexpectedErrorText(): Promise<string> {
        return await this.translation.get('#LDS#An unexpected server error occurred.').toPromise();
    }

    private addXsrfProtectionHeader<T>(headers: Headers, method: MethodDefinition<T>) {
        // Sending XSRF-TOKEN as an additional header, if:
        // - there is one
        // - the request is not a GET or HEAD request (which does not require XSRF protection)

        if (document.cookie && !["GET", "HEAD"].includes(method.httpMethod.toUpperCase())) {
            const token = this.getCookie("XSRF-TOKEN");
            if (token) {
                headers.set("X-XSRF-TOKEN", token);
            }
        }
    }

    private getCookie(name) {
        function escape(s) { return s.replace(/([.*+?\^$(){}|\[\]\/\\])/g, '\\$1'); }
        var match = document.cookie.match(RegExp('(?:^|;\\s*)' + escape(name) + '=([^;]*)'));
        return match ? match[1] : null;
    }
}
