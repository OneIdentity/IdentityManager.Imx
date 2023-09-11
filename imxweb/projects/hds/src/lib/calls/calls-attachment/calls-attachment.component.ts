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

import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { Component, ErrorHandler, Injector, Input, OnInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { EuiDownloadDirective } from '@elemental-ui/core';
import { MatDialog } from '@angular/material/dialog';
import { HelpdeskConfig, V2ApiClientMethodFactory } from 'imx-api-hds';
import { MethodDefinition } from 'imx-qbm-dbts';
import {
  AppConfigService,
  DataSourceToolbarSettings,
  DynamicDataApiControls,
  DynamicDataSource,
  ElementalUiConfigService,
  LdsReplacePipe,
} from 'qbm';
import { HttpClient } from '@angular/common/http';
import { CallsAttachmentActionType, CallsAttachmentNode, CallsAttachmentType } from './calls-attachment.model';
import { CallsAttachmentServiceService } from './calls-attachment-service.service';
import { CallsAttachmentDialogComponent } from './calls-attachment-dialog/calls-attachment-dialog.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'imx-calls-attachment',
  templateUrl: './calls-attachment.component.html',
  styleUrls: ['./calls-attachment.component.scss'],
})
export class CallsAttachmentComponent implements OnInit {
  @Input() public callId: string = '';
  // Set FlatTreeControl node order and node expendable
  public treeControl = new FlatTreeControl<CallsAttachmentNode>(
    (node) => node.level,
    (node) => node.type === CallsAttachmentType.folder
  );
  public attachmentTreeData: CallsAttachmentNode = null;
  public selectedNode: CallsAttachmentNode | null = null;
  public showAlert = false;
  public overlayRef: OverlayRef;
  public alertText = '';
  public apiControls: DynamicDataApiControls<CallsAttachmentNode>;
  public dynamicDataSource: DynamicDataSource<CallsAttachmentNode>;
  public loadingOverlay = false;

  public callsConfig: HelpdeskConfig;
  public hasMaxAttachmentSize: boolean;
  public convertedMaxAttachmentSize: string;
  public noResultText = '#LDS#There are no attachments.'
  public initialized: boolean;

  constructor(
    private attachmentService: CallsAttachmentServiceService,
    private readonly dialog: MatDialog,
    private readonly config: AppConfigService,
    // File download directive needs HttpClient, Injector, Overlay, ElementalUiConfigService
    private readonly http: HttpClient,
    private readonly injector: Injector,
    private readonly overlay: Overlay,
    private readonly elementalUiConfigService: ElementalUiConfigService,
    private readonly translator: TranslateService,
    private readonly errorHandler: ErrorHandler,
    private readonly ldsReplace: LdsReplacePipe
  ) {}

  // Setup apiControls and dynamicDataSource and get initial attachment tree data
  async ngOnInit(): Promise<void> {
    this.apiControls = {
      setup: async (): Promise<{ rootNode: CallsAttachmentNode; dstSettings?: DataSourceToolbarSettings; totalCount?: number }> => {
        try {
          const rootNode = await this.attachmentService.getInitialData(this.callId);
          this.attachmentTreeData = rootNode;
          this.initialized = true;
          return { rootNode };
        } catch {
          this.initialized = false;
          throw new Error(this.translator.instant('#LDS#The attachments folder could not be found.'));
        }
      },
      getChildren: async (node: CallsAttachmentNode, onlyCheck: boolean = true): Promise<CallsAttachmentNode[]> => {
        try {
          if (node.children && (node.children.length > 0) && onlyCheck) {
            return node.children;
          }
          node.isLoading = true;
          node.children = await this.attachmentService.getFilesOfDirectory(this.callId, node);
        } finally {
          node.isLoading = false;
        }
        return node.children;
      },
      changeSelection: (data): CallsAttachmentNode[] => data,
    };
    this.dynamicDataSource = new DynamicDataSource<CallsAttachmentNode>(this.treeControl, this.apiControls);
    this.callsConfig = await this.attachmentService.getCallsConfig();
    this.hasMaxAttachmentSize = this.callsConfig.AttachmentMaxSize > 0;
    if (this.hasMaxAttachmentSize) this.convertedMaxAttachmentSize = await this.byteConverter(this.callsConfig.AttachmentMaxSize);

    try {
      this.changeLoadingOverlayStatus(true);
      await this.dynamicDataSource.setup(true);
    } finally {
      this.changeLoadingOverlayStatus(false);
    }
  }

  // Open attachment dialog and call createFolder action
  public async onAddFolder(node: CallsAttachmentNode) {
    this.dialog
      .open(CallsAttachmentDialogComponent, {
        data: {
          actionType: CallsAttachmentActionType.addFolder,
          itemInfo: node && node?.path.length ? node.path : await this.translator.get('#LDS#Root folder').toPromise(),
        },
      })
      .afterClosed()
      .subscribe((dialogResult) => {
        if (!!dialogResult && !!dialogResult.action && !!dialogResult.value) {
          this.createFolder(dialogResult.value, node);
        }
      });
  }

  public onDeleteItem(node: CallsAttachmentNode) {
    if (node.type === CallsAttachmentType.file) {
      this.openDeleteFileDialog(node);
    } else {
      this.openDeleteFolderDialog(node);
    }
  }

  // Open attachment dialog and call deleteFile action
  public openDeleteFileDialog(node: CallsAttachmentNode): void {
    this.dialog
      .open(CallsAttachmentDialogComponent, {
        data: {
          actionType: CallsAttachmentActionType.deleteFile,
          itemInfo: node.name,
        },
      })
      .afterClosed()
      .subscribe((dialogResult) => {
        if (!!dialogResult?.action) {
          this.deleteFile(node);
        }
      });
  }

  /**
   * Check the selected folder has any child elements.
   * If it is empty open confirmation dialog and call deleteFolder action
   * @param node Selected node
   */
  public async openDeleteFolderDialog(node: CallsAttachmentNode): Promise<void> {
    if(!node.children || node.children.length == 0){
      const children = await this.attachmentService.getFilesOfDirectory(this.callId, node);
      if(children.length > 0){
        this.errorHandler.handleError(this.translator.instant('#LDS#You cannot delete the folder. The folder is not empty. First delete the contents of the folder and try again.'))
        return;
      }
    }
    this.dialog
      .open(CallsAttachmentDialogComponent, {
        data: {
          actionType: CallsAttachmentActionType.deleteFolder,
          itemInfo: node.name,
        },
      })
      .afterClosed()
      .subscribe((dialogResult) => {
        if (!!dialogResult?.action) {
          this.deleteFolder(node);
        }
      });
  }

  // Attaching a file inside a folder or at parent level
  public async attachFile(val) {
    if(!val){
      return;
    }
    this.changeLoadingOverlayStatus(true);
    const fileToUpload: File | null = val[0];
    const fileExtension: string = fileToUpload?.name.split('.').pop();

    try {
      if (fileToUpload && this.callsConfig.AttachmentFileTypes.includes(`.${fileExtension}`)) {
        const obj = { name: fileToUpload?.name, type: CallsAttachmentType.file, path: '', file: fileToUpload };
        const blob = new Blob([fileToUpload], { type: fileToUpload.type });

        if (this.hasMaxAttachmentSize && fileToUpload.size > this.callsConfig?.AttachmentMaxSize) {
          throw new Error(this.ldsReplace.transform(await this.translator.get('#LDS#You cannot upload the file. The file is too big. You can upload files up to {0}.').toPromise(), this.convertedMaxAttachmentSize));
        }
        //when attaching inside a parent
        if (this.selectedNode) {
          obj.path = this.selectedNode.path + '/' + fileToUpload.name;
          fileToUpload && this.uploadFile(obj.path, blob, this.selectedNode);
          //when attaching it at root level
        } else {
          obj.path = fileToUpload.name;
          fileToUpload && this.uploadFile(obj.path, blob, this.attachmentTreeData);
        }
      } else {
        throw new Error(this.ldsReplace.transform(await this.translator.get('#LDS#You cannot upload the file. The maximum number of files has been reached. You can attach a total of {0} files.').toPromise(), this.callsConfig.AttachmentFileTypes.join(", ")));
      }
    } catch (error) {
      this.errorHandler.handleError(error);
    } finally {
      this.changeLoadingOverlayStatus(false);
    }
  }

  // Setup download directive and download file
  public async downloadFile(node: CallsAttachmentNode) {
    const def = new MethodDefinition(new V2ApiClientMethodFactory().portal_calls_attachments_file_get(this.callId, node.path));

    const directive = new EuiDownloadDirective(null /* no element */, this.http, this.overlay, this.injector);
    directive.downloadOptions = {
      ...this.elementalUiConfigService.Config.downloadOptions,
      fileMimeType: '',
      url: this.config.BaseUrl + def.path,
      disableElement: false,
      fileName: node.name
    };

    directive.onClick();
  }

  public onNodeSelection(node: CallsAttachmentNode) {
    this.attachmentTreeData.isSelected = false;
    this.updateSelectionState(this.attachmentTreeData.children);
    if (this.selectedNode == node) {
      this.selectedNode = null;
    } else {
      this.selectedNode = node;
      node.isSelected = !node.isSelected;
    }
  }

  public updateSelectionState(data: CallsAttachmentNode[]) {
    data.forEach((element) => {
      element.isSelected = false;
      if (element.children) this.updateSelectionState(element.children);
    });
  }

  public isDuplicateName(name, node) {
    let element = node.find((element) => name == element.name);
    let elementFound = element ? true : false;
    return elementFound;
  }

  public hasChild(_: number, node: CallsAttachmentNode): CallsAttachmentNode[] {
    return node.children;
  }

  public onAlertDismissed() {
    this.showAlert = false;
    this.alertText = '';
  }

  // Attach file is only available in folder node
  public isNodeTypeFolder(node: CallsAttachmentNode | null): boolean {
    return node?.type === CallsAttachmentType.folder || !node;
  }

  // If isLoading return true the progressbar next to the node will shown
  public isLoading(node: CallsAttachmentNode): boolean {
    return node.isLoading;
  }

  // Only empty folders and files can be deleted
  public isNodeDeletable(node: CallsAttachmentNode): boolean {
    return this.isNodeFolderEmpty(node) || this.isNodeFile(node);

  }

  // Show information instead of attachment file tree
  public get showInformation():boolean{
    return this.attachmentTreeData?.children.length === 0;
  }

  private async uploadFile(path: string, blob: Blob, node: CallsAttachmentNode): Promise<void>{
    try{
      await this.attachmentService.uploadFile(this.callId,path, blob);
      await this.apiControls.getChildren(node, false);
      this.expandNode(node);
    } catch {
      this.errorHandler.handleError(this.translator.instant('#LDS#You cannot upload the file. You do not have permission to upload files.'))
    }
  }

  private async byteConverter(byte: number): Promise<string> {
    if (byte >= 1073741824) return this.ldsReplace.transform(await this.translator.get('#LDS#{0} GB').toPromise(), this.getFlooredFixed(byte / Math.pow(1024,3))); else
    if (byte >= 1048576) return this.ldsReplace.transform(await this.translator.get('#LDS#{0} MB').toPromise(), this.getFlooredFixed(byte / Math.pow(1024,2))); else
    if (byte >= 1024) return this.ldsReplace.transform(await this.translator.get('#LDS#{0} kB').toPromise(), this.getFlooredFixed(byte / Math.pow(1024,1))); else
    return this.ldsReplace.transform(await this.translator.get('#LDS#{0} byte').toPromise(), byte);
  }

  private getFlooredFixed(value: number, fractionDigits: number = 2): string {
    return (Math.floor(value * Math.pow(10, fractionDigits)) / Math.pow(10, fractionDigits)).toFixed(fractionDigits);
  }

  private isNodeFolderEmpty(node: CallsAttachmentNode): boolean {
    return !!node && node.type === CallsAttachmentType.folder && (!node.children || node.children.length === 0);
  }

  private isNodeFile(node: CallsAttachmentNode): boolean {
    return !!node && node.type === CallsAttachmentType.file;
  }

  private async deleteFolder(node: CallsAttachmentNode) {
    try {
      this.changeLoadingOverlayStatus(true);
      const parent = node.parent;
      await this.attachmentService.deleteDirectory(this.callId, node.path);
      if (parent) {
        await this.apiControls.getChildren(parent, false);
        this.expandNode(parent);
      }else{
        this.attachmentTreeData.children = this.attachmentTreeData.children.filter((childNode) => childNode.name !== node.name);
        this.expandNode(this.attachmentTreeData);
      }
    } catch {
      this.errorHandler.handleError(this.translator.instant('#LDS#You cannot delete the folder. You do not have permission to delete folders.'))
    } finally {
      this.changeLoadingOverlayStatus(false);
      this.selectedNode = null;
    }
  }

  private async deleteFile(node: CallsAttachmentNode) {
    try{
      this.changeLoadingOverlayStatus(true);
      await this.attachmentService.deleteFile(this.callId, node.path);
      if (node.parent) {
        await this.apiControls.getChildren(node.parent, false);
        this.expandNode(node.parent);
      }
      this.selectedNode = null;
    }catch{
      this.errorHandler.handleError(this.translator.instant('#LDS#You cannot delete the attachment. You do not have permission to delete attachments.'))
    }finally{
      this.changeLoadingOverlayStatus(false);
    }
  }

  private async createFolder(val: string, node?: CallsAttachmentNode) {
    if (val) {
      let obj: CallsAttachmentNode = {
        name: val,
        children: [],
        type: CallsAttachmentType.folder,
        path: '',
        level: 1,
        isSelected: false,
        parent: node,
      };
      if (node) {
        if (this.isDuplicateName(val, node.children)) {
          this.showAlertMessage('#LDS#You cannot create the folder. A folder with the entered name already exists. Enter a different folder name.');
        } else {
          obj.path = node.path + '/' + val;
          obj.level = node.level + 1;
          await this.apiControls.getChildren(node);
          await this.attachmentService.createDirectory(this.callId, obj.path);
          node.children.unshift(obj);
          this.expandNode(node);
        }
      } else {
        if (this.isDuplicateName(val, this.attachmentTreeData.children)) {
          this.showAlertMessage('#LDS#You cannot create the folder. A folder with the entered name already exists. Enter a different folder name.');
        } else {
          obj.path = `${val}`;
          await this.attachmentService.createDirectory(this.callId, obj.path);
          this.attachmentTreeData.children.unshift(obj);
          this.expandNode(this.attachmentTreeData);
        }
      }
    }
  }

  private expandNode(node: CallsAttachmentNode) {
    this.treeControl.collapse(node);
    this.treeControl.expand(node);
  }

  private showAlertMessage(error: string) {
    this.alertText = error;
    this.showAlert = true;
  }

  private changeLoadingOverlayStatus(status: boolean) {
    this.loadingOverlay = status;
  }
}
