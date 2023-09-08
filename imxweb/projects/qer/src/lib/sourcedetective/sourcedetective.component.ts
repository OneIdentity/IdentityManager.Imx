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

import { Component, OnInit, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { ImxTranslationProviderService, MetadataService, LdsReplacePipe, AuthenticationService, ParameterizedText, TextToken } from 'qbm';
import { ITShopConfig, SourceNode } from 'imx-api-qer';
import { DbObjectKey } from 'imx-qbm-dbts';
import { QerApiService } from '../qer-api-client.service';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { RequestDetailComponent } from '../request-history/request-detail/request-detail.component';
import { TranslateService } from '@ngx-translate/core';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { Subscription } from 'rxjs';
import { RequestDetailParameter } from '../request-history/request-detail/request-detail-parameter.interface';
import { ItshopRequest } from '../request-history/itshop-request';
import { ItshopRequestData } from '../itshop/request-info/itshop-request-data';
import { ItshopRequestService } from '../itshop/itshop-request.service';
import { SourceDetectiveType } from './sourcedetective-type.enum';

type SourceNodeEnriched = SourceNode & {
    Description: ParameterizedText;
    TextTokens?: TextToken[];
    ObjectTypeDisplay: string;
    Children: SourceNodeEnriched[];
    Level: number;
};

@Component({
    templateUrl: './sourcedetective.component.html',
    styleUrls: ['./sourcedetective.component.scss'],
    selector: 'imx-source-detective'
})
export class SourceDetectiveComponent implements OnInit, OnChanges, OnDestroy {

    public treeControl = new FlatTreeControl<SourceNodeEnriched>(
        node => node.Level, node => this.hasChild(node));

    public treeFlattener = new MatTreeFlattener<SourceNodeEnriched, SourceNodeEnriched>(x => x,
        node => node.Level, node => this.hasChild(node), node => node.Children);

    public dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    public dataReady: boolean;
    public busy = false;

    @Input() public UID_Person: string;
    @Input() public TableName: string;
    @Input() public UID: string;
    @Input() public Type: SourceDetectiveType;

    public SourceDetectiveType = SourceDetectiveType;
    private itShopConfig: ITShopConfig;
    private currentUserId: string;

    private readonly subscriptions: Subscription[] = [];

    constructor(
        private readonly apiClient: QerApiService,
        private readonly metadata: MetadataService,
        private readonly loader: EuiLoadingService,
        public readonly ldsReplace: LdsReplacePipe,
        private readonly translationProvider: ImxTranslationProviderService,
        private readonly translator: TranslateService,
        private readonly sidesheet: EuiSidesheetService,
        private readonly projectConfig: ProjectConfigurationService,
        private readonly itshopRequestService: ItshopRequestService,
        authentication: AuthenticationService
    ) {
        this.subscriptions.push(authentication.onSessionResponse.subscribe(state => this.currentUserId = state.UserUid));
    }

    public hasChild = (node: SourceNodeEnriched) => !!node.Children && node.Children.length > 0;

    public async ngOnInit(): Promise<void> {
        this.busy = true;
        try {
            this.itShopConfig = (await this.projectConfig.getConfig()).ITShopConfig;
        } finally {
            this.busy = false;
        }
        this.reload();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.UID || changes.TableName || changes.UID_Person) {
            this.reload();
        }
    }

    public ngOnDestroy(): void {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    public async openRequestDetail(node: SourceNodeEnriched): Promise<void> {
        const uidPwo = DbObjectKey.FromXml(node.ObjectKey).Keys[0];

        let data: RequestDetailParameter;
        const overlay = this.loader.show();
        try {
            const collection = await this.apiClient.typedClient.PortalItshopRequests.Get({
                uidpwo: uidPwo
            });
            if (collection.Data.length < 0) {
                throw new Error(await this.translator.get("#LDS#The request could not be found. You may not have permission to view this request.").toPromise())
            }
            const pwoEntity = collection.Data[0];

            const requestData = new ItshopRequestData({ ...collection.extendedData, index: 0 });
            const parameterColumns = this.itshopRequestService.createParameterColumns(
                pwoEntity.GetEntity(),
                requestData.parameters
            );
            const request = new ItshopRequest(pwoEntity.GetEntity(), requestData.pwoData, parameterColumns, this.currentUserId);

            data = {
                isReadOnly: true,
                personWantsOrg: request,
                itShopConfig: this.itShopConfig,
                userUid: this.currentUserId
            };
        } finally {
            this.loader.hide(overlay);
        }

        if (data) {
          // We need to find the node with the object display that matches the assignment Display
          const parameterizedText = data.personWantsOrg.GetEntity().GetColumn('Assignment').GetDisplayValue();
          const parentNode = this.dataSource.data.find(item => item.Description.value === parameterizedText);

            this.sidesheet.open(RequestDetailComponent, {
                title: await this.translator.get('#LDS#Heading View Request Details').toPromise(),
                subTitle: parentNode && parentNode.TextTokens ? parentNode.TextTokens.map(token => token.value).join('') : undefined,
                testId: 'sourcedetective-request-details-sidesheet',
                padding: '0px',
                width: 'max(700px, 40%)',
                data
            });
        }
    }

    public grabText(node: SourceNodeEnriched, textTokens: TextToken[]): void {
      // Set the parameter-filled text tokens back into the node
      node.TextTokens = textTokens;
    }

    private isDirectAssignment(node: SourceNode): boolean {
        // nodes that cannot be analyzed further
        return !node.ObjectKey;
    }

    private isByDynamicGroup(node: SourceNode): boolean {
        return node.ObjectType === 'DynamicGroup';
    }

    private async getObjectTypeDisplay(node: SourceNode): Promise<string> {
        if (!node.ObjectType) { return ''; }
        await this.metadata.update([node.ObjectType]);

        return this.metadata.tables[node.ObjectType].DisplaySingular;
    }

    private async reload(): Promise<void> {
        if (this.UID && this.TableName && this.UID_Person) {
            this.dataReady = false;
            this.busy = true;

            try {
                const data = await this.apiClient.client.portal_detective_get(this.UID_Person, this.TableName, this.UID);
                this.dataSource.data = await this.Enrich(data);
            } finally {
                this.busy = false;
                this.dataReady = true;
            }
        }
    }

    private async Enrich(nodes: SourceNode[], level: number = 0): Promise<SourceNodeEnriched[]> {
        const result: SourceNodeEnriched[] = [];
        for (const node of nodes) {
            const children = node.Children ? await this.Enrich(node.Children, level + 1) : [];
            result.push({
                ...node,
                Level: level,
                Description: await this.getParametrizedText(node),
                ObjectTypeDisplay: await this.getObjectTypeDisplay(node),
                Children: children
            });
        }
        return result;
    }

    private async getParametrizedText(node: SourceNode): Promise<ParameterizedText> {
        return {
            value: await this.GetDescription(node),
            marker: { start: '"%', end: '%"' },
            getParameterValue: (columnName: string) => node.ObjectDisplayParameters[columnName]
        };
    }

    private async GetDescription(node: SourceNode): Promise<string> {
        const tableName = node.ObjectKey ? DbObjectKey.FromXml(node.ObjectKey).TableName : null;
        if (this.isDirectAssignment(node)) {
            if ('Person' === tableName) {
                return this.translationProvider.Translate('#LDS#The identity is directly assigned to this object.').toPromise();
            }
            return this.translationProvider.Translate('#LDS#The entitlement is directly assigned to this object.').toPromise();
        }
        else if (this.isByDynamicGroup(node)) {
            return this.translationProvider.Translate('#LDS#The identity is a member of the dynamic role.').toPromise();
        }
        else if (['Org', 'Locality', 'ProfitCenter', 'Department', 'AERole'].includes(tableName)) {
            return this.translationProvider.Translate({
                key: '#LDS#Primary assignment: {0} {1}',
                parameters: [await this.getObjectTypeDisplay(node), node.ObjectDisplay]
            }).toPromise();
        }
        else if ('Person' === tableName) {
            return this.translationProvider.Translate('#LDS#The identity is a primary member of this role.').toPromise();
        }
        else if ('PersonWantsOrg' === tableName) {
            return this.translationProvider.Translate('#LDS#The assignment was made by a request.').toPromise();
        }
        return node.ObjectDisplay;
    }
}
