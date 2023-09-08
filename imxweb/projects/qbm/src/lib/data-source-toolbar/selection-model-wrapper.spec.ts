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

import { TypedEntity } from 'imx-qbm-dbts';
import { SelectionModelWrapper } from './selection-model-wrapper';

describe('SelectionModelWrapper select-deselect', () => {
  const createSomeTypedEntity = (keys = ['']) => ({
    GetEntity: () => ({
      GetKeys: () => keys
    })
  }) as TypedEntity;

  const getKey = entity => entity.GetEntity().GetKeys().join();

  it('should select an item', () => {
    const selection = new SelectionModelWrapper();

    expect(selection.selected?.length).toBeFalsy();

    const entity = createSomeTypedEntity();

    selection.checked(entity);

    expect(selection.selected.map(e => getKey(e))).toContain(getKey(entity));
  });

  it('should deselect an item', () => {
    const selection = new SelectionModelWrapper();

    expect(selection.selected?.length).toBeFalsy();

    const entity = createSomeTypedEntity();

    selection['selection'].select(entity);

    selection.unChecked(entity);

    expect(selection.selected.map(e => getKey(e))).not.toContain(getKey(entity));
  });
});