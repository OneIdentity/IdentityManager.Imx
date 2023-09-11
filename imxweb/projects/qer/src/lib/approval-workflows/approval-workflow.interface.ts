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

import {
  PortalRequestsWorkflowsSubmethodsInteractive,
  PortalRequestsWorkflowsSubmethodsSteps,
  PortalRequestsWorkflowsSubmethodsStepsInteractive,
} from 'imx-api-qer';
import { ValueConstraint } from 'imx-qbm-dbts';
import { ColumnDependentReference } from 'qbm';

export interface GroupedData {
  General: string[];
  Mail: string[];
}

export interface GroupedHelp {
  General: string;
  Mail: string;
}

export interface RequestWorkflowData {
  Object: PortalRequestsWorkflowsSubmethodsInteractive;
  Data: string[];
  HelpText?: string;
  SaveBeforeClosing?: boolean;
}

export interface RequestLevelData {
  Object: PortalRequestsWorkflowsSubmethodsStepsInteractive;
  Data: string[];
  HelpText: string;
}
export interface RequestStepData {
  Object: PortalRequestsWorkflowsSubmethodsStepsInteractive;
  Data: GroupedData;
  HelpText: GroupedHelp;
}

export interface EditorData {
  WorkFlowKey?: string;
  WorkFlow?: PortalRequestsWorkflowsSubmethodsInteractive;
  WorkFlowSteps?: PortalRequestsWorkflowsSubmethodsSteps[];
}

export interface ColumnConstraints {
  [key: string]: {
    minLength?: number;
    valueConstraint?: ValueConstraint;
  };
}

export interface CDRGroups {
  [key: string]: ColumnDependentReference[];
}
