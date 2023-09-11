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

import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { MockBuilder, MockedComponentFixture, MockRender } from 'ng-mocks';

import { MetadataService } from '../base/metadata.service';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';
import { ConfirmationService } from '../confirmation/confirmation.service';
import { FkHierarchicalDialogComponent } from './fk-hierarchical-dialog.component';
import { FkHierarchicalDialogModule } from './fk-hierarchical-dialog.module';

const fkInfo = [
  { TableName: 'testtable1', ColumnName: 'testcolumn1', Get: (_) => undefined ,GetDataModel: () =>undefined},
  { TableName: 'testtable2', ColumnName: 'testcolumn2', Get: (_) => undefined, GetDataModel: () =>undefined },
];

[
  { fkRelations: fkInfo, expectedMetadataCall: 1 },
  { fkRelations: [], expectedMetadataCall: 0 },
  { fkRelations: undefined, expectedMetadataCall: 0 },
].forEach((testcase) =>
  describe('FkHierarchicalDialogComponent', () => {
    let component: FkHierarchicalDialogComponent;
    let fixture: MockedComponentFixture<FkHierarchicalDialogComponent>;

    const metadataServiceStub = {
      tables: {},
      update: jasmine.createSpy('update'),
    };

    beforeEach(() => {
      return MockBuilder([FkHierarchicalDialogComponent, TranslateModule.forRoot()])
        .mock(FkHierarchicalDialogModule)
        .mock(EuiSidesheetRef).mock(MetadataService,metadataServiceStub)
        .mock(ConfirmationService)
        .mock(EuiLoadingService)
        .mock(EUI_SIDESHEET_DATA, {
          fkRelations: testcase.fkRelations,
          displayValue: 'some title',
        });
    });

    beforeEach(() => {
      fixture = MockRender(FkHierarchicalDialogComponent);
      component = fixture.point.componentInstance;
    });

    afterAll(() => {
      clearStylesFromDOM();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  })
);
