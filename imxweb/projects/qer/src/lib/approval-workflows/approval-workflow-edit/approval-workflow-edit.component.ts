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

import { Component, HostListener, Inject, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { EuiSidesheetRef, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { PortalRequestsWorkflowsSubmethodsInteractive, PortalRequestsWorkflowsSubmethodsSteps, PortalRequestsWorkflowsSubmethodsStepsInteractive, WorkflowStepBulkData } from 'imx-api-qer';
import { ClassloggerService, SnackBarService, ConfirmationService } from 'qbm';
import { ApprovalWorkflowDataService } from '../approval-workflow-data.service';
import { Subscription } from 'rxjs';
import { ApprovalWorkflowFormComponent } from '../approval-workflow-form/approval-workflow-form.component';
import { RequestLevelData, RequestStepData, RequestWorkflowData, EditorData, GroupedHelp } from '../approval-workflow.interface';

import cytoscape, {
  Core,
  EdgeDataDefinition,
  EdgeDefinition,
  EdgeSingular,
  EventObject,
  GridLayoutOptions,
  NodeCollection,
  NodeDataDefinition,
  NodeDefinition,
  NodeSingular,
  Position
} from 'cytoscape';
import edgehandles, { EdgeHandlesInstance } from 'cytoscape-edgehandles';
import _ from 'lodash';
import { DomManagerService } from './dom-manager.service';
import { ApprovalWorkflowConstantsService } from '../approval-workflow-constants.service';
import { ApprovalLevelFormComponent } from '../approval-level-form/approval-level-form.component';
import { ApprovalStepFormComponent } from '../approval-step-form/approval-step-form.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { ApprovalWorkflowEditInfoComponent } from './approval-workflow-edit-info/approval-workflow-edit-info.component';
import { EdgeType, LevelConnections } from './approval-workflow.model';

// Register extensions
cytoscape.use(edgehandles);

@Component({
  selector: 'imx-approval-workflow-edit',
  templateUrl: './approval-workflow-edit.component.html',
  styleUrls: ['./approval-workflow-edit.component.scss'],
})
export class ApprovalWorkflowEditComponent implements OnInit, OnDestroy {
  @ViewChild('approvalWorkflowEditForm') public approvalWorkFlowForm: ApprovalWorkflowFormComponent;
  @ViewChildren(MatMenuTrigger) public menuTriggers: QueryList<MatMenuTrigger>;

  public sliderText: string;
  public workFlowKey: string;
  public workFlow: PortalRequestsWorkflowsSubmethodsInteractive;
  public workFlowSteps: PortalRequestsWorkflowsSubmethodsSteps[];
  public standbyStepInteractive: PortalRequestsWorkflowsSubmethodsStepsInteractive;
  public standbyPromise: Promise<any>;
  public workFlowStepsInteractive: PortalRequestsWorkflowsSubmethodsStepsInteractive[] = [];
  public workFlowStepsDeleteLater: PortalRequestsWorkflowsSubmethodsStepsInteractive[] = [];

  public workFlowStepsPromises: Promise<any>[] = [];
  public workFlowStepsAddLater: string[] = [];

  public cy: Core;
  public contextMenusDomContainer: HTMLDivElement;
  public contextMenus: any;
  public focusedDiv: HTMLElement;
  public focusedElement: NodeSingular | EdgeSingular;
  public edgeHandler: EdgeHandlesInstance;
  public interactiveKeys: string[] = [];
  public fitPadding = 5;

  public menuTLPosition = {x: '0px', y: '0px'};
  // Initial state variables
  public isUpdateWorkFlow: boolean;
  public unsavedChanges = false;
  public isUnfinishedEdges = false;
  public isUpdate = false;
  public isDraw = false;
  public originalGrabbed: NodeSingular;
  public originalPosition: Position;
  public nodeNeedsUpdate: NodeCollection;

  public isCoreDisabled = false;
  public isLevelDisabled = true;
  public isStepDisabled = true;
  public isEdgeDisabled = true;

  public graphId = 'graph';
  public defaultLevelName = 'Approval Level';
  public rootId = 'root';
  public rootNode: NodeSingular;


  private readonly subscriptions: Subscription[] = [];

  constructor(
    public constantsService: ApprovalWorkflowConstantsService,
    private approvalWorkflowDataService: ApprovalWorkflowDataService,
    private domManagerService: DomManagerService,
    @Inject(EUI_SIDESHEET_DATA) public data: EditorData,
    private readonly sideForm: EuiSidesheetService,
    private readonly sideSheetRef: EuiSidesheetRef,
    private readonly translate: TranslateService,
    private readonly logger: ClassloggerService,
    private readonly snackbar: SnackBarService,
    private readonly confirmation: ConfirmationService,
    private dialogService: MatDialog,
  ) {
    this.workFlowKey = data.WorkFlowKey;
    this.workFlow = data.WorkFlow;
    this.workFlowSteps = data.WorkFlowSteps;

    this.subscriptions.push(
      this.sideSheetRef.closeClicked().subscribe(async () => {
        if (!this.unsavedChanges || (await this.confirmation.confirmLeaveWithUnsavedChanges())) {
          this.sideSheetRef.close(this.isUpdate);
        }
      })
    );
  }

  public async showInfo(): Promise<void> {
    await this.dialogService.open(ApprovalWorkflowEditInfoComponent, {
      width: '500px'
    }).afterClosed().toPromise();
  }

  // Data manipulation

  public getNodes(attribute: string, value: string): NodeCollection {
    return this.cy.nodes('[' + attribute + ' = ' + value + ']');
  }

  public isNewLevel(levelNumber: number): boolean {
    return this.getNodes('levelNumber', levelNumber.toString()).length === 0;
  }

  public getNodeIdFromLevelNumber(level: number): string {
    return this.getNodes('levelNumber', level.toString()).first().id();
  }

  public async getIndexFromKey(key: string): Promise<number> {
    const index = this.interactiveKeys.indexOf(key);
    // Check if we finished loading, if not then wait for all
    if (this.workFlowStepsInteractive[index] === undefined) {
      await this.approvalWorkflowDataService.waitForPromises([this.workFlowStepsPromises[index]]);
    }
    return index;
  }

  public getNodeFromKey(key: string): NodeSingular {
    return this.getNodes('key', '"' + key + '"').first();
  }

  public ngOnInit(): void {
    this.constantsService.translateText();
    this.sideSheetRef.componentInstance.onOpen().subscribe(() => {
      this.setupGraph();
      this.setupGraphData();
      this.alignWorkFlow();
      this.approvalWorkflowDataService.handleCloseLoader();
      this.backgroundCalls();
    });
  }

  public switchGraphMode(): void {
    this.isDraw = !this.isDraw;
    if (this.isDraw) {
      this.edgeHandler.enableDrawMode();
      this.domManagerService.toggleOnDomElements([this.constantsService.domClasses.nodeRoot, this.constantsService.domClasses.edge, this.constantsService.domClasses.nodeLevel]);
      this.domManagerService.toggleOffDomElements([this.constantsService.domClasses.nodeStep]);
    } else {
      this.deselectAll();
      // Disable drawing
      this.edgeHandler.disableDrawMode();
      this.domManagerService.toggleOffDomElements([this.constantsService.domClasses.edge, this.constantsService.domClasses.nodeLevel]);
      this.domManagerService.toggleOnDomElements([this.constantsService.domClasses.nodeRoot, this.constantsService.domClasses.nodeStep]);
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.edgeHandler.destroy();
  }

  public async getNextStep(): Promise<void> {
    if (Promise.all([this.standbyPromise])) {
      // If we aren't already waiting, then make a new call
      this.standbyStepInteractive = undefined;
      this.standbyPromise = this.approvalWorkflowDataService.getNewWorkflowStep(this.workFlowKey).then((step) => {
        this.standbyStepInteractive = step;
      });
    }
  }

  public backgroundCalls(): void {
    for (const step of this.workFlowSteps) {
      const stepKey = step.GetEntity().GetKeys()[0];
      this.interactiveKeys.push(stepKey);
      this.workFlowStepsInteractive.push(undefined);
      const stepPromise = this.approvalWorkflowDataService
        .getWorkFlowStepsInteractive(this.workFlowKey, stepKey)
        .then((stepInteractive) => {
          const stepInteractiveKey = stepInteractive.GetEntity().GetKeys()[0];
          const index = this.interactiveKeys.indexOf(stepInteractiveKey);
          this.workFlowStepsInteractive[index] = stepInteractive;
        });
      this.workFlowStepsPromises.push(stepPromise);
    }
    this.getNextStep();
  }

  public isEveryNodeReachable(): boolean {
    // Here we check but also save levelNumbers off
    const walkableNodes = this.cy.elements(':compound').union(this.rootNode);
    const nNodes = walkableNodes.nodes().length - 1;
    const bfs = walkableNodes.bfs({
      directed: true,
      root: '#' + this.rootId,
      visit: (currentNode: NodeSingular, e, u, iVisited: number) => {
        if (currentNode.id() !== this.rootId) {
          // Account for the root node being the first visited
          const newLevelNumber = iVisited - 1;
          currentNode.data('levelNumber', newLevelNumber);
          currentNode
            .outgoers()
            .edges()
            .forEach((edge) => {
              edge.data('sourceLevelNumber', newLevelNumber);
            });
          currentNode
            .incomers()
            .edges()
            .forEach((edge) => {
              edge.data('targetLevelNumber', newLevelNumber);
            });
        }
        if (iVisited === nNodes) {
          return true;
        }
      },
    });
    return bfs.found.length === 1;
  }

  public isMultiReroutePresent(): boolean {
    const selector = '[type = "' + this.constantsService.edgeTypes.reroute.type + '"]';
    const rerouteEdgesWithMultipleChildren = this.cy.edges(selector).toArray().filter(edge => {
      return edge.source().children().length > 1;
    });
    return rerouteEdgesWithMultipleChildren.length > 0;
  }

  public isEveryNodeUnique(): boolean {
    const nodeNames: string[] = this.cy.nodes(':child').toArray().map(node => node.data('display'));
    const uniqueNames = new Set(nodeNames);
    return nodeNames.length === uniqueNames.size;
  }

  public isEveryEdgeFinished(): boolean {
    const selector = '[type = "' + this.constantsService.edgeTypes.unfinished.type + '"]';
    return this.cy.edges(selector).length === 0;
  }

  public async checkValidData(): Promise<boolean> {
    if (!this.isEveryNodeReachable()) {
      this.openSnackbar(this.constantsService.messageText.allReachable);
      return false;
    }
    if (!this.isEveryEdgeFinished()) {
      this.openSnackbar(this.constantsService.messageText.edgesUnfinished);
      return false;
    }
    if (!this.isEveryNodeUnique()) {
      this.openSnackbar(this.constantsService.messageText.nodeDuplicate);
      return false;
    }
    if (this.isMultiReroutePresent()) {
      this.openSnackbar(this.constantsService.messageText.noRedirectWithMultipleSubLevels);
      return false;
    }
    this.openSnackbar(this.constantsService.messageText.allGood);
    return true;
  }

  public async saveChanges(): Promise<void> {
    try {
      this.approvalWorkflowDataService.handleOpenLoader();
      // Make sure all workflow pieces are ready to be saved
      const isValid = await this.checkValidData();
      if (this.unsavedChanges && isValid) {
        this.logger.debug(this, 'Saving workflow changes');
        await this.saveWorkFlow();
        await this.saveSteps();
        this.unsavedChanges = false;
        this.isUpdate = true;
      }
    } finally {
      this.approvalWorkflowDataService.handleCloseLoader();
    }
  }

  public async saveWorkFlow(): Promise<void> {
    if (this.isUpdateWorkFlow) {
      this.logger.debug(this, 'Saving workflow: ', this.workFlow.Ident_PWODecisionSubMethod);
      try {
        await this.workFlow.GetEntity().Commit(true);
      } finally {
        this.isUpdateWorkFlow = false;
      }
    }
  }

  public async saveSteps(): Promise<void> {
    this.approvalWorkflowDataService.handleOpenLoader();
    try {
      const diffData: WorkflowStepBulkData[] = [];
      for (const node of this.cy.nodes(':child').toArray()) {
        const parentNode = node.parent().first();
        const levelDisplay = this.getLevelDisplay(parentNode);
        const levelNumber = parentNode.data('levelNumber');
        const levelConnections = this.grabEdges(parentNode);
        await this.writeStepValues(node, levelNumber, levelDisplay, levelConnections);
        const index = await this.getIndexFromKey(node.data('key'));
        diffData.push(this.workFlowStepsInteractive[index].GetEntity().GetDiffData());
      }
      // Add delete calls
      for (const deleteStep of this.workFlowStepsDeleteLater) {
        diffData.push(deleteStep.GetEntity().GetDiffData());
      }
      await this.approvalWorkflowDataService.saveDiffData(diffData);
      this.workFlowStepsAddLater = [];
      this.workFlowStepsDeleteLater = [];
      this.resetInteractiveEntities();
    } finally {
      this.approvalWorkflowDataService.handleCloseLoader();
    }
  }

  public async resetInteractiveEntities(): Promise<void> {
    this.workFlowSteps = await this.approvalWorkflowDataService.getWorkFlowSteps(this.workFlowKey);
    this.backgroundCalls();
  }

  public async writeStepValues(
    node: NodeSingular,
    levelNumber: number,
    levelDisplay: string,
    levelConnections: LevelConnections
  ): Promise<void> {
    const index = await this.getIndexFromKey(node.data('key'));
    const subLevelNumber = node.data('subLevelNumber');
    const stepInteractive = this.workFlowStepsInteractive[index];

    if (stepInteractive.GetEntity().GetColumn('LevelDisplay').GetValue() !== levelDisplay) {
      await stepInteractive.GetEntity().GetColumn('LevelDisplay').PutValue(levelDisplay);
    }
    if (stepInteractive.GetEntity().GetColumn('LevelNumber').GetValue() !== levelNumber) {
      await stepInteractive.GetEntity().GetColumn('LevelNumber').PutValueStruct({
        DataValue: levelNumber,
        DisplayValue: levelNumber.toString(),
      });
    }
    if (stepInteractive.GetEntity().GetColumn('SubLevelNumber').GetValue() !== subLevelNumber) {
      await stepInteractive.GetEntity().GetColumn('SubLevelNumber').PutValueStruct({
        DataValue: subLevelNumber,
        DisplayValue: subLevelNumber.toString(),
      });
    }
    if (stepInteractive.GetEntity().GetColumn('PositiveSteps').GetValue() !== levelConnections.PositiveSteps) {
      await stepInteractive.GetEntity().GetColumn('PositiveSteps').PutValueStruct({
        DataValue: levelConnections.PositiveSteps,
        DisplayValue: levelConnections.PositiveSteps.toString(),
      });
    }
    if (stepInteractive.GetEntity().GetColumn('NegativeSteps').GetValue() !== levelConnections.NegativeSteps) {
      await stepInteractive.GetEntity().GetColumn('NegativeSteps').PutValueStruct({
        DataValue: levelConnections.NegativeSteps,
        DisplayValue: levelConnections.NegativeSteps.toString(),
      });
    }
    if (stepInteractive.GetEntity().GetColumn('EscalationSteps').GetValue() !== levelConnections.EscalationSteps) {
      await stepInteractive.GetEntity().GetColumn('EscalationSteps').PutValueStruct({
        DataValue: levelConnections.EscalationSteps,
        DisplayValue: levelConnections.EscalationSteps.toString(),
      });
    }
    if (stepInteractive.GetEntity().GetColumn('DirectSteps').GetValue() !== levelConnections.DirectSteps) {
      await stepInteractive.GetEntity().GetColumn('DirectSteps').PutValueStruct({
        DataValue: levelConnections.DirectSteps,
        DisplayValue: levelConnections.DirectSteps,
      });
    }
  }

  public getLevelDisplay(parentNode: NodeSingular): string {
    return parentNode.data('display') === this.defaultLevelName ? '' : parentNode.data('display');
  }

  public grabEdges(parentNode: NodeSingular): LevelConnections {
    const levelConnections: LevelConnections = {
      PositiveSteps: 0,
      NegativeSteps: 0,
      EscalationSteps: 0,
      DirectSteps: '',
    };
    let outgoingValue: number;
    parentNode
      .outgoers()
      .edges()
      .forEach((edge) => {
        outgoingValue = edge.data('targetLevelNumber') - edge.data('sourceLevelNumber');
        if (edge.data('type') === this.constantsService.edgeTypes.approval.type) {
          levelConnections.PositiveSteps = outgoingValue;
        } else if (edge.data('type') === this.constantsService.edgeTypes.reject.type) {
          levelConnections.NegativeSteps = outgoingValue;
        } else if (edge.data('type') === this.constantsService.edgeTypes.escalation.type) {
          levelConnections.EscalationSteps = outgoingValue;
        } else if (edge.data('type') === this.constantsService.edgeTypes.reroute.type) {
          levelConnections.DirectSteps = outgoingValue.toString();
        }
      });
    return levelConnections;
  }

  public createRoot(): void {
    const display = this.workFlow.GetEntity().GetColumn('Ident_PWODecisionSubMethod').GetValue();
    const nodeData: NodeDataDefinition = {
      id: this.rootId,
      levelNumber: -1,
      display,
    };
    this.rootNode = this.cy.add({ data: nodeData, classes: this.constantsService.graphClasses.nodeRoot });
  }

  public createParent(step: PortalRequestsWorkflowsSubmethodsStepsInteractive): NodeDefinition {
    const levelNumber = step.GetEntity().GetColumn('LevelNumber').GetValue();
    const display =
      step.GetEntity().GetColumn('LevelDisplay').GetValue() !== ''
        ? step.GetEntity().GetColumn('LevelDisplay').GetValue()
        : this.defaultLevelName;
    const node: NodeDataDefinition = {
      display,
      levelNumber,
    };
    node[this.constantsService.edgeTypes.approval.type] = step.GetEntity().GetColumn('PositiveSteps').GetValue();
    node[this.constantsService.edgeTypes.reject.type] = step.GetEntity().GetColumn('NegativeSteps').GetValue();
    node[this.constantsService.edgeTypes.escalation.type] = step.GetEntity().GetColumn('EscalationSteps').GetValue();
    // Reroute is strange as it is a string
    const reroute =
      step.GetEntity().GetColumn('DirectSteps').GetValue() !== '' ? parseInt(step.GetEntity().GetColumn('DirectSteps').GetValue(), 10) : 0;
    node[this.constantsService.edgeTypes.reroute.type] = reroute;
    return { data: node, classes: this.constantsService.graphClasses.nodeLevel };
  }

  public createNodes(steps: PortalRequestsWorkflowsSubmethodsStepsInteractive[]): void {
    const nodes: NodeDefinition[] = [];
    steps.forEach((step) => {
      let nodeData: NodeDefinition;
      let parentNodeId: string;
      const levelNumber = step.GetEntity().GetColumn('LevelNumber').GetValue();
      if (this.isNewLevel(levelNumber)) {
        const parentNodeData = this.createParent(step);
        parentNodeId = this.cy.add(parentNodeData).id();
      } else {
        parentNodeId = this.getNodeIdFromLevelNumber(levelNumber);
      }
      nodeData = this.createNode(step, parentNodeId);
      nodes.push(nodeData);
    });
    this.cy.add(nodes);
  }

  public formatDisplay(step: PortalRequestsWorkflowsSubmethodsStepsInteractive): string {
    return (
      step.GetEntity().GetColumn('Ident_PWODecisionStep').GetValue() +
      ' (' +
      step.GetEntity().GetColumn('UID_PWODecisionRule').GetDisplayValue() +
      ')'
    );
  }

  public createNode(step: PortalRequestsWorkflowsSubmethodsStepsInteractive, parentId: string): NodeDefinition {
    const subLevelNumber = step.GetEntity().GetColumn('SubLevelNumber').GetValue();
    const key = step.GetEntity().GetKeys()[0];
    const node: NodeDataDefinition = {
      parent: parentId,
      subLevelNumber,
      display: this.formatDisplay(step),
      key,
    };
    return { data: node, classes: this.constantsService.graphClasses.nodeStep };
  }

  public createEdges(parentNodes: NodeCollection): void {
    let fromId: string;
    let toId: string;
    let fromLevel: number;
    let toLevel: number;
    let relativeLevel: number;
    const edges: EdgeDefinition[] = [];
    parentNodes.forEach((parentNode) => {
      fromId = parentNode.id();
      fromLevel =  parentNode.data('levelNumber');
      // Check each edge type
      [this.constantsService.edgeTypes.approval, this.constantsService.edgeTypes.reject, this.constantsService.edgeTypes.escalation, this.constantsService.edgeTypes.reroute].forEach(edgeType => {
        relativeLevel = parentNode.data(edgeType.type);
        if (relativeLevel !== 0) {
          toLevel = fromLevel + relativeLevel;
          toId = this.getNodeIdFromLevelNumber(toLevel);
          edges.push(this.createEdge({
            fromId,
            toId,
            fromLevel,
            toLevel,
            edgeType,
            edgeClass: [this.constantsService.graphClasses.edgeStep, edgeType?.class]
          }))
        }
      })
      if (fromLevel === 0) {
        edges.push(this.createEdgeRoot(fromId, fromLevel));
      }
    });
    this.cy.add(edges);
  }

  public createEdgeRoot(toId: string, toLevel: number): EdgeDefinition {
    return this.createEdge({
      fromId: this.rootId,
      toId: toId,
      fromLevel: -1,
      toLevel,
      edgeType: this.constantsService.edgeTypes.root,
      edgeClass: [this.constantsService.graphClasses.edgeRoot]});
  }

  public createEdge(
    args: {
      fromId: string,
      toId: string,
      fromLevel: number,
      toLevel: number,
      edgeType: EdgeType,
      edgeClass: string[]
    }
  ): EdgeDefinition {
    const edge: EdgeDataDefinition = {
      source: args.fromId,
      target: args.toId,
      sourceLevelNumber: args.fromLevel,
      targetLevelNumber: args.toLevel,
      display: args.edgeType.display,
      type: args.edgeType.type,
      color: args.edgeType.color,
      style: args.edgeType.style,
      icon: args.edgeType.icon,
    };
    return { data: edge, classes: args.edgeClass.join(' ') };
  }

  public setupGraph(): void {
    this.cy = this.constantsService.createCytoscape(this.graphId, this.rootId)

    // Handle compound node moving
    this.cy.on('grab', ':child', (event: EventObject) => {
      this.originalGrabbed = event.target;
      this.originalPosition = this.originalGrabbed.renderedPosition();
    });

    this.cy.on('drag', ':child', () => {
      if (this.originalGrabbed) {
        const parent = this.originalGrabbed.parent();
        const newPos = this.originalGrabbed.renderedPosition();
        const deltaVect = {
          x: newPos.x - this.originalPosition.x,
          y: newPos.y - this.originalPosition.y,
        };
        const siblings = this.originalGrabbed.siblings();
        this.originalGrabbed.siblings().forEach((node) => {
          const nodePos = node.renderedPosition();
          nodePos.x += deltaVect.x;
          nodePos.y += deltaVect.y;
          node.renderedPosition({ x: nodePos.x, y: nodePos.y });
        });
        this.originalPosition = newPos;
        // Adjust node, all siblings, parent and connected edges in dom
        const elements = this.originalGrabbed.union(siblings).union(parent).union(parent.connectedEdges());
        this.domManagerService.adjustElements(elements, this.cy.zoom(), this.cy.pan());
        this.domManagerService.checkForCollisions(this.cy.elements());
      }
    });

    this.cy.on('free', ':child', () => {
      this.originalGrabbed = null;
    });

    this.cy.on('mouseover', 'node, edge', (event: EventObject) => {
      if (event.target.hasClass(this.constantsService.graphClasses.edgeRoot)) {
        return;
      }
      document.getElementById(this.graphId).style.cursor = 'pointer';
      event.target.toggleClass(this.constantsService.graphClasses.hover);
    });

    this.cy.on('mouseout', 'node, edge', (event: EventObject) => {
      if (event.target.hasClass(this.constantsService.graphClasses.edgeRoot)) {
        return;
      }
      document.getElementById(this.graphId).style.cursor = 'move';
      event.target.toggleClass(this.constantsService.graphClasses.hover);
    });

    this.cy.on('tap', (event: EventObject) => {
      if (event.renderedPosition) {
        this.menuTLPosition.x = event.renderedPosition.x.toString() + 'px';
        this.menuTLPosition.y = event.renderedPosition.y.toString() + 'px';
      }
      if (event.target === this.cy) {
        // This was clicked on the core
        this.menuTriggers.toArray()[0].openMenu();
        return;
      }
      const id: string = event.target.id();
      this.focusedElement = this.cy.getElementById(id);
      if (this.focusedElement.hasClass(this.constantsService.graphClasses.edgeRoot)) {
        // No context menu for the root edge
        return;
      } else if (this.focusedElement.isEdge()) {
        this.menuTriggers.toArray()[2].openMenu();
      } else if (this.focusedElement.isChild()) {
        this.isStepDisabled = false;
        this.menuTriggers.toArray()[1].openMenu();
      } else if (id === this.rootId) {
        // Just directly open the sidesheet
        this.editWorkflow();
        // this.menuTriggers.toArray()[0].openMenu();
      } else if (this.focusedElement.isParent()) {
        this.isStepDisabled = true;
        this.menuTriggers.toArray()[1].openMenu();
      }
    });

    // Edge handler
    this.edgeHandler = this.cy.edgehandles({
      canConnect: (sourceNode: NodeSingular, targetNode: NodeSingular) => {
        let isAllowed = true;
        if (sourceNode.isChild()) {
          sourceNode = sourceNode.parent().first();
        }
        if (targetNode.isChild()) {
          targetNode = targetNode.parent().first();
        }

        const sourceOutDegree = sourceNode.outdegree(false);
        const existingEdgeRoot = this.cy.edges('.' + this.constantsService.graphClasses.edgeRoot).first();
        if (targetNode.id() === this.rootId) {
          // Disable edges pointing towards the root
          isAllowed = false;
        } else if (sourceNode.same(targetNode)) {
          // No loops
          isAllowed = false;
        } else if (sourceNode.id() === this.rootId && existingEdgeRoot.length > 0 && existingEdgeRoot.target().same(targetNode)) {
          // Don't allow a copy edge-root
          isAllowed = false;
        } else if (sourceOutDegree > 4) {
          // Only allow 4 edges out of a node
          isAllowed = false;
        }

        return isAllowed;
      },
      edgeParams: (sourceNode: NodeSingular, targetNode: NodeSingular) => {
        if (sourceNode.isChild()) {
          // remove class
          sourceNode = sourceNode.parent().first();
        }
        if (targetNode.isChild()) {
          targetNode = targetNode.parent().first();
        }
        return this.drawEdge(sourceNode, targetNode);
      },
      snap: false,
      noEdgeEventsInDraw: true,
      disableBrowserGestures: true,
    });
    this.edgeHandler.disableDrawMode();

    this.cy.on('ehcomplete', (
      event: EventObject, ...extraParams: any[]) => {
      // Extra params: sourceNode: NodeSingular, targetNode: NodeSingular, edge: EdgeCollection
      this.unsavedChanges = true;
      const sourceNode: NodeSingular = extraParams[0];
      const edge: EdgeSingular = extraParams.pop().first();
      // const edge = this.cy.edges().last() as EdgeSingular;
      if (edge.hasClass(this.constantsService.graphClasses.edgeProposedRoot)) {
        // Handle root swapping
        this.cy.edges('.' + this.constantsService.graphClasses.edgeRoot).remove();
        edge.classes(this.constantsService.graphClasses.edgeRoot);
        return;
      }
      // Handle adding to dom
      this.domManagerService.appendEdgeComponentRelative(edge, this.constantsService.domClasses.edge);
      this.domManagerService.adjustElements(sourceNode.connectedEdges(), this.cy.zoom(), this.cy.pan());
    });

    this.cy.on('ehpreviewon ehpreviewoff', (event: EventObject, ...extraParams: any[]) => {
      // Extra params: sourceNode: NodeSingular, targetNode: NodeSingular | null
      let sourceNode: NodeSingular = extraParams[0];
      if (sourceNode.isChild()) {
        sourceNode = sourceNode.parent().first();
      }
      this.domManagerService.adjustElements(sourceNode.connectedEdges(), this.cy.zoom(), this.cy.pan());
    });

    // DOM Configuration - add a div adjacent to graph data
    this.domManagerService.createDomContainer(this.graphId, this.constantsService.domClasses.container);

    this.cy.on('pan zoom', () => {
      this.domManagerService.adjustElements(this.cy.elements(), this.cy.zoom(), this.cy.pan());
    });

    this.cy.on('drag', 'node', (event: EventObject) => {
      const node = event.target as NodeSingular;
      if (node.isChild()) {
        // Already handled in compound dragging
        return;
      }
      // Adjust node, all children, connected edges in dom
      const elements = node.children().union(node).union(node.connectedEdges());
      this.domManagerService.adjustElements(elements, this.cy.zoom(), this.cy.pan());
      this.domManagerService.checkForCollisions(this.cy.elements());
    });
  }

  public drawEdge(sourceNode: NodeSingular, targetNode: NodeSingular): EdgeDefinition {
    let edgeDef: EdgeDataDefinition = {
      source: sourceNode.id(),
      target: targetNode.id(),
      sourceLevelNumber: sourceNode.data('levelNumber'),
      targetLevelNumber: targetNode.data('levelNumber'),
    }
    if (sourceNode.id() === this.rootId) {
      return {
        data: {...edgeDef, ...this.constantsService.edgeTypes.root},
        classes: this.constantsService.graphClasses.edgeProposedRoot
      }
    } else {
      return {
        data: {...edgeDef, ...this.constantsService.edgeTypes.unfinished},
        classes: this.constantsService.graphClasses.edgeStep
      }
    }
  }

  public emitAndFocus(element: Core | NodeSingular | EdgeSingular, elementDiv: Element): void {
    element.emit('tap');
    this.focusedDiv = document.getElementById(elementDiv.id);
  }

  public handleAccessibleEdgeCreation(targetNode: NodeSingular): void {
    // If not in draw mode, do nothing
    if (!this.isDraw) {
      return;
    }
    this.cy.autounselectify(false);
    // Check if there is already a selected node, commence with creation if there is
    if (targetNode.selected()) {
      targetNode.unselect();
    } else {
      // Select if no others are selected, draw otherwise
      const selectedNodes = this.cy.nodes(':selected') as NodeCollection;
      if (selectedNodes.length > 0) {
        if (targetNode.id() === this.rootId) {
          // Exit, we don't connect to the root
          return;
        }
        // Drawing consists of adding to graph, adding to dom and then unselecting all
        const sourceNode = selectedNodes.first();
        const edge = this.cy.add(this.drawEdge(sourceNode, targetNode));
        this.cy.emit('ehcomplete', [sourceNode, targetNode, edge]);
        this.domManagerService.adjustElements(sourceNode.connectedEdges(), this.cy.zoom(), this.cy.pan());
        selectedNodes.unselect();
      } else {
        targetNode.select();
      }
    }
    this.cy.autounselectify(true);
  }

  public fitGraph(): void {
    this.cy.fit(this.cy.elements(), this.fitPadding);
  }

  @HostListener('document:keyup', ['$event'])
  public handleKeyboardEvent(event: KeyboardEvent): void {
    const activeElement = document.activeElement;
    const id = activeElement.id;
    const cls = activeElement.className;
    const zoom = this.cy.zoom();
    const pan = this.cy.pan();
    this.menuTLPosition = {x: '0px', y: '0px'};
    if (event.key === 'Enter' || event.key === ' ') {
      if (id === this.graphId) {
        this.emitAndFocus(this.cy, activeElement);
      } else if (cls === this.constantsService.domClasses.nodeRoot) {
        // Special case root, since it has two functions depending on mode
        if (this.isDraw) {
          this.handleAccessibleEdgeCreation(this.cy.getElementById(id));
        } else {
          this.emitAndFocus(this.cy.getElementById(id), activeElement);
        }
      } else if (cls === this.constantsService.domClasses.nodeLevel) {
        this.handleAccessibleEdgeCreation(this.cy.getElementById(id));
      } else if ([this.constantsService.domClasses.nodeStep, this.constantsService.domClasses.edge].includes(cls)) {
        this.emitAndFocus(this.cy.getElementById(id), activeElement);
      }
      return;
    } else if (event.key === 'Backspace') {
      if (this.menuTriggers.reduce((anyOpen, menu) => anyOpen || menu.menuOpen, false)) {
        this.menuTriggers.map(menu => menu.closeMenu());
        this.focusedDiv.focus();
      }
      this.deselectAll();
      return;
    } else if (event.key === 'Control') {
      this.switchGraphMode();
    } else if (event.shiftKey && event.key === 'I') {
      this.cy.zoom(zoom + 0.25);
      this.domManagerService.adjustElements(this.cy.elements(), zoom + 0.25, pan);
    } else if (event.shiftKey && event.key === 'O') {
      this.cy.zoom(zoom - 0.25);
      this.domManagerService.adjustElements(this.cy.elements(), zoom - 0.25, pan);
    } else if (event.key === 'Tab') {
      // If the element focused is not on screen, center on it
      if ([this.constantsService.domClasses.nodeRoot, this.constantsService.domClasses.nodeLevel, this.constantsService.domClasses.nodeStep, this.constantsService.domClasses.edge].includes(cls)) {
        const centerOn = this.cy.getElementById(id) as NodeSingular | EdgeSingular;
        if (!this.isInViewPort(centerOn, this.cy.extent())) {
          this.fitGraph();
        }
      }
    }
  }

  public isInViewPort(ele: NodeSingular | EdgeSingular, viewPort: any): boolean {
    const rect = ele.boundingBox({});
    return rect.x1 > viewPort.x1 && rect.x2 < viewPort.x2 && rect.y1 > viewPort.y1 && rect.y2 < viewPort.y2;
  }

  public deselectAll(): void {
    this.cy.autounselectify(false);
    this.cy.elements().unselect();
    this.cy.autounselectify(true);
  }

  public setupGraphData(): void {
    this.createRoot();
    this.createNodes(this.workFlowSteps);
    this.createEdges(this.cy.nodes(':parent'));
  }

  public async editWorkflow(): Promise<void> {
    const requestData: RequestWorkflowData = {
      Object: this.workFlow,
      Data: this.approvalWorkflowDataService.approvalWorkFlowRequestColumns,
      HelpText: this.constantsService.sidesheetText.editWorkflow.HelpText as string
    };
    const response = await this.openWorkFlowForm(this.constantsService.sidesheetText.editWorkflow.Header, requestData);

    if (response === 'save') {
      this.unsavedChanges = true;
      this.isUpdateWorkFlow = true;
      const ident = this.workFlow.GetEntity().GetColumn('Ident_PWODecisionSubMethod').GetValue();
      this.cy.getElementById(this.rootId).data('display', ident);
    }
  }

  public async editLevel(): Promise<void> {
    let parentNode = this.focusedElement as NodeSingular;
    if (parentNode.isChild()) {
      // Grab if this was actually the step child
      parentNode = parentNode.parent().first();
    }
    const children = parentNode.children();
    // Take first step to use as the interactive entity
    const index = await this.getIndexFromKey(children.first().data('key'));
    const requestData = {
      Object: this.workFlowStepsInteractive[index],
      Data: this.approvalWorkflowDataService.approvalWorkFlowLevelRequestColumns,
      HelpText: this.constantsService.sidesheetText.editLevel.HelpText as string,
    };
    const response = await this.openLevelForm(this.translate.instant('#LDS#Heading Edit Approval Level'), requestData);
    if (response === 'save') {
      this.unsavedChanges = true;
      const newDisplay = this.workFlowStepsInteractive[index].GetEntity().GetColumn('LevelDisplay').GetValue();

      // Update parent display
      parentNode.data('display', newDisplay);
    }
  }

  public async editStep(): Promise<void> {
    const node = this.focusedElement as NodeSingular;
    const index = await this.getIndexFromKey(node.data('key'));
    const requestData: RequestStepData = {
      Object: this.workFlowStepsInteractive[index],
      Data: this.approvalWorkflowDataService.approvalWorkFlowStepsRequestColumns,
      HelpText: this.constantsService.sidesheetText.editStep.HelpText as GroupedHelp
    };
    const response = await this.openStepForm(this.translate.instant('#LDS#Heading Edit Approval Step'), 'edit', requestData);

    if (response === 'save') {
      this.unsavedChanges = true;

      node.data('display', this.formatDisplay(this.workFlowStepsInteractive[index]));
    }
  }

  public openSnackbar(message: string): void {
    this.snackbar.open({ key: message }, 'Ok', {
      duration: 7000,
    });
  }

  public async editEdge(edgeType: EdgeType): Promise<void> {
    const edge = this.focusedElement as EdgeSingular;
    // Check if this is the same, don't display a snackbar for now
    if (edge.data('type') === edgeType.type) {
      return;
    }
    let isError = false;
    // Check if this edge is already there
    const coDirectedEdges = edge.codirectedEdges();
    coDirectedEdges.forEach((coDirectedEdge) => {
      if (coDirectedEdge.data('type') === edgeType.type) {
        isError = true;
      }
    });

    if (isError) {
      this.openSnackbar(this.constantsService.messageText.edgeAlreadyExists);
      return;
    }

    const sourceNode = edge.source();
    const siblingEdges = sourceNode.outgoers().edges();
    siblingEdges.forEach((siblingEdge) => {
      if (siblingEdge.data('type') === edgeType.type) {
        isError = true;
      }
    });

    if (isError) {
      this.openSnackbar(this.constantsService.messageText.edgeOnOtherNode);
      return;
    }

    // This is a change, update and set unsaved
    this.unsavedChanges = true;

    edge.data('display', edgeType.display);
    edge.data('type', edgeType.type);
    edge.data('color', edgeType.color);
    edge.data('style', edgeType.style);
    edge.data('icon', edgeType?.icon);


    this.domManagerService.updateEdgeComponent(edge);
  }

  public async removeEdge(): Promise<void> {
    this.unsavedChanges = true;
    const edge = this.focusedElement as EdgeSingular;
    const sourceNode = edge.source();
    const targetNode = edge.target();
    const type = edge.data('type');
    // Update source data
    sourceNode.data(type, 0);

    // Remove from dom
    this.domManagerService.removeElementComponentFromBody(edge);

    // Remove from on screen
    this.cy.remove(edge);

    // Shift parallel edges
    const parallelEdges = sourceNode.connectedEdges().intersection(targetNode.connectedEdges());
    this.domManagerService.adjustElements(parallelEdges, this.cy.zoom(), this.cy.pan());
  }

  public async removeLevel(): Promise<void> {
    let parentNode = this.focusedElement as NodeSingular;
    if (parentNode.isChild()) {
      parentNode = parentNode.parent().first();
    }
    // Remove locally, save to delete later array
    this.unsavedChanges = true;
    const children = parentNode.children();
    // Remove parent from dom
    this.domManagerService.removeElementComponentFromBody(parentNode);
    // Remove connected edges from dom
    parentNode.connectedEdges().forEach((edge) => {
      this.domManagerService.removeElementComponentFromBody(edge);
    });
    // Remove elements on screen
    this.cy.remove(parentNode.add(children));
    for await (const child of children.toArray()) {
      // Remove from dom
      this.domManagerService.removeElementComponentFromBody(child);
      // Remove from data model
      const index = await this.getIndexFromKey(child.data('key'));
      this.workFlowStepsPromises.splice(index, 1);
      const stepKey = this.interactiveKeys.splice(index, 1)[0];
      const deleteStep = this.workFlowStepsInteractive.splice(index, 1)[0];

      // Check if its in addLater
      const popIndex = this.workFlowStepsAddLater.indexOf(stepKey);
      if (popIndex !== -1) {
        this.workFlowStepsAddLater.splice(popIndex, 1);
      } else {
        await this.approvalWorkflowDataService.deleteWorkFlowStep(this.workFlowKey, deleteStep);
        this.workFlowStepsDeleteLater.push(deleteStep);
      }
    }


  }

  public async removeStep(): Promise<void> {
    const node = this.focusedElement as NodeSingular;
    // If only step, remove entire level
    if (node.parent().children().length === 1) {
      if (await this.confirmation.confirm({
        Title: '#LDS#Heading Delete Approval Step and Approval Level',
        Message: '#LDS#If you delete this approval step, the corresponding approval level will also be deleted. Are you sure you want to delete the approval step?'
      })) {
        await this.removeLevel();
      }
      return;
    }
    // Update siblings steps
    const subLevelNumber = node.data('subLevelNumber');
    node.siblings().forEach((sibling) => {
      const siblingSubLevelNumber = sibling.data('subLevelNumber');
      const siblingRow = sibling.data('row');
      if (siblingSubLevelNumber > subLevelNumber) {
        sibling.data('subLevelNumber', siblingSubLevelNumber - 1);
        sibling.data('row', siblingRow - 1);
      }
    });

    const index = await this.getIndexFromKey(node.data('key'));
    this.workFlowStepsPromises.splice(index, 1);
    // Remove locally, save to delete later array
    this.unsavedChanges = true;

    const stepKey = this.interactiveKeys.splice(index, 1)[0];
    const deleteStep = this.workFlowStepsInteractive.splice(index, 1)[0];

    // Check if its in addLater
    const popIndex = this.workFlowStepsAddLater.indexOf(stepKey);
    if (popIndex !== -1) {
      this.workFlowStepsAddLater.splice(popIndex, 1);
    } else {
      await this.approvalWorkflowDataService.deleteWorkFlowStep(this.workFlowKey, deleteStep);
      this.workFlowStepsDeleteLater.push(deleteStep);
    }

    // Remove from dom
    this.domManagerService.removeElementComponentFromBody(node);
    // Remove element on screen and then align parent and adjust dom
    const parentNode = node.parent().first();
    this.cy.remove(node);
    this.alignParent(parentNode);
  }

  public async addStep(): Promise<void> {
    const parentNode = this.focusedElement as NodeSingular;
    if (this.standbyStepInteractive === undefined) {
      await this.approvalWorkflowDataService.waitForPromises([this.standbyPromise]);
    }

    const requestData: RequestStepData = {
      Object: this.standbyStepInteractive,
      Data: this.approvalWorkflowDataService.approvalWorkFlowStepsRequestColumns,
      HelpText: this.constantsService.sidesheetText.newStep.HelpText as GroupedHelp
    };
    const response = await this.openStepForm(this.translate.instant('#LDS#Heading Create Approval Step'), 'add', requestData);
    if (response === 'save') {
      this.unsavedChanges = true;

      // Get useful values/items for node data
      const children = parentNode.children();
      const lastCol = children.first().data('col');
      const lastRow = children.max((child) => {
        return child.data('row');
      }).value;
      const subLevelNumber = children.length;

      // Modify data and add element on screen, then align this parent and adjust connected components
      const nodeData = this.createNode(this.standbyStepInteractive, parentNode.id());
      nodeData.data.parent = parentNode.id();
      nodeData.data.subLevelNumber = subLevelNumber;
      nodeData.data.index = this.workFlowStepsInteractive.length;
      nodeData.data.row = lastRow + 1;
      nodeData.data.col = lastCol;
      const node = this.cy.add(nodeData) as NodeSingular;
      this.domManagerService.appendNodeComponentRelative(node, this.constantsService.domClasses.nodeStep, this.isDraw);
      this.alignParent(parentNode);

      // Store values
      const thisKey = this.standbyStepInteractive.GetEntity().GetKeys()[0];

      // Add to commit later
      this.workFlowStepsAddLater.push(thisKey);
      // Push to state arrays
      this.interactiveKeys.push(thisKey);
      this.workFlowStepsInteractive.push(this.standbyStepInteractive);
      this.workFlowStepsPromises.push(this.standbyPromise);

      await this.getNextStep();
    }
  }

  public async addLevel(): Promise<void> {
    // Grab position before opening any sidesheets
    const position = {
      x: parseFloat(this.menuTLPosition.x.replace('px', '')),
      y: parseFloat(this.menuTLPosition.y.replace('px', ''))
    };
    if (this.standbyStepInteractive === undefined) {
      await this.approvalWorkflowDataService.waitForPromises([this.standbyPromise]);
    }

    const requestData: RequestStepData = {
      Object: this.standbyStepInteractive,
      Data: this.approvalWorkflowDataService.approvalWorkFlowStepsRequestColumns,
      HelpText: this.constantsService.sidesheetText.newLevel.HelpText as GroupedHelp
    };

    const response = await this.openStepForm(this.translate.instant('#LDS#Heading Create Approval Level'), 'add', requestData);
    if (response === 'save') {
      this.unsavedChanges = true;

      // Find largest levelNumber, add 1 for next level
      let levelNumber = this.cy.nodes(':parent').max((currentNode: NodeSingular) => {
        return currentNode.data('levelNumber');
      }).value;
      levelNumber += 1;

      // Create element on screen
      const thisKey = this.standbyStepInteractive.GetEntity().GetKeys()[0];

      const parentNodeData = this.createParent(this.standbyStepInteractive);
      parentNodeData.data.levelNumber = levelNumber;
      const parentNode = this.cy.add(parentNodeData);

      // Create a first step with col 1 row 1
      const nodeData = this.createNode(this.standbyStepInteractive, parentNode.id());
      nodeData.position = position;
      nodeData.data.index = this.workFlowStepsInteractive.length;
      nodeData.data.row = 1;
      nodeData.data.col = 1;
      const node = this.cy.add(nodeData);
      this.domManagerService.appendNodeComponentToBody(parentNode, this.constantsService.domClasses.nodeLevel, this.isDraw);
      this.domManagerService.appendNodeComponentToBody(node, this.constantsService.domClasses.nodeStep, this.isDraw);

      // Check if this is the only node, add the root edge if so
      if (this.workFlowStepsInteractive.length === 0) {
        const edgeData = this.createEdgeRoot(parentNode.id(), levelNumber);
        this.cy.add(edgeData);
      }
      // Add to save later
      this.workFlowStepsAddLater.push(thisKey);
      // Push to state arrays
      this.interactiveKeys.push(thisKey);
      this.workFlowStepsPromises.push(this.standbyPromise);
      this.workFlowStepsInteractive.push(this.standbyStepInteractive);

      await this.getNextStep();
    }
  }

  public setGrid(): void {
    // Reset visited
    this.cy.nodes(':child').forEach((child) => {
      child.data('visited', false);
    });
    // Set the grid to then apply a layout over
    const sortedNodes: NodeSingular[] = [];
    const alignNodes = this.cy.elements(':compound').union(this.rootNode);

    // Initialize
    let currentCol = 0;
    let currentRow = 0;
    let lastDepth = 0;
    let maxRowsInCurrentDepth = 0;

    // Parameters for spacing the graph
    const rowSpacing = 3;
    const colSpacing = 2;

    alignNodes.bfs({
      root: '#' + this.rootId,
      directed: true,
      visit: (currentNode: NodeSingular, e, previousNode: NodeSingular, index: number, depth: number) => {
        sortedNodes.push(currentNode);
        if (currentNode.id() === this.rootId) {
          currentNode.data('row', 0);
          currentNode.data('col', 0);
          currentNode.data('visited', true);
        } else {
          const children = currentNode.children();
          if (depth === lastDepth) {
            // Increment the column, check if we've seen more rows so far
            currentCol += colSpacing;
            maxRowsInCurrentDepth = Math.max(maxRowsInCurrentDepth, children.length);
          } else {
            // Moved to a new depth, take get col from parent and max rows in current depth
            if (previousNode.isParent()) {
              currentCol = previousNode.children().first().data('col');
            } else {
              // Root node has col info
              currentCol = previousNode.data('col');
            }
            currentRow += maxRowsInCurrentDepth + rowSpacing;
            maxRowsInCurrentDepth = children.length - 1;
          }
          children.forEach((child) => {
            const subLevelNumber = child.data('subLevelNumber');
            child.data('row', subLevelNumber + currentRow);
            child.data('col', currentCol);
            child.data('visited', true);
          });
        }
        lastDepth = depth;
      },
    });

    // Stick any unvisited nodes on the root node row, on different columns
    currentCol = colSpacing;
    alignNodes.forEach((parentNode: NodeSingular) => {
      if (parentNode.id() !== this.rootId) {
        let isParentVisited = true;
        const children = parentNode.children();

        children.forEach((child) => {
          if (!child.data('visited')) {
            const subLevelNumber = child.data('subLevelNumber');
            child.data('row', subLevelNumber);
            child.data('col', currentCol);
            isParentVisited = false;
          }
        });
        if (!isParentVisited) {
          currentCol += colSpacing;
          sortedNodes.push(parentNode);
        }
      }
    });
    this.addDomElements(sortedNodes);
  }

  public addDomElements(nodes: NodeSingular[]): void {
    nodes.forEach((node) => {
      if (node.id() === this.rootId) {
        this.domManagerService.appendNodeComponentToBody(node, this.constantsService.domClasses.nodeRoot, this.isDraw);
      } else {
        this.domManagerService.appendNodeComponentToBody(node, this.constantsService.domClasses.nodeLevel, this.isDraw);
        const children = node.children();
        children.forEach((child) => {
          this.domManagerService.appendNodeComponentToBody(child, this.constantsService.domClasses.nodeStep, this.isDraw);
        });
        node
          .outgoers()
          .edges()
          .forEach((edge) => {
            this.domManagerService.appendEdgeComponentToBody(edge, this.constantsService.domClasses.edge);
          });
      }
    });
    // Setup initial state of Draw off
    this.domManagerService.toggleOffDomElements([this.constantsService.domClasses.edge, this.constantsService.domClasses.nodeLevel]);
  }

  public alignWorkFlow(): void {
    this.logger.debug(this, 'Aligning workflow graph');
    this.setGrid();
    const gridLayoutOptions: GridLayoutOptions = {
      name: 'grid',
      fit: true,
      boundingBox: this.cy.extent(),
      position: (node) => {
        return { row: node.data('row'), col: node.data('col') };
      },
      condense: true,
      avoidOverlap: true,
      avoidOverlapPadding: 5,
      nodeDimensionsIncludeLabels: true,
      stop: () => {
        this.domManagerService.checkForCollisions(this.cy.elements());
      },
    };
    const gridLayout = this.cy.layout(gridLayoutOptions);
    gridLayout.run();
  }

  public alignParent(parentNode: NodeSingular): void {
    const children = parentNode.children();
    const gridLayoutOptions: GridLayoutOptions = {
      name: 'grid',
      fit: false,
      position: (node) => {
        return { row: node.data('row'), col: node.data('col') };
      },
      condense: true,
      avoidOverlap: true,
      avoidOverlapPadding: 15,
      nodeDimensionsIncludeLabels: false,
      stop: () => {
        this.domManagerService.adjustElements(parentNode.union(children).union(parentNode.connectedEdges()), this.cy.zoom(), this.cy.pan());
      },
    };
    const gridLayout = children.layout(gridLayoutOptions);
    gridLayout.run();
  }

  public async deleteWorkFlow(withReload: boolean = true): Promise<void> {
    if (await this.confirmation.confirmLeaveWithUnsavedChanges(
      this.translate.instant('#LDS#Heading Delete Approval Workflow'),
      this.translate.instant('#LDS#Are you sure you want to delete the approval workflow?')
      )) {
      this.approvalWorkflowDataService.handleOpenLoader();
      try {
        await this.approvalWorkflowDataService.workFlowDelete(this.workFlowKey);
      } finally {
        this.sideSheetRef.close(withReload);
        this.approvalWorkflowDataService.handleCloseLoader();
      }
    }
  }

  public async openWorkFlowForm(sheetTitle: string, requestData: RequestWorkflowData): Promise<string> {
    const result: string = await this.sideForm
      .open(ApprovalWorkflowFormComponent, {
        title: sheetTitle,
        icon: 'edit',
        panelClass: 'imx-sidesheet',
        padding: '0',
        width: 'max(600px, 60%)',
        disableClose: true,
        testId: 'srcApprovalWorkflow-form-sidesheet',
        data: requestData,
      })
      .afterClosed()
      .toPromise();

    return result;
  }

  public async openStepForm(sheetTitle: string, icon: string, requestData: RequestStepData): Promise<string> {
    const result: string = await this.sideForm
      .open(ApprovalStepFormComponent, {
        title: sheetTitle,
        icon,
        panelClass: 'imx-sidesheet',
        padding: '0',
        width: 'max(600px, 60%)',
        disableClose: true,
        testId: 'srcApprovalStep-form-sidesheet',
        data: requestData,
      })
      .afterClosed()
      .toPromise();

    return result;
  }

  public async openLevelForm(sheetTitle: string, requestData: RequestLevelData): Promise<string> {
    const result: string = await this.sideForm
      .open(ApprovalLevelFormComponent, {
        title: sheetTitle,
        icon: 'edit',
        panelClass: 'imx-sidesheet',
        padding: '0',
        width: 'max(600px, 60%)',
        disableClose: true,
        testId: 'srcApprovalLevel-form-sidesheet',
        data: requestData,
      })
      .afterClosed()
      .toPromise();

    return result;
  }
}
