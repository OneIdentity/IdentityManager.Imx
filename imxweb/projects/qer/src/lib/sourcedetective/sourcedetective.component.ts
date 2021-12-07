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
 * Copyright 2021 One Identity LLC.
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
import { ImxTranslationProviderService, MetadataService, LdsReplacePipe, AuthenticationService, ParameterizedText } from 'qbm';
import { ITShopConfig, SourceNode } from 'imx-api-qer';
import { DbObjectKey } from 'imx-qbm-dbts';
import { QerApiService } from "../qer-api-client.service";
import { EuiLoadingService, EuiSidesheetService } from "@elemental-ui/core";
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

	treeControl = new FlatTreeControl<SourceNodeEnriched>(
		node => node.Level, node => this.hasChild(node));

	treeFlattener = new MatTreeFlattener<SourceNodeEnriched, SourceNodeEnriched>(x => x,
		node => node.Level, node => this.hasChild(node), node => node.Children);

	dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

	hasChild = (node: SourceNodeEnriched) => !!node.Children && node.Children.length > 0;

	async ngOnInit() {
		this.itShopConfig = (await this.projectConfig.getConfig()).ITShopConfig;

		this.reload();
	}

	dataReady: boolean;

	private async reload(): Promise<void> {
		if (this.UID && this.TableName && this.UID_Person) {
			this.dataReady = false;
			this.loader.show();

			try {
				const data = await this.apiClient.client.portal_detective_get(this.UID_Person, this.TableName, this.UID);
				this.dataSource.data = await this.Enrich(data);
			} finally {
				setTimeout(() => this.loader.hide(), 1000);
				this.dataReady = true;
			}
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.UID || changes.TableName || changes.UID_Person) {
			this.reload();
		}
	}

	public ngOnDestroy(): void {
		this.subscriptions.forEach(s => s.unsubscribe());
	}

	private async Enrich(nodes: SourceNode[], level = 0): Promise<SourceNodeEnriched[]> {
		const result: SourceNodeEnriched[] = [];
		for (const node of nodes) {
			const children = node.Children ? await this.Enrich(node.Children, level + 1) : null;
			result.push({
				...node,
				Level: level,
				Description: await this.GetParametrizedText(node),
				ObjectTypeDisplay: await this.GetObjectTypeDisplay(node),
				Children: children
			});
		}
		return result;
	}

	private async GetParametrizedText(node: SourceNode): Promise<ParameterizedText> {
		return {
			value: await this.GetDescription(node),
			marker: { start: '"%', end: '%"' },
			getParameterValue: columnName => node.ObjectDisplayParameters[columnName]
		};
	}

	private async GetDescription(node: SourceNode): Promise<string> {
		const tableName = node.ObjectKey ? DbObjectKey.FromXml(node.ObjectKey).TableName : null;
		if (this.IsDirectAssignment(node))
			return await this.translationProvider.Translate("#LDS#The identity is directly assigned to this object.").toPromise();
		else if (this.IsByDynamicGroup(node))
			return await this.translationProvider.Translate("#LDS#The identity is a member of the dynamic role.").toPromise();
		else if (['Org', 'Locality', 'ProfitCenter', 'Department', 'AERole'].includes(tableName))
			return await this.translationProvider.Translate({
				key: "#LDS#Primary assignment: {0} {1}",
				parameters: [await this.GetObjectTypeDisplay(node), node.ObjectDisplay]
			}).toPromise();
		else if ('Person' == tableName)
			return await this.translationProvider.Translate('#LDS#The identity is a primary member of this role.').toPromise();
		else if ('PersonWantsOrg' == tableName)
			return await this.translationProvider.Translate('#LDS#The assignment was made by a request.').toPromise();
		else
			return node.ObjectDisplay;
	}

	async GetObjectTypeDisplay(node: SourceNode) {
		if (!node.ObjectType)
			return null;
		return (await this.metadata.GetTableMetadata(node.ObjectType)).DisplaySingular;
	}

	public IsDirectAssignment(node: SourceNode) {
		// nodes that cannot be analyzed further
		return !node.ObjectKey;
	}

	public IsByDynamicGroup(node: SourceNode) {
		return node.ObjectType == "DynamicGroup";
	}

	@Input() public UID_Person: string;
	@Input() public TableName: string;
	@Input() public UID: string;
	@Input() public Type: SourceDetectiveType;

	SourceDetectiveType = SourceDetectiveType;

	public async openRequestDetail(node: SourceNodeEnriched): Promise<void> {
		const uidPwo = DbObjectKey.FromXml(node.ObjectKey).Keys[0];

		const collection = await this.apiClient.typedClient.PortalItshopRequests.Get({
			uidpwo: uidPwo
		});
		const pwoEntity = collection.Data[0];

		const requestData = new ItshopRequestData({ ...collection.extendedData, index: 0 });
		const parameterColumns = this.itshopRequestService.createParameterColumns(
			pwoEntity.GetEntity(),
			requestData.parameters
		);
		const request = new ItshopRequest(pwoEntity.GetEntity(), requestData.pwoData, parameterColumns, this.currentUserId);

		const data: RequestDetailParameter = {
			isReadOnly: true,
			personWantsOrg: request,
			itShopConfig: this.itShopConfig,
			userUid: this.currentUserId
		};

		this.sidesheet.open(RequestDetailComponent, {
			title: await this.translator.get('#LDS#Heading View Request Details').toPromise(),
			headerColour: 'iris-blue',
			padding: '0px',
			width: '600px',
			data: data
		});
	}
}
