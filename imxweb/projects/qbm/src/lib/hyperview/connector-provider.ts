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

import { HvSettings } from './hyperview-types';
import { Connector } from './connector';

export interface IConnectorProvider {
    getConnectors(settings: HvSettings): Connector[];
}

export class ConnectorProvider implements IConnectorProvider {

    private hierarchical: boolean;

    constructor(hierarchical: boolean) {
        this.hierarchical = hierarchical;
    }

    public getConnectors(settings: HvSettings): Connector[] {
        const es = settings.elements;
        const res: Connector[] = [];
        for (let i = 1; i < es.length; i++) {
            const srcIndex = this.hierarchical ? 0 : i - 1;
            res.push(new Connector(es[srcIndex].element, es[i].element));
        }
        return res;
    }
}
