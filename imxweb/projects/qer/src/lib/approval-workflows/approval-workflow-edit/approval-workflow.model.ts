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

import { GroupedHelp } from "../approval-workflow.interface";

export interface ValidSave {
  isValid: boolean;
  messageTitle?: string;
  messageBody?: string;
}

export interface EdgeTypes {
  root: EdgeType;
  approval: EdgeType;
  reject: EdgeType;
  escalation: EdgeType;
  reroute: EdgeType;
  unfinished: EdgeType;
}

export interface EdgeType {
  display?: string;
  type: string;
  color: string;
  style: 'solid' | 'dotted' | 'dashed';
  icon?: 'check' | 'stop' | 'refresh' | 'levelup';
  class?: string
}

export interface LevelConnections {
  PositiveSteps: number;
  NegativeSteps: number;
  EscalationSteps: number;
  DirectSteps: string;
}

export interface SidesheetText {
  Header: string;
  HelpText: string | GroupedHelp;
}
