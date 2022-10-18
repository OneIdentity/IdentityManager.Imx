import { Component } from "@angular/core";
import { PortalPersonAll } from "imx-api-qer";
import { QerApiService } from "qer";

@Component({
  templateUrl: './start.component.html'
})
export class StartComponent {

  constructor(private qerApi: QerApiService) { }

  persons: PortalPersonAll[] = [];
  totalCount = 0;
  busy = false;

  async loadPersonData() {

    try {
      this.busy = true;

      // load some address book data from the API Server.
      // This call uses the default parameters, which will
      // return the first 20 identities in the database.
      const personData = await this.qerApi.typedClient.PortalPersonAll.Get();

      this.persons = personData.Data;
      this.totalCount = personData.totalCount;
    } finally {
      // Even if the call fails, reset the busy flag
      this.busy = false;
    }
  }

}
