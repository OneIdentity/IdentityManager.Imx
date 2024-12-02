# Adding a menu to the Web Portal

The main menu (projects\qbm\src\lib\menu) is a central component, just like the dashboard.

![Main menu](../../assets/images/menu/1-menu-bar.png)

New menus and menu items are dynamically added to the main menu via a plugin system.

## Adding a "Block Identity" menu to the menu bar

This example is based on the following fictitious scenario:\
There is a security breach and an administrator wants to block the account of the affected identity using a menu in the menu bar.

### Creating a "Select Identity" component

At first, the `Select Identity` component has to be created in which the identity that should be blocked can be selected.

The component consists of the following files:
- `select-identity.component.html`
- `select-identity.component.scss`
- `select-identity.component.ts`

### Routing to the "Select Identity" component

Before the menu is implemented, a route must be added that leads to the `Select Identity` component.

A new entry to the routing table must be added.

``` ts
const routes: Routes = [
  :
  {
    path: 'selectidentity',
    component: SelectIdentityComponent
  }
];
```

The new menu with the associated route can now be added. This can be done in the `init` service (init-service.ts). In the code snippet below, only the part where the menu is added is shown.

``` ts
:

@Injectable({ providedIn: 'root' })
export class InitService {
  :
  
  public onInit(routes: Route[]): void {
    this.addRoutes(routes);
    :
  }

  private addRoutes(routes: Route[]): void {
    const config = this.router.config;
    routes.forEach((route) => {
      config.unshift(route);
    });
    this.router.resetConfig(config);
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories(
      :
      (preProps: string[], __: string[]) => {
        return {
          id: 'ROOT_SAMPLES',
          title: '#LDS#Samples'
          items: [
            {
              id: 'SAMPLE_SELECT_IDENTITY',
              route: 'selectidentity',
              title: '#LDS#Select Identity'
            },
          ],
        };
    );
  }
}
```

Menus and menu items can be added via the `menu` service (projects\qbm\src\lib\menu). The structure of the menu and the menu items is defined by the `menu-item.interface.ts` file. The most important properties are `id` and `title`. If a menu item is added, the `route` property specifies the route of the component to be displayed.

Extract of the file:

``` ts
import { ProjectConfig } from '@imx-modules/imx-api-qbm';
import { NavigationCommandsMenuItem } from './navigation-commands-menu-item.interface';

/** Represents a single menu item. */
export interface MenuItem {
  /** Unique identifier for the menu item. */
  readonly id?: string;

  /** Display name. */
  readonly title?: string;

  /** Returns a descriptive text, intended for tooltips. */
  readonly description?: string;

  /** Property for simple navigation. */
  readonly route?: string;

  /** Property for sorting the items. */
  readonly sorting?: string;

  /** Property for complex navigation, including outlets etc. */
  navigationCommands?: NavigationCommandsMenuItem;

  /** Called when the menu item is clicked. */
  readonly trigger?: () => void;

  /** Submenu items. */
  items?: MenuItem[];

}

export type MenuFactory = (preProps: string[], features: string[], projectConfig?: ProjectConfig, groups?: string[]) => MenuItem;



```

The final result looks like this.

![Final Result](../../assets/images/menu/3-sub-item-menu.png)