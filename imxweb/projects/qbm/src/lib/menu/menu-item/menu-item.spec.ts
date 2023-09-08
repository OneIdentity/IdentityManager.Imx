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

import { GroupMenuItem } from './group-menu-item';
import { NavigationMenuItem } from './navigation-menu-item';
import { RelatedApplicationMenuItem } from './related-application-menu-item';

describe('GroupMenuItem', () => {
  [
    {
        menuItems: [],
        expectedEnabled: false
    },
    {
        menuItems: [{ title: '' }],
        expectedEnabled: false
    },
    {
        menuItems: [{ title: '' }],
        expectedEnabled: false
    },
    {
        menuItems: [{ title: '' }],
        expectedEnabled: true
    }
  ].forEach(testcase =>
    it('should be created with ' + (testcase.menuItems ? testcase.menuItems.length.toString() : 'undefined') + ' menuItems', () => {
        const item = new GroupMenuItem('', '', testcase.menuItems);
        expect(item.items.length).toEqual(testcase.menuItems.length);
    })
  );
});

describe('NavigationMenuItem', () => {
  it('should be created', () => {
      expect(new NavigationMenuItem('', '', '', '')).toBeDefined();
  });
});

describe('RelatedApplicationMenuItem', () => {
  [
    {
        appDisplayType: 'NR',
        expectedTrigger: () => {}
    },
    {
        appDisplayType: 'PP',
        expectedTrigger: () => {}
    },
    {
        appDisplayType:  'NV',
        expectedTrigger: () => {}
    },
    {
        appDisplayType:  'NT',
        expectedTrigger: () => {}
    }
  ].forEach(testcase =>
    it('should be created', () => {
        const app = {
            uid: '',
            displayName: '',
            description: '',
            displayType: testcase.appDisplayType as 'NR' | 'PP' | 'NV' | 'NT',
            uidParent: ''
        };

        const item = new RelatedApplicationMenuItem(app);

        expect(item.id).toEqual(app.uid);
        expect(item.title).toEqual(app.displayName);
        expect(item.description).toEqual(app.description);
        expect(() => item.Trigger()).not.toThrow();
    })
  );

  it('should be created', () => {
    const item = new RelatedApplicationMenuItem({
        uid: '',
        displayName: '',
        description: '',
        displayType: undefined as 'NR' | 'PP' | 'NV' | 'NT',
        uidParent: ''
    });
    expect(() => item.Trigger()).toThrow();
  })
});