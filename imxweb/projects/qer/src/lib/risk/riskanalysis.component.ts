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

import { Component, Input, OnInit } from "@angular/core";
import { ImxTranslationProviderService, MetadataService } from 'qbm';
import { RiskObject } from 'imx-api-qer';
import { DbObjectKey } from 'imx-qbm-dbts';
import { QerApiService } from "../qer-api-client.service";
import { NestedTreeControl } from "@angular/cdk/tree";
import { MatTreeNestedDataSource } from "@angular/material/tree";


type RiskObjectEnriched = RiskObject &
{
	Children: RiskObjectEnriched[];
	DisplayValue1: string;
	TableNameSource: string;
	DisplayType: string;
}

@Component({
	templateUrl: "./riskanalysis.component.html",
	styleUrls: ['./riskanalysis.component.scss'],
	selector: 'imx-riskindex-analysis'
})
export class RiskAnalysisComponent implements OnInit {
	constructor(private translator: ImxTranslationProviderService,
		private readonly qerApiService: QerApiService,
		private metadata: MetadataService) { }

	IsFromAttribute(x: RiskObject): boolean {
		return ["INC", "DEC"].includes(x.TypeOfCalculation);
	}

	busy = true;
	Description: string;
	private TextAvg: string;
	private TextMax: string;

	@Input() objectKey: string;

	treeControl = new NestedTreeControl<RiskObjectEnriched>(node => node.Children);
	dataSource = new MatTreeNestedDataSource<RiskObjectEnriched>();

	hasChild = (_: number, node: RiskObjectEnriched) => !!node.Children && node.Children.length > 0;

	async ngOnInit(): Promise<void> {

		try {

			const key = DbObjectKey.FromXml(this.objectKey);

			const serverRiskObjects = await this.qerApiService.client.portal_risk_analyze_get(key.TableName,
				key.Keys[0],
				{
					IncludeZeroRisk: false /* do not return functions that don't return to the calculated risk*/
				}
			);

			// enrich the server objects with client-side values
			this.RiskObject = await Promise.all(serverRiskObjects.map(async x => {
				return await this.Enrich(x);
			}));

			this.Description = 0 < this.RiskObject.filter(r => ['MX1', 'AV1'].includes(r.TypeOfCalculation)).length

				?
				// new calculation rules MX1/AV1
				await this.translator.Translate("#LDS#The following properties and assignments contribute to the calculated risk index.").toPromise()
				+ " " +
				await this.translator.Translate("#LDS#The calculated risk index is the sum of all attribute-based values and the maximum of all assignment-base values.").toPromise()
				:
				// legacy
				await this.translator.Translate("#LDS#The following properties and assignments contribute to the calculated risk index.").toPromise();

			this.TextAvg = await this.translator.Translate("#LDS#Average").toPromise();
			this.TextMax = await this.translator.Translate("#LDS#Maximum").toPromise();

			this.dataSource.data = this.RiskObject;
		}
		finally {

			this.busy = false;
		}
	}

	private async Enrich(x: RiskObject): Promise<RiskObjectEnriched> {
		const tableNameSource = x.ObjectKeySource ? DbObjectKey.FromXml(x.ObjectKeySource).TableName : "";
		const displayType = parent ?
			(!x.ObjectKeySource
				? (await this.metadata.GetTableMetadata(DbObjectKey.FromXml(x.ObjectKeyTarget).TableName)).DisplaySingular
				: (await this.metadata.GetTableMetadata(tableNameSource)).DisplaySingular)
			: !x.ObjectKeySource
				? await this.translator.Translate("#LDS#Property").toPromise()
				: await this.translator.Translate("#LDS#Assignment").toPromise();

		var children: RiskObjectEnriched[];
		if (x.Children) {
			children = [];
			for (var c of x.Children)
				children.push(await this.Enrich(c));
		}

		return {
			...x,
			Children: children,
			DisplayValue1: this.GetDisplayValue1(x),
			TableNameSource: tableNameSource,
			DisplayType: displayType
		};
	}

	DisplayTypeOfCalculation(cRiskIndex: RiskObject): string {
		return ['AV1', 'AVG'].includes(cRiskIndex.TypeOfCalculation) ? this.TextAvg
			: ['MX1', 'MAX'].includes(cRiskIndex.TypeOfCalculation) ? this.TextMax : "";
	}


	DisplayWeight(r: RiskObject): string {
		return this.IsIncOrDec(r) ? "" : r.Weight.toFixed(4);
	}

	IsIncOrDec(r: RiskObject): boolean {
		return ['INC', 'DEC'].includes(r.TypeOfCalculation);
	}

	/** Contains the top-level risk objects */
	RiskObject: RiskObjectEnriched[] = [];

	/** Calculates the risk index based on the source values. */
	GetResultRisk(): number {
		const topLevel = this.RiskObject;
		const v1 = topLevel.filter(x => !['MX1', 'AV1'].includes(x.TypeOfCalculation)).map(x => x.SourceValue * x.Weight).reduce((x, y) => x + y, 0);

		const v2 = topLevel.filter(x => ['MX1', 'AV1'].includes(x.TypeOfCalculation)).map(x => x.SourceValue * x.Weight).reduce((x, y) => x > y ? x : y, 0);

		const unbound = v1 + v2;
		if (unbound < 0)
			return 0;
		if (unbound > 1)
			return 1;
		return unbound;
	}

	GetRiskObjectTop(): RiskObject {
		// which value is the maximum of all MX1/AV1 values?
		const objects = this.RiskObject
			.filter(m => ['MX1', 'AV1'].includes(m.TypeOfCalculation))
			.sort((a, b) => {
				return (a.SourceValue * a.Weight) - (b.SourceValue * b.Weight);
			})
			.reverse();

		if (objects.length > 0) {
			return objects[0];
		}
		return null;
	}


	GetDisplayValue1(riskObject: RiskObject): string {
		if (['INC', 'MAX', 'AVG'].includes(riskObject.TypeOfCalculation)) {
			return (1 * (riskObject.SourceValue)).toFixed(4);
		}
		if (riskObject.TypeOfCalculation == 'DEC') {
			return (riskObject.Weight * (0 - (riskObject.SourceValue))).toFixed(4);
		}
		return riskObject.SourceValue.toFixed(4);
	}

	public IsShowChildSourceDisplay(child: RiskObject) {
		return ['MX1', 'AV1', 'MAX', 'AVG'].includes(child.TypeOfCalculation) && !child.ObjectKeySource;
	}

	public GetRiskCalcFormula(node: RiskObject) {
		return node.SourceValue.toFixed(4) + ' * ' + node.Weight.toFixed(4) + ' / ' +
			node.CalculationBase.toFixed(4);
	}

	public LdsMaximumOfAllAssignments = '#LDS#Maximum of all assignments';
}
