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

import { ApplicationRef, ComponentFactoryResolver, ComponentRef, EmbeddedViewRef, Injectable, Injector } from '@angular/core';
import { Collection, EdgeCollection, EdgeSingular, NodeCollection, NodeSingular, Position } from 'cytoscape';
import { ContainerDomComponent } from './container-dom/container-dom.component';
import { NodeDomComponent } from './node-dom/node-dom.component';
import { EdgeDomComponent } from './edge-dom/edge-dom.component';

@Injectable({
  providedIn: 'root',
})
export class DomManagerService {
  private idToRefDict: {
    [key: string]: ComponentRef<NodeDomComponent | EdgeDomComponent>;
  } = {};
  private domContainer: ComponentRef<ContainerDomComponent>;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    ) {}

  public createDomContainer(id: string, cls: string): void {
    // Create Angular factory for lifecycle hooks
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ContainerDomComponent);
    this.domContainer = componentFactory.create(this.injector);
    this.appRef.attachView(this.domContainer.hostView);

    // Append under cytoscape
    const domContainer = (this.domContainer.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    domContainer.className = cls;
    document.getElementById(id).appendChild(domContainer);
  }

  public appendNodeComponentRelative(node: NodeSingular, cls: string, isDraw: boolean): void {
    const parentNode = node.parent().first();
    let nodeBefore: NodeSingular;
    if (parentNode.children().length > 1) {
      // There are other children, find the one with the previous sublevel
      const previousSublevel = node.data('subLevelNumber') - 1;
      for (const child of parentNode.children().toArray()) {
        if (child.data('subLevelNumber') === previousSublevel) {
          nodeBefore = child;
          break;
        }
      }
    } else {
      // No children, insert directly after parent
      nodeBefore = parentNode;
    }
    const siblingDom = this.idToRefDict[nodeBefore.id()].location.nativeElement.nextSibling;
    this.appendNodeComponentToBody(node, cls, isDraw, siblingDom);
  }

  public appendNodeComponentToBody(node: NodeSingular, cls: string, isDraw: boolean, siblingDom: ChildNode = null): void {
    if (this.idToRefDict[node.id()]) {
      // Remove from dom, this preserves tab order
      this.removeElementComponentFromBody(node);
      delete this.idToRefDict[node.id()];
    }
    // Create Angular factory for lifecycle hooks
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(NodeDomComponent);
    const componentRef = componentFactory.create(this.injector);
    this.appRef.attachView(componentRef.hostView);

    // Store value in dict
    this.idToRefDict[node.id()] = componentRef;

    // Math to determine if we let tabindex be reachable
    const isParent = node.isParent();
    let tabindex = 0;
    if ((isDraw || isParent) && !(isDraw && isParent)) {
      // XOR - make unreachable if we are a parent in draw mode or a child in edge mode
      tabindex = -1;
    }

    // Attach to dom
    const domNode = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    domNode.id = node.id();
    domNode.className = cls;
    domNode.tabIndex = tabindex;
    this.domContainer.location.nativeElement.insertBefore(domNode, siblingDom);

    this.updateNodeComponent(node);
  }

  public updateNodeComponent(node: NodeSingular): void {
    let width = 0;
    let height = 0;
    const paddingWidth = 80;
    const paddingHeight = 50;
    if (node.isParent()) {
      // Compound nodes have weird sizing, so we accumulate all children
      const children = node.children();
      children.forEach(child => {
        width = Math.max(width, child.renderedOuterWidth());
        height += child.renderedOuterHeight() + paddingHeight;
      });
      width += paddingWidth;
    } else {
      width = node.renderedOuterWidth() + paddingWidth / 2;
      height = node.renderedOuterHeight() + paddingHeight / 2;
    }
    const nodeDom = this.idToRefDict[node.id()].location.nativeElement;
    nodeDom.style.width = width.toString() + 'px';
    nodeDom.style.height = height.toString() + 'px';
    nodeDom.setAttribute('aria-label', node.data('display'));
  }

  public appendEdgeComponentRelative(edge: EdgeSingular, cls: string): void {
    const source = edge.source();
    let elementsToCheck: NodeCollection | EdgeCollection;
    if (edge.parallelEdges().length > 1) {
      // Parallel edges exist, get last edge in dom
      elementsToCheck = edge.parallelEdges();
    } else if (source.connectedEdges().length > 1) {
      // The source already has edges, get last edge in dom
      elementsToCheck = source.connectedEdges();
    } else {
      // This is the first edge for this node, append behind last child
      elementsToCheck = source.children();
    }
    let siblingDom: any;
    for (const ele of elementsToCheck.toArray()) {
      if (this.idToRefDict[ele.id()]) {
        siblingDom = this.idToRefDict[ele.id()].location.nativeElement.nextSibling;
      } else {
        // We walked the point where we haven't yet added, break
        break;
      }
    }
    this.appendEdgeComponentToBody(edge, cls, siblingDom);
  }

  public appendEdgeComponentToBody(edge: EdgeSingular, cls: string, siblingDom: ChildNode = null): void {
    if (this.idToRefDict[edge.id()]) {
      // Remove from dom, this preserved tab order
      this.removeElementComponentFromBody(edge);
      delete this.idToRefDict[edge.id()];
    }
    // Create Angular factory for lifecycle hooks
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(EdgeDomComponent);
    const componentRef = componentFactory.create(this.injector);
    this.appRef.attachView(componentRef.hostView);

    // Store value in dict
    this.idToRefDict[edge.id()] = componentRef;

    // Attach to dom
    const edgeDom = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    edgeDom.id = edge.id();
    edgeDom.className = cls;
    edgeDom.tabIndex = 0;
    this.domContainer.location.nativeElement.insertBefore(edgeDom, siblingDom);

    this.updateEdgeComponent(edge);
  }

  public updateEdgeComponent(edge: EdgeSingular): void {
    const edgeRef = this.idToRefDict[edge.id()] as ComponentRef<EdgeDomComponent>;
    const edgeInstance = edgeRef.instance;
    const edgeDom = edgeRef.location.nativeElement;

    // Accessibility
    edgeDom.setAttribute('aria-label', edge.data('display'));

    // Set values that can change for a label change
    if (edge.data('icon')) {
      edgeInstance.hasIcon = true;
      edgeInstance.icon = edge.data('icon');
      edgeDom.style.backgroundColor = edge.data('color');
    } else {
      edgeInstance.hasIcon = false;
      edgeInstance.icon = '';
    }
  }

  public adjustElements(elements: Collection | EdgeCollection, zoom: number, pan: Position): void {
    for (const ele of elements.toArray()) {
      const eleRef = this.idToRefDict[ele.id()];
      if (!eleRef) {
        // Not in Dom, skip
        continue;
      }
      let translateX = 0;
      let translateY = 0;
      if (ele.isNode()) {
        this.updateNodeComponent(ele);
        if (ele.isParent()) {
          // The compound nodes have funny sizing, use average over children
          const children = ele.children();
          translateX = children.first().renderedPosition().x;
          children.forEach((child) => {
            translateY += child.renderedPosition().y;
          });
          translateY /= children.length;
        } else {
          // Just grab regular position;
          translateX = ele.renderedPosition().x;
          translateY = ele.renderedPosition().y;
        }
      } else if (ele.isEdge()) {
        const midpoint = ele.midpoint();
        translateX = midpoint.x * zoom + pan.x;
        translateY = midpoint.y * zoom + pan.y;
      }
      eleRef.location.nativeElement.style.top = translateY;
      eleRef.location.nativeElement.style.left = translateX;
      eleRef.location.nativeElement.style.transform =
        'translate(-50%,-50%) translate(' + translateX.toFixed(2) + 'px, ' + translateY.toFixed(2) + 'px) scale(' + zoom.toString() + ')';
    }
  }

  public checkForCollisions(elements: Collection | EdgeCollection): void {
    const edges = elements.edges();
    const nodes = elements.nodes(':parent, :orphan');
    for (const edge of edges.toArray()) {
      let isColliding = false;
      const edgeRef = this.idToRefDict[edge.id()];
      if (!edgeRef) {
        continue;
      }
      for (const node of nodes.toArray()) {
        if (this.isColliding(node, edge)) {
          isColliding = true;
          break;
        }
      }
      if (isColliding) {
        edgeRef.location.nativeElement.style.visibility = 'hidden';
      } else {
        edgeRef.location.nativeElement.style.visibility = 'initial';
      }
    }

  }

  public isColliding(node: NodeSingular, edge: EdgeSingular): boolean {
    const boundingBox = node.boundingBox({});
    const midpoint = edge.midpoint();
    // Nan can appear, catch this
    if (Number.isNaN(midpoint.x) || Number.isNaN(midpoint.y)) {
      return true;
    }
    return (
      (boundingBox.x1 < midpoint.x && boundingBox.x2 > midpoint.x) &&
      (boundingBox.y1 < midpoint.y && boundingBox.y2 > midpoint.y)
     );
  }

  public toggleOnDomElements(classList: string[]): void {
    for (const key of Object.keys(this.idToRefDict)) {
      const domElement = this.idToRefDict[key].location.nativeElement;
      if (classList.includes(domElement.className)) {
        domElement.tabIndex = 0;
      }
    }
  }

  public toggleOffDomElements(classList: string[]): void {
    for (const key of Object.keys(this.idToRefDict)) {
      const domElement = this.idToRefDict[key].location.nativeElement;
      if (classList.includes(domElement.className)) {
        domElement.tabIndex = -1;
      }
    }
  }

  public removeElementComponentFromBody(ele: NodeSingular | EdgeSingular): void {
    const componentRef = this.idToRefDict[ele.id()];
    if (!componentRef) {
      // This catches any non existent/already destroyed components
      return;
    }
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
  }

  public removeContainerComponentFromBody(): void {
    this.appRef.detachView(this.domContainer.hostView);
    this.domContainer.destroy();
  }
}
