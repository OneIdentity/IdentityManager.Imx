import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'imx-team-responsibility-status-dialog',
  templateUrl: './team-responsibility-status-dialog.component.html',
  styleUrl: './team-responsibility-status-dialog.component.scss',
})
export class TeamResponsibilityStatusDialogComponent {
  public shoppingCartInfoPlural =
    '#LDS#{0} responsibilities have been successfully removed. {0} responsibilities have been added to your shopping cart. To complete the process, submit your shopping cart.';
  public shoppingCartInfoSingular =
    '#LDS#One responsibility has been successfully removed. One responsibility has been added to your shopping cart. To complete the process, submit your shopping cart.';
  public reassignInfoSingular = '#LDS#One responsibility has been successfully reassigned.';
  public reassignInfoPlural = '#LDS#{0} responsibilities have been successfully reassigned.';
  constructor(
    public dialogRef: MatDialogRef<TeamResponsibilityStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reassignedResponsibilities: number; cartResponsibilities: number },
  ) {}

  public get shoppingCartInfo(): string {
    return this.data.cartResponsibilities == 1 ? this.shoppingCartInfoSingular : this.shoppingCartInfoPlural;
  }

  public get reassignInfo(): string {
    return this.data.reassignedResponsibilities == 1 ? this.reassignInfoSingular : this.reassignInfoPlural;
  }
}
