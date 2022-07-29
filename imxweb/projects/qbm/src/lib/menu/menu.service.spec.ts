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

import { TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';

import { MenuService } from './menu.service';

describe('MenuService', () => {
  let service: MenuService;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        MenuService
      ]
    });
    service = TestBed.inject(MenuService);
  });

  beforeEach(() => {
    service['factories'] = [];
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('addMenuFactories() should add menus to an array', () => {

    expect(service['factories'].length).toBe(0);

    service.addMenuFactories(() => {
      return {
        id: '1',
        title: 'First Main Menu',
        items: [
          {
            route: 'firstsub',
            title: 'First Sub Menu'
          }
        ]
      };
    }
    );

    expect(service['factories'].length).toBe(1);
  });

  describe('getMenuItems()', () => {

    it('should return an empty list of menu items, if no factory is registered', () => {
      expect(service['factories'].length).toBe(0);

      let menuItems = service.getMenuItems([], []);

      expect(menuItems.length).toBe(0);

    });

    it('should return a list with one menu item, if one factory is registered', () => {
      service.addMenuFactories(() => {
        return {
          id: '1',
          title: 'First Main Menu',
          items: [
            {
              route: 'firstsub',
              title: 'First Sub Menu'
            }
          ]
        };
      }
      );

      let menuItems = service.getMenuItems([], []);

      expect(menuItems.length).toBe(1);
      expect(menuItems[0].items.length).toBe(1);
    });

    it('should return a list with two menu item, if two factories with different ids are registered', () => {
      service.addMenuFactories(() => {
        return {
          id: '1',
          title: 'First Main Menu',
          items: [
            {
              route: '1 - Sub1',
              title: 'First Sub Menu of first Main Menu'
            }
          ]
        };
      });

      service.addMenuFactories(() => {
        return {
          id: '2',
          title: 'Second Main Menu',
          items: [
            {
              route: '2 - Sub2',
              title: 'First Sub Menu of second Main Menu'
            }
          ]
        };
      });

      let menuItems = service.getMenuItems([], []);

      expect(menuItems.length).toBe(2);
      expect(menuItems[0].items.length).toBe(1);
      expect(menuItems[1].items.length).toBe(1);
    });

    it('should return a list with one menu item, if two factories with the same ids are registered', () => {
      service.addMenuFactories(() => {
        return {
          id: '1',
          title: 'First Main Menu',
          items: [
            {
              id: '1 - Sub1',
              route: '1 - Sub1',
              title: 'First Sub Menu of first Main Menu'
            }
          ]
        };
      });

      service.addMenuFactories(() => {
        return {
          id: '1',
          title: 'First Main Menu (1)',
          items: [
            {
              id: '1 - Sub2',
              route: '1 - Sub2',
              title: 'Second Sub Menu of first Main Menu'
            }
          ]
        };
      });

      let menuItems = service.getMenuItems([], []);

      expect(menuItems.length).toBe(1);
      expect(menuItems[0].items.length).toBe(2);
    });

    it('should return a sorted list of main menu items', () => {
      service.addMenuFactories(
        () => {
          return {
            id: '3',
            title: 'Third Main Menu',
            sorting: '3',
            items: [
              {
                route: '3 - Sub1',
                title: 'First Sub Menu of Third Main Menu'
              }
            ]
          };
        },
        () => {
          return {
            id: '1',
            title: 'First Main Menu',
            sorting: '1',
            items: [
              {
                route: '1 - Sub1',
                title: 'First Sub Menu of first Main Menu'
              }
            ]
          };
        },
        () => {
          return {
            id: '2',
            title: 'Second Main Menu',
            sorting: '2',
            items: [
              {
                route: '2 - Sub1',
                title: 'First Sub Menu of second Main Menu'
              }
            ]
          };
        }
      );

      let menuItems = service.getMenuItems([], []);

      expect(menuItems.length).toBe(3);
      expect(menuItems[0].id).toBe('1');
      expect(menuItems[1].id).toBe('2');
      expect(menuItems[2].id).toBe('3');
    });

    it('should return a sorted list of submenu items', () => {
      service.addMenuFactories(
        () => {
          return {
            id: '1',
            title: 'First Main Menu',
            sorting: '1',
            items: [
              {
                id: '1 - Sub5',
                route: '1 - Sub5',
                title: 'Fifth Sub Menu of first Main Menu',
                sorting: '5'
              },
              {
                id: '1 - Sub3',
                route: '1 - Sub3',
                title: 'Third Sub Menu of first Main Menu',
                sorting: '3'
              },
              {
                id: '1 - Sub2',
                route: '1 - Sub2',
                title: 'Second Sub Menu of first Main Menu',
                sorting: '2'
              },
              {
                id: '1 - Sub4',
                route: '1 - Sub4',
                title: 'Fourth Sub Menu of first Main Menu',
                sorting: '4'
              },
              {
                id: '1 - Sub1',
                route: '1 - Sub1',
                title: 'First Sub Menu of first Main Menu',
                sorting: '0'
              },
              
            ]
          };
        }
      );

      let menuItems = service.getMenuItems([], []);

      expect(menuItems[0].items[0].sorting).toBe('0');      
      expect(menuItems[0].items[1].sorting).toBe('2');
    });

  });

});
