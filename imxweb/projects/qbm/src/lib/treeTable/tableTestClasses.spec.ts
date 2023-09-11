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
import { ImxDataSource } from './imx-data-source';

export class Test extends ImxDataSource<any> {
  public startUid: string;

  static buildSingleObject(uidstart: string): {
    [key: string]: any;
  } {
    const ret: { [key: string]: any } = {};
    ret['Uid_Tree'] = uidstart;
    ret['TaskName'] = uidstart + ' Taskname';
    ret['JobChainName'] = uidstart + 'Job chain name';
    ret['ErrorMessages'] = uidstart + 'Error message';
    ret['ParamIn'] = uidstart + 'Param in';
    ret['UID_JobError'] = uidstart + 'e';
    ret['UID_JobSuccess'] = uidstart + 's';

    return ret;
  }

  constructor(private uids = ['x', 'y', 'Y']) {
    super();
  }

  itemsProvider = () => {
    return this.buildTree(this.startUid);
  }

  childItemsProvider = (item: any) => {
    const val1 = this.buildTree(item.UID_JobError);
    const val2 = this.buildTree(item.UID_JobSuccess);
    const arrayOfPromises = [val1, val2];
    const ret = Promise.all(arrayOfPromises).then((arrayOfArrays) => {
      return [].concat.apply([], arrayOfArrays);
    });
    return ret;
  }

  hasChildrenProvider = (data: any) => {
    return (data.UID_JobError !== null && data.UID_JobError !== '')
      && (data.UID_JobSuccess != null && data.UID_JobSuccess !== '');
  }

  private buildTree(uidstart: string): Promise<{ [key: string]: any; }[]> {
    return Promise.resolve(this.uids.map((uid: string) => Test.buildSingleObject(uid + uidstart)));
  }
}
