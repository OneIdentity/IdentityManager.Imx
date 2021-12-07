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

import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { ConfigNodeData } from "imx-api-qbm";
import { MessageDialogResult } from "../message-dialog/message-dialog-result.enum";
import { MessageDialogComponent } from "../message-dialog/message-dialog.component";
import { imx_SessionService } from "../session/imx-session.service";
import { SnackBarService } from "../snackbar/snack-bar.service";
import { ConfigSection, KeyData } from "./config-section";

@Injectable()
export class ConfigService {
  constructor(
    private readonly session: imx_SessionService,
    private readonly dialog: MatDialog,
    private readonly translator: TranslateService,
    private readonly snackbar: SnackBarService) {
  }

  private pendingChanges: {
    [appId: string]: {
      [id: string]: KeyData
    }
  } = {};

  public appId: string;
  /** all sections */
  sections: ConfigSection[] = [];

  /** view model for the sections */
  sectionsFiltered: ConfigSection[] = [];

  public readonly filter: {
    customized?: boolean,
    keywords?: string
  } = {};

  /** Returns display information about the pending changes to keys. */
  public getPendingChanges(): string[][] {
    const result: string[][] = [];
    for (const appId in this.pendingChanges) {
      if (Object.prototype.hasOwnProperty.call(this.pendingChanges, appId))
        for (const elem of Object.values(this.pendingChanges[appId])) {
          result.push([appId, ...elem.DisplayPath]);
        }
    }
    return result;
  }

  public get pendingChangeCount() {
    return Object.keys(this.pendingChanges).length;
  }

  private initForAppId() {
    if (!this.pendingChanges[this.appId])
      this.pendingChanges[this.appId] = {};
  }

  public addChange(conf: KeyData) {
    this.initForAppId();
    this.pendingChanges[this.appId][conf.Path] = conf;
  }

  public async revert(conf: KeyData) {
    // delete pending change if there is one
    if (this.pendingChanges[this.appId]) {
      delete this.pendingChanges[this.appId][conf.Path];
    }
    const confObj = {};
    // setting to null value, meaning: revert
    confObj[conf.Path] = null;
    await this.session.Client.admin_apiconfig_post(this.appId, !conf.HasCustomLocalValue, confObj);
    delete this.pendingChanges[this.appId];

    // reload all to get the effective value. there is no good way to get just
    // the new effective value of the changed key.
    this.load();
  }

  public async revertAll(isGlobal: boolean): Promise<void> {
    const result = await this.dialog.open(MessageDialogComponent, {
      data: {
        ShowYesNo: true,
        Title: await this.translator.get('#LDS#Heading Reset Configuration').toPromise(),
        Message: await this.translator.get('#LDS#Are you sure you want to reset all customized configuration values?').toPromise()
      },
      panelClass: 'imx-messageDialog'
    }).afterClosed().toPromise();

    if (result === MessageDialogResult.YesResult) {
      await this.session.Client.admin_apiconfig_revert_post(this.appId, isGlobal);
      delete this.pendingChanges[this.appId];
      this.load();
    }
  }

  public async submit(isGlobal: boolean) {
    const changeObj: {
      [id: string]: any
    } = {};

    const changes = this.pendingChanges[this.appId];
    for (const elem in changes) {
      if (Object.prototype.hasOwnProperty.call(changes, elem)) {
        changeObj[elem] = changes[elem].Value;
      }
    }

    for (var appId in this.pendingChanges) {
      await this.session.Client.admin_apiconfig_post(appId, isGlobal, changeObj)
    }
    this.pendingChanges = {};
    this.load();
    const key = isGlobal
      ? '#LDS#Your changes have been successfully saved. The changes apply to all API Server instances connected to the software update process. It may take some time for the changes to take effect.'
      : '#LDS#Your changes have been successfully saved. The changes only apply to this API Server and will be lost when you restart the server.';
    this.snackbar.open({
      key: key
    });
  }

  public async load() {
    // remove data from unselected project
    this.sections = [];
    this.sectionsFiltered = [];

    const configNodes = await this.session.Client.admin_apiconfig_get(this.appId);

    const result: ConfigSection[] = [];
    for (const topLevelNode of configNodes) {
      const keyData: KeyData[] = [];
      this.flatten(keyData, topLevelNode, "", []);

      var name = topLevelNode.Name;
      if (!name)
        name = topLevelNode.Key;
      result.push(new ConfigSection(name, topLevelNode.Description, keyData));
    }

    this.sections = result;
    this.search();
  }

  private flatten(keyData: KeyData[], node: ConfigNodeData, path: string, displayPath: string[]) {

    const thisPath = path + node.Key;
    for (const n of node.Settings) {
      const searchTerms = [
        n.Name?.toLowerCase(),
        n.Key?.toLowerCase(),
        n.Description?.toLowerCase()
      ];
      keyData.push({
        ...n,
        DisplayPath: [...displayPath, n.Name],
        Path: thisPath + "/" + n.Key,
        searchTerms: searchTerms
      });
    }

    for (const n of node.Children) {
      this.flatten(keyData, n, thisPath + "/", [...displayPath, n.Name]);
    }
  }

  public async search(): Promise<void> {
    const keywords = this.filter.keywords;
    var result = this.sections;
    if (keywords || this.filter.customized) {
      result = result
        .map(d => this.matchesSection(d, keywords, this.filter.customized))
        .filter(d => d.Keys.length > 0);
    }

    this.sectionsFiltered = result;
  }

  private matchesSection(section: ConfigSection, keywords: string, onlyCustomized: boolean): ConfigSection {
    const matching = section.Keys.filter(d => this.matches(d, keywords, onlyCustomized));

    return new ConfigSection(section.Title, section.Description, matching);
  }

  private matches(d: KeyData, keywords: string, onlyCustomized: boolean): boolean {
    if (onlyCustomized && !d.HasCustomGlobalValue && !d.HasCustomLocalValue) {
      return false;
    }

    if (!keywords || d.searchTerms.filter(n => n?.includes(keywords)).length > 0) {
      return true;
    }

    return false;
  }



}