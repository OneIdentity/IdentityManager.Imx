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
 * Copyright 2024 One Identity LLC.
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

import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { EUI_SIDESHEET_DATA, EuiLoadingService, EuiSidesheetRef } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { CollectionLoadParameters, DataModel, IEntity, ValType } from '@imx-modules/imx-qbm-dbts';
import {
  BaseCdr,
  ColumnDependentReference,
  ConfirmationService,
  DataSourceToolbarFilter,
  DataTreeWrapperComponent,
  EntityService,
  HELPER_ALERT_KEY_PREFIX,
  LdsReplacePipe,
  SnackBarService,
  StorageService,
} from 'qbm';
import { AccessRequestDataService } from './access-request-data.service';
import { AccessRequestSidesheetData } from './access-request-sidesheet-data.interface';
import { AccessRequestTreeDatabase } from './access-request-tree-database';
import { QamTreeNode } from './qam-resourcetree';

const helperAlertKey = `${HELPER_ALERT_KEY_PREFIX}_requestingFileSystemAccess`;

interface FolderFormGroup {
  folderArray: FormArray<any>;
  enterFolderManually: FormControl<boolean>;
}

/**
 * Component that let the user select multiple resource for his request.
 * The user can select the resources from a tree or can enter them manually.
 */
@Component({
  templateUrl: './access-request-sidesheet.component.html',
  styleUrls: ['./access-request-sidesheet.component.scss'],
})
export class AccessRequestSidesheetComponent implements OnInit {
  @ViewChild('dataTreeWrapper', { static: true }) dataTreeWrapper: DataTreeWrapperComponent;

  public get showHelperAlert(): boolean {
    return !this.storageService.isHelperAlertDismissed(helperAlertKey);
  }
  public formGroup: FormGroup<FolderFormGroup>;
  public folderList: ColumnDependentReference[] = [];

  public treeDatabase: AccessRequestTreeDatabase;
  public filterOptions: DataSourceToolbarFilter[] = [];

  public selectedNodes: IEntity[] = [];
  public showTree = true;

  private dataModel: DataModel;
  private readonly subscriptions: Subscription[] = [];
  private dgeResourcesNodes: QamTreeNode[] = [];

  public formValid: boolean = true;
  public validationMessage: string = '';

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: AccessRequestSidesheetData,
    confirmationService: ConfirmationService,
    private readonly accessRequestDataService: AccessRequestDataService,
    private readonly entityService: EntityService,
    private readonly euiBusyService: EuiLoadingService,
    private readonly ldsReplace: LdsReplacePipe,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly storageService: StorageService,
    private readonly translate: TranslateService,
    private readonly snackbar: SnackBarService,
  ) {
    this.subscriptions.push(
      this.sidesheetRef.closeClicked().subscribe(async () => {
        const close = await confirmationService.confirmLeaveWithUnsavedChanges();
        if (close) {
          this.sidesheetRef.close([]);
        } else {
          return;
        }
      }),
    );

    this.initializeTree();
  }

  public async ngOnInit(): Promise<void> {
    this.showTree = this.data.uidAccProduct !== undefined && this.data.uidAccProduct.length > 0;

    this.formGroup = new FormGroup<FolderFormGroup>({
      folderArray: new FormArray<any>([]),
      enterFolderManually: new FormControl<boolean>(!this.showTree, { nonNullable: true }),
    });
    this.createNewCdr();

    this.dataModel = this.data.dataModel;
    this.filterOptions = this.dataModel?.Filters || [];
  }

  protected createNewCdr() {
    const cdr = new BaseCdr(
      this.entityService.createLocalEntityColumn({
        ColumnName: 'folder',
        Type: ValType.Text,
        IsMultiLine: true,
      }),
      this.ldsReplace.transform(this.translate.instant('#LDS#Folder #{0}'), this.folderList.length + 1),
    );
    this.folderList.push(cdr);
  }

  /**
   * Checks, if at least one folder was manually entered or selected from the tree
   * @returns true, if one or more folder were entered/selected, otherwise false
   */
  public foldersAreValid(): boolean {
    if (this.formGroup.controls.enterFolderManually.value) {
      // return the manually entered folders
      return this.formGroup.controls.folderArray.value.length > 0 && this.formGroup.controls.folderArray.value[0].length > 0;
    } else {
      // return the selected folders from the tree
      return this.selectedNodes.length > 0;
    }
  }

  public checkEnteredFoldersPathValid(): boolean {
    let isValid = true;
    this.formGroup.controls.folderArray.value.forEach((element: string, index: number) => {
      if (element.length == 0) {
        this.validationMessage = this.ldsReplace.transform(
          this.translate.instant('Folder #{0} path is empty. Please enter a valid path.'),
          index + 1,
        );
        isValid = false;
        return;
      }
      const regex = /^(\\\\[a-zA-Z0-9_.-]+\\[a-zA-Z0-9_.-]+(\\[a-zA-Z0-9_.-]+)*)$/;
      if (!regex.test(element)) {
        this.validationMessage = this.ldsReplace.transform(
          this.translate.instant('The entered path of Folder #{0} is not valid. Please use the form \\\\server\\path.'),
          index + 1,
        );
        isValid = false;
        return;
      }
    });
    return isValid;
  }

  protected submitValues(): void {
    if (this.formGroup.controls.enterFolderManually.value && !this.checkEnteredFoldersPathValid()) {
      this.formValid = false;
      return;
    }
    this.sidesheetRef.close(this.getFolders());
  }

  showSnackBar() {
    this.snackbar.open({ key: '#LDS#Validation error message closed.' });
    this.formValid = true;
  }

  private async initializeTree(): Promise<void> {
    if (this.data.uidAccProduct && this.data.uidAccProduct.length > 0) {
      this.dgeResourcesNodes = await this.getData(true);
      this.treeDatabase = new AccessRequestTreeDatabase(this.dgeResourcesNodes);
    }
  }

  /** Returns the list of all selected or manually entered folders. */
  private async getFolders(): Promise<string[]> {
    if (this.formGroup.controls.enterFolderManually.value) {
      // return the manually entered folders
      return this.formGroup.controls.folderArray.value;
    } else {
      // return the selected folders from the tree
      let folders: string[] = [];

      for (const node of this.selectedNodes) {
        const uidQamDug = node.GetColumn('UidQamDug').GetValue();
        // get the fullpath of this dgeResource
        const opts: CollectionLoadParameters = {
          PageSize: 1,
          StartIndex: 0,
          filter: [
            {
              ColumnName: 'UID_QAMDug',
              Value1: uidQamDug,
            },
          ],
        };
        const dgeResources = await this.accessRequestDataService.getDgeResources(opts);
        if (dgeResources?.Data[0]?.FullPath?.value?.length > 0) {
          folders.push(dgeResources.Data[0].FullPath.value);
        }
      }
      return folders;
    }
  }

  private async getData(showLoading: boolean, parameters: CollectionLoadParameters = { ParentKey: '' }): Promise<QamTreeNode[]> {
    let nodes: QamTreeNode[];
    if (showLoading && this.euiBusyService.overlayRefs.length === 0) {
      this.euiBusyService.show();
    }
    try {
      nodes = this.data.uidAccProduct ? await this.accessRequestDataService.getDgeResourceTree(this.data.uidAccProduct) : [];
    } finally {
      if (showLoading) {
        this.euiBusyService.hide();
      }
    }
    return nodes;
  }
}
