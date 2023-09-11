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

import { Directive, ElementRef, EventEmitter, HostListener, Output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[imxZoomPan]',
})
export class ZoomPanDirective {
  @Output() public onViewChanged: EventEmitter<void> = new EventEmitter();
  private scale = 1;
  private offset = { left: 0, top: 0 };
  private relativePosition = { x: 0, y: 0 };
  //mousemove should work only after the element is clicked
  private mouseDown = false;
  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  @HostListener('wheel', ['$event'])
  private scaling(event: WheelEvent) {
    event.preventDefault();
    //this 0.01 is the value at which the scalling is done
    this.scale = this.getScale() + event.deltaY * -0.003;

    // Restrict scale
    this.scale = Math.min(Math.max(1, this.scale), 10);
    // Apply scale transform

    this.renderer.setStyle(this.elementRef.nativeElement, 'transform', `scale(${this.scale})`);
    this.renderer.setAttribute(this.elementRef.nativeElement, 'att-scale', `${this.scale}`);
    this.onViewChanged.emit();
  }

  @HostListener('mousedown', ['$event'])
  private dragStart(event: MouseEvent) {
    event.preventDefault();
    //to get the current position of cursor inside the element

    const childElement = this.elementRef.nativeElement.childNodes[0];
    this.relativePosition.x = childElement.hasAttribute('att-relative-x') ? Number(childElement.getAttribute('att-relative-x')) : 0;
    this.relativePosition.y = childElement.hasAttribute('att-relative-y') ? Number(childElement.getAttribute('att-relative-y')) : 0;
    this.offset.left = event.pageX / this.getScale() - this.relativePosition.x;
    this.offset.top = event.pageY / this.getScale() - this.relativePosition.y;
    this.mouseDown = true;
  }

  @HostListener('mousemove', ['$event'])
  private dragging(event: MouseEvent) {
    event.preventDefault();
    if (this.mouseDown) {
      const childElement = this.elementRef.nativeElement.childNodes[0];
      const { x, y } = childElement.getBoundingClientRect();
      let newX = event.pageX / this.getScale() - this.offset.left;
      let newY = event.pageY / this.getScale() - this.offset.top;
      this.renderer.setStyle(childElement, 'left', `${newX}px`);
      this.renderer.setStyle(childElement, 'top', `${newY}px`);
      this.renderer.setAttribute(childElement, 'att-relative-x', `${newX}`);
      this.renderer.setAttribute(childElement, 'att-relative-y', `${newY}`);
      this.onViewChanged.emit();
    }
  }

  @HostListener('document:mouseup', ['$event'])
  private dragend(event: MouseEvent) {
    this.mouseDown = false;
  }

  @HostListener('mouseover')
  private hover(event: MouseEvent) {
    this.renderer.setStyle(this.elementRef.nativeElement, 'cursor', 'move');
  }

  getScale(): number {
    return this.elementRef.nativeElement.hasAttribute('att-scale')
      ? Number(this.elementRef.nativeElement.getAttribute('att-scale'))
      : this.scale;
  }
}
