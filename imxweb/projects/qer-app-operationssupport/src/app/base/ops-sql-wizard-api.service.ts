import { Injectable } from '@angular/core';
import { FilterProperty, CollectionLoadParameters, EntityCollectionData } from 'imx-qbm-dbts';
import { SqlWizardApiService } from 'qbm';

@Injectable({
  providedIn: 'root'
})
export class OpsSqlWizardApiService extends SqlWizardApiService {
  public implemented: boolean = false;

  getFilterProperties(table: string): Promise<FilterProperty[]> {
    return new Promise((resolve) => resolve([]));
  }
  getCandidates(parentTable: string, options?: CollectionLoadParameters): Promise<EntityCollectionData> {
    return new Promise((resolve) => resolve({TotalCount: 0}));
  }

  constructor() {
    super();
  }
}
