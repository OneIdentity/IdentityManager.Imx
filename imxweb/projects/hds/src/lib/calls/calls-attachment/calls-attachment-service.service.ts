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

import { ErrorHandler, Injectable } from '@angular/core';
import { HelpdeskConfig, StoredDirectoryInfo } from 'imx-api-hds';
import { Subject } from 'rxjs';
import { HdsApiService } from '../../hds-api-client.service';
import { CallsAttachmentNode, CallsAttachmentType } from './calls-attachment.model';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class CallsAttachmentServiceService {
  constructor(private readonly hdsApiService: HdsApiService, private readonly errorHandler: ErrorHandler, private readonly translator: TranslateService) {}

  public async getInitialData(callId: string): Promise<CallsAttachmentNode> {
    let initalFormatData: CallsAttachmentNode = {
      name: 'Attachments',
      path: '',
      level: 0,
      isSelected: false,
      type: CallsAttachmentType.folder,
    };
    let initialData = await this.hdsApiService.client.portal_calls_attachments_directory_get(callId);
    initalFormatData.children = this.formatData(initialData, 1, initalFormatData);
    return initalFormatData;
  }

  public async getFilesOfDirectory(callId: string, parent: CallsAttachmentNode): Promise<CallsAttachmentNode[]> {
    let data = await this.hdsApiService.client.portal_calls_attachments_directory_bypath_get(callId, parent.path);
    let formatData = this.formatData(data, parent.level + 1, parent);
    return formatData;
  }

  public getCallsConfig(): Promise<HelpdeskConfig> {
    return this.hdsApiService.client.portal_calls_configuration_get();
  }

  public createDirectory(callId: string, path: string): Promise<void> {
    return this.hdsApiService.client.portal_calls_attachments_directory_bypath_post(callId, path);
  }

  public deleteDirectory(callId: string, path: string): Promise<void> {
    return this.hdsApiService.client.portal_calls_attachments_directory_bypath_delete(callId, path);
  }

  public deleteFile(callId: string, path: string): Promise<void> {
    return this.hdsApiService.client.portal_calls_attachments_file_delete(callId, path);
  }

  public uploadFile(callId: string, path: string, file: Blob): Promise<void> {
    return this.hdsApiService.client.portal_calls_attachments_file_post(callId, path, file);

  }

  public formatData(obj: StoredDirectoryInfo, level: number, parent?: CallsAttachmentNode): CallsAttachmentNode[] {
    let formattedData: CallsAttachmentNode[] = [];
    obj.Directories.map((item) => {
      formattedData.push({
        name: item.Name,
        children: [],
        type: CallsAttachmentType.folder,
        path: !!parent && !!parent.path ? `${parent.path}/${item.Name}` : item.Name,
        level: level,
        isSelected: false,
        parent: parent,
      });
    });
    obj.Files.map((item) => {
      formattedData.push({
        name: item.Name,
        type: CallsAttachmentType.file,
        path: !!parent && !!parent.path ? `${parent.path}/${item.Name}` : item.Name,
        level: level,
        isSelected: false,
        parent: parent,
      });
    });
    return formattedData;
  }
}
