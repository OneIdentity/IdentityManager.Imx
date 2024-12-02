# Adding a tile component to the dashboard

The landing page of the Web Portal consists of the `IMX Dashboard` component, which can be found in the QER library (projects\qer\src\lib\wport\start).

It consists of three sections with different tiles.

![Dashboard](../../assets/images/dashboard/1-dashboard.png)

Tiles can be added dynamically to the dashboard. In the following example you can get an overview of the different types of tiles and learn how to add a new element (the `Block Identity` tile) to the dashboard.


## Dashboard tiles

The `Tiles` modules (projects\qbm\src\lib\tile and projects\qer\src\lib\tiles) offer different base components:

- [`TileComponent`](../../components/TileComponent.html) (QBM)
- `BadgeTileComponent` (QER)
- `IconTileComponent` (QER)
- `NotificationTileComponent`(QER)

These components are variations of the same concept.

The new tile that is added in this example is based on the `IconTileComponent`.

## Implementing a "Block Identity" tile

This example is based on the following fictitious scenario:\
There is a security breach and an administrator wants to block the account of the affected identity using a tile on the dashboard. The implementation of this scenario consists of several examples.

![BlockTile](../../assets/images/dashboard/2-dashboard.png)


### Creating the "Block Identity" component

At first, the `Block Identity` component has to be created.

The component consists of the following files:
- `block-identity.component.html`
- `block-identity.component.scss`
- `block-identity.component.ts`

The main parts of the component are a Typescript file and the corresponding HTML template.

The HTML template is based on the previously mentioned `IconTileComponent` component.

``` html
<imx-icon-tile caption="Block Identity" image="userremove" [subtitle]="description">
  <ng-template #ActionTemplate>
    <button mat-button color="primary" (click)="block()">
      <span>{{ '#LDS#Block' | translate }}</span>
      &nbsp;
      <eui-icon size="m" icon="forward"></eui-icon>
    </button>
  </ng-template>
</imx-icon-tile>
```

The `IconTileComponent` expects some input fields like `caption`, `image` or `subtitle`. You can find out which tile components expect which inputs in the `Tiles` module.

NOTE: IMX components and applications are based on the One Identity Elemental UI framework, which extends Angular Material. The `eui-icon` tag is such an Elemental UI component (https://elemental.dev.oneidentity.com/).

The corresponding `*.ts` component sets the `Description` property/input used in the template and implements the "block()" method.

``` ts
import { Component } from '@angular/core';

@Component({
  selector: 'imx-block-identity',
  templateUrl: './block-identity.component.html',
  styleUrls: ['./block-identity.component.scss']
})
export class BlockIdentityComponent  {
  public description = 'Blocks an identity and marks the identity as security risk.';

  constructor() { }

  public block(): void {
    alert('Block Tile Clicked');
  }

}
```

### Integrating the "Block Identity" component

To include the component into the dashboard, it must be made available to the web application (in this case the Web Portal).
This is done in the `init` service of the corresponding library.

The relevant section of the service:

``` ts
@Injectable({ providedIn: 'root' })
export class InitService {
  public onInit(routes: Route[]): void {
    this.extService.register('Dashboard-MediumTiles', {
      instance: BlockIdentityComponent,
    });
  }
}
```

The final result looks like this.

![block-identity.component.ts](../../assets/images/dashboard/5-block-identity-button.png)
