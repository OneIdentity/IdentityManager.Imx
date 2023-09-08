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

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import cytoscape, { NodeSingular, EdgeSingular} from 'cytoscape';
import { EdgeTypes, SidesheetText } from './approval-workflow-edit/approval-workflow.model';
import { AwmColorsService } from './awm-colors.service';

@Injectable({
  providedIn: 'root'
})
export class ApprovalWorkflowConstantsService {

  public graphClasses = {
    edgeRoot: 'edge-root',
    edgeProposedRoot: 'edge-proposed-root',
    edgeStep: 'edge-step',
    edgeApproval: 'edge-approval',
    edgeReject:'edge-reject',
    edgeEscalation: 'edge-escalation',
    edgeReroute: 'edge-reroute',
    nodeRoot: 'node-root',
    nodeStep: 'node-step',
    nodeLevel: 'node-level',
    hover: 'hover'
  };

  public edgeTypes: EdgeTypes = {
    root: {
      type: 'rootEdge',
      color: this.colorService.colorValues.EdgeRoot,
      style: 'solid',
      class: this.graphClasses.edgeRoot
    },
    approval: {
      display: 'Approval',
      type: 'PositiveSteps',
      color: this.colorService.colorValues.EdgeApproval,
      style: 'solid',
      icon: 'check',
      class: this.graphClasses.edgeApproval
    },
    reject: {
      display: 'Rejection',
      type: 'NegativeSteps',
      color: this.colorService.colorValues.EdgeReject,
      style: 'solid',
      icon: 'stop',
      class: this.graphClasses.edgeReject
    },
    escalation: {
      display: 'Escalation',
      type: 'EscalationSteps',
      color: this.colorService.colorValues.EdgeEscalation,
      style: 'solid',
      icon: 'levelup',
      class: this.graphClasses.edgeEscalation
    },
    reroute: {
      display: 'Redirect',
      type: 'DirectSteps',
      color: this.colorService.colorValues.EdgeRedirect,
      style: 'solid',
      icon: 'refresh',
      class: this.graphClasses.edgeReroute

    },
    unfinished: {
      display: 'Unfinished',
      type: 'unfinishedEdge',
      color: this.colorService.colorValues.NodeLevel,
      style: 'dashed',
    },
  };

  public domClasses = {
    container: 'cytoscape-dom-container',
    contextMenusContainer: 'cytoscape-dom-context-menus-container',
    contextMenusItem: 'cytoscape-dom-context-menus-item',
    nodeRoot: 'cytoscape-root-node',
    nodeLevel: 'cytoscape-level-node',
    nodeStep: 'cytoscape-step-node',
    edge: 'cytoscape-edge',
  };

  public messageText: {
      allReachable: string,
      nodeDuplicate: string,
      edgeAlreadyExists: string,
      noRedirectWithMultipleSubLevels: string,
      edgeOnOtherNode: string,
      edgesUnfinished: string,
      allGood: string,
  };

  public sidesheetText: {
    editWorkflow: SidesheetText,
    newLevel: SidesheetText,
    editLevel: SidesheetText,
    newStep: SidesheetText,
    editStep: SidesheetText
  }


  constructor(
    private colorService: AwmColorsService,
    private translate: TranslateService
  ) { }

  public createCytoscape(id: string, rootId: string): cytoscape.Core {
    return cytoscape({
      container: document.getElementById(id),
      layout: {
        name: 'random',
      },
      style: [
        {
          // Any node with a display property
          selector: 'node[display]',
          style: {
            label: 'data(display)',
            shape: 'round-rectangle',
            width: 'label',
            height: 'label',
            color: this.colorService.colorValues.Text,
            'text-valign': 'center',
            'text-halign': 'center',
            'padding-bottom': '10',
            'padding-top': '10',
          },
        },
        {
          // Parent Nodes
          selector: ':parent',
          style: {
            backgroundColor: this.colorService.colorValues.NodeLevel,
            color: this.colorService.colorValues.Text,
            // Stick label at top-inside parent
            'text-valign': 'top',
            "text-margin-y": 20,
            "text-halign": 'center',
            "padding-top": '25',
            'text-max-width': (node: NodeSingular) => node.width().toString(),
            'text-wrap': 'ellipsis',
            "font-weight": 'bold',
            "border-opacity": 1,
            "border-color": this.colorService.colorValues.Text,
            "border-width": 1
          },
        },
        // Hovered elements
        {
          selector: '.' + this.graphClasses.hover,
          style: {
            'overlay-color': (ele: NodeSingular | EdgeSingular) => ele.data('color') ?? this.colorService.colorValues.NodeLevel,
            'overlay-opacity': 0.5,
            'overlay-padding': 10,
          }
        },
        // Active and selected elements
        {
          selector: ':active, :selected',
          style: {
            'overlay-color': this.colorService.colorValues.Selected,
            'overlay-opacity': 0.5,
            'overlay-padding': 10,
          }
        },
        // Step nodes
        {
          selector: '.' + this.graphClasses.nodeStep,
          style: {
            backgroundColor: this.colorService.colorValues.NodeStep,
            'text-max-width': '200px',
            'text-wrap': 'wrap',
          },
        },
        // Root node
        {
          selector: '#' + rootId,
          style: {
            backgroundColor: this.colorService.colorValues.NodeLevel,
            'text-max-width': '400px',
            'text-wrap': 'wrap',
            "font-weight": 'bold',
            "border-opacity": 1,
            "border-color": this.colorService.colorValues.Text,
            "border-width": 1
          },
        },
        // All edges
        {
          selector: 'edge',
          style: {
            width: 5,
            'arrow-scale': 1.5,
            'target-arrow-shape': 'triangle-backcurve',
            'source-arrow-shape': 'circle',
            'curve-style': 'bezier',
            "z-compound-depth": 'bottom',
          },
        },
        // Edges with color data
        {
          selector: 'edge[color]',
          style: {
            'line-color': 'data(color)',
            'line-style': 'data(style)' as cytoscape.Css.LineStyle,
            'source-arrow-color': 'data(color)',
            'target-arrow-color': 'data(color)',
          },
        },
        // edge handler
        {
          // Color preview edge and ghost edge
          selector: '.eh-preview, .eh-ghost-edge',
          style: {
            'line-color': this.colorService.colorValues.Selected,
            'source-arrow-color': this.colorService.colorValues.Selected,
            'target-arrow-color':this.colorService.colorValues.Selected,
          },
        },
        {
          // Make sure ghost edge is invisible when preview is active
          selector: 'edge.eh-preview-active',
          style: {
            opacity: 0,
          },
        },
      ],

      // Initial viewport state
      zoom: 1,
      pan: { x: 0, y: 0 },

      // Interaction options
      selectionType: 'single',
      zoomingEnabled: true,
      wheelSensitivity: 0.25,
      maxZoom: 1.5,
      minZoom: 0.2,
      panningEnabled: true,
      autounselectify: true,
      pixelRatio: 'auto',

    });
  }

    public translateText(): void {
    // Translate snackbar messages
    this.messageText = {
      allReachable: this.translate.instant('#LDS#You cannot save the approval workflow. Not all approval levels are connected. Add connections to all approval levels.'),
      nodeDuplicate: this.translate.instant('#LDS#You cannot save the approval workflow. There are multiple approval steps with the same name. Rename the approval steps.'),
      edgeAlreadyExists: this.translate.instant('#LDS#You cannot use this connection type. This connection already exists in the approval workflow. Specify a different connection type.'),
      noRedirectWithMultipleSubLevels: this.translate.instant('#LDS#You cannot save the approval workflow. At least one approval level with multiple approval steps has an outgoing rerouting connection. Delete the rerouting connection.'),
      edgeOnOtherNode: this.translate
        .instant('#LDS#You cannot use this connection type. This connection has already been set from this approval level to another approval level.')
        ,
      edgesUnfinished: this.translate.instant('#LDS#You cannot save the approval workflow. There are connections without connection type. Specify a connection type for each connection.'),
      allGood: this.translate.instant('#LDS#The approval workflow is being saved.'),
    };

    this.sidesheetText = {
      editWorkflow: {
        Header: this.translate.instant('#LDS#Heading Edit Approval Workflow Details'),
        HelpText: this.translate.instant('#LDS#Here you can edit the details of the approval workflow.'),
      },
      newLevel: {
        Header: this.translate.instant('#LDS#Heading Create Approval Level'),
        HelpText: {
          General: this.translate.instant('#LDS#Here you can specify the details of the first approval step of the approval level.'),
          Mail: this.translate.instant('#LDS#Here you can specify the mail templates that are used for generating email notifications when a decision is made on the approval step.')
        },
      },
      editLevel: {
        Header: this.translate.instant('#LDS#Heading Edit Approval Level'),
        HelpText: this.translate.instant('#LDS#Here you can edit the details of the approval level.'),
      },
      newStep: {
        Header: this.translate.instant('#LDS#Heading Create Approval Step'),
        HelpText: {
          General: this.translate.instant('#LDS#Here you can specify the details of the approval step.'),
          Mail: this.translate.instant('#LDS#Here you can specify the mail templates that are used for generating email notifications when a decision is made on the approval step.'),
        },
      },
      editStep: {
        Header: this.translate.instant('#LDS#Heading Edit Approval Step'),
        HelpText: {
          General: this.translate.instant('#LDS#Here you can edit the details of the approval step.'),
          Mail: this.translate.instant('#LDS#Here you can specify the mail templates that are used for generating email notifications when a decision is made on the approval step.')
        },
      },
    };
  }
}
