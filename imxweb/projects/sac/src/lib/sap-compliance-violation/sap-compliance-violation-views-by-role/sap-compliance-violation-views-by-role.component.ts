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

import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ByRoleResult, ByRoleResultElement, SAPUserFunctionSrcPROF } from 'imx-api-sac';
import { SapRoleTreeNodeModel } from './../sap-compliance-violation.model';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MatTableDataSource } from '@angular/material/table';
import { EntitySchema, IClientProperty, TypedEntityCollectionData, ValType } from 'imx-qbm-dbts';
import { DataSourceToolbarSettings } from 'qbm';
import { MatSort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'imx-sap-compliance-violation-views-by-role',
  templateUrl: './sap-compliance-violation-views-by-role.component.html',
  styleUrls: ['./sap-compliance-violation-views-by-role.component.scss'],
})
export class SapComplianceViolationViewsByRoleComponent implements OnInit {
  @Input() set resultByRole(value: ByRoleResult) {
    this._resultByRole = value;
    if (!!value?.Elements) {
      this.dataSource.data = value.Elements;
    }
  }
  get resultByRole(): ByRoleResult {
    return this._resultByRole;
  }
  @ViewChild(MatSort) sort: MatSort;
  public displayedColumns: string[] = ['GroupName', 'Description', 'GroupType'];
  public displayedProfileColumns: string[] = ['Ident_SAPProfile', 'Objects', 'Field', 'LowerLimit', 'UpperLimit'];
  private transformer = (node: ByRoleResultElement, level: number) => {
    return {
      expandable: !!node.ChildElements && node.ChildElements.length > 0,
      level: level,
      GroupName: node.GroupName,
      Description: node.Description,
      GroupFlag: node.GroupFlag,
      GroupType: node.GroupType,
      ChildElements: node.ChildElements,
      Prof: node.Prof,
    };
  };
  public treeControl = new FlatTreeControl<SapRoleTreeNodeModel>(
    (node) => node.level,
    (node) => node.expandable
  );
  public treeFlattener = new MatTreeFlattener(
    this.transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.ChildElements
  );
  public dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  public selectedProfiles: SAPUserFunctionSrcPROF[] = [];
  public profileDataSource = new MatTableDataSource<SAPUserFunctionSrcPROF>();
  public extendRole = true;
  public extendProfiles = true;
  public showProfiles = false;
  public selectedRole: SapRoleTreeNodeModel;
  public profileSearchControl = new FormControl<string>('');
  private _resultByRole: ByRoleResult;

  constructor(private cdref: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.profileSearchControl.valueChanges.subscribe((searchValue) => this.searchProfiles(searchValue));
  }

  public hasChild(_: number, node: SapRoleTreeNodeModel): boolean {
    return node.expandable;
  }
  public hasProfiles(node: SapRoleTreeNodeModel): boolean {
    return !!node.Prof && node.Prof.length > 0;
  }
  public updateProfiles(node: SapRoleTreeNodeModel): void {
    if (!!node?.Prof) {
      this.showProfiles = true;
      this.selectedProfiles = node.Prof;
      this.profileDataSource.data = node.Prof;
      this.selectedRole = node;
      this.cdref.detectChanges();
      this.profileDataSource.sort = this.sort;
    }
  }
  public toggleRoleExpand(): void {
    this.extendRole = !this.extendRole;
    if (!this.extendRole) {
      this.extendProfiles = true;
    }
  }
  public toggleProfilesExpand(): void {
    this.extendProfiles = !this.extendProfiles;
    if (!this.extendProfiles) {
      this.extendRole = true;
    }
  }

  private searchProfiles(searchValue: string): void {
    if (!!searchValue) {
      searchValue = searchValue.toLocaleLowerCase();
      this.profileDataSource.data = this.selectedProfiles.filter(
        (profile) =>
          profile.Ident_SAPProfile.toLocaleLowerCase().includes(searchValue) ||
          profile.Objects.toLocaleLowerCase().includes(searchValue) ||
          profile.Field.toLocaleLowerCase().includes(searchValue)||
          profile.LowerLimit.toLocaleLowerCase().includes(searchValue)||
          profile.UpperLimit.toLocaleLowerCase().includes(searchValue)
      );
    } else {
      this.profileDataSource.data = this.selectedProfiles;
    }
  }
}
