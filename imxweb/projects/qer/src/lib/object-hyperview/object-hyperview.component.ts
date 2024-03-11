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

import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';

import { ShapeData } from 'imx-api-qer';
import { BusyService, HyperViewNavigation, HyperViewNavigationEnum, ShapeClickArgs } from 'qbm';
import { ObjectHyperviewService } from './object-hyperview.service';
import { Subscription } from 'rxjs';
import { ObjectHyperview } from './object-hyperview-interface';
import { DbObjectKey } from 'imx-qbm-dbts';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';

@Component({
  selector: 'imx-object-hyperview',
  templateUrl: './object-hyperview.component.html',
  styleUrls: ['./object-hyperview.component.scss'],
})
export class ObjectHyperviewComponent implements OnInit, OnChanges, OnDestroy {
  /**
   * Sets the object type for the hyperview.
   */
  @Input() public objectType: string;

  /**
   * Sets the object UID for the hyperview.
   */
  @Input() public objectUid: string;

  /**
   * Sets an optional identifier of hyperview.
   */
  @Input() public hyperviewName: string;

  /**
   * Sets whether the hyperview is condensed or not.
   */
  @Input() public condensed: true;

  /**
   * Occurs when user click on a shape link.
   */
  @Output() public selected: EventEmitter<ShapeClickArgs> = new EventEmitter();

  public get loadinghyperview() {
    return this.busy.isBusy;
  }
  public hyperviewShapes: ShapeData[] = [];
  public navigation: HyperViewNavigation = { navigation: false, back: false, forward: false, first: false };
  private busy = new BusyService();

  /** Cache for shape data, using the hyperviewName as key. */
  private cached: Map<string, ShapeData[]> = new Map();
  private navigationSubscriptions: Subscription;
  private hyperviewStates: ObjectHyperview[] = [];

  constructor(
    private readonly objectHyperviewService: ObjectHyperviewService,
    private readonly configService: ProjectConfigurationService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!(changes.objectUid?.isFirstChange() || changes.hyperviewName?.isFirstChange()) && (changes.hyperviewName || changes.objectUid)) {
      // is the data cached already?
      if (this.navigation.navigation) {
        this.hyperviewStates = [{ type: this.objectType, uid: this.objectUid, selected: true }];
        this.navigation = { navigation: true, back: false, forward: false, first: false };
      }
      if (changes.hyperviewName && this.cached.has(this.hyperviewName)) {
        this.hyperviewShapes = this.cached.get(this.hyperviewName);
      } else {
        this.reload();
      }
    }
  }

  public async ngOnInit(): Promise<void> {
    //If the user has navigation permission subscribe to the selected event emitter and set hyperviewStates to initial state.
    const projectConfig = await this.configService.getConfig();
    if (!projectConfig.DisableHyperViewNavigation) {
      this.navigation.navigation = true;
      this.navigationSubscriptions = this.selected.subscribe((shape) => {
        const hyperviewObject = DbObjectKey.FromXml(shape.objectKey);
        this.addHyperviewObject(hyperviewObject.TableName, hyperviewObject.Keys[0], this.selectedHyperviewIndex + 1);
      });
      this.hyperviewStates = [{ type: this.objectType, uid: this.objectUid, selected: true }];
    }
    await this.reload();
  }

  public ngOnDestroy(): void {
    this.navigationSubscriptions?.unsubscribe();
  }

  public onNavigationChanged($event: HyperViewNavigationEnum) {
    if ($event === HyperViewNavigationEnum.Back) {
      this.setSelectedHyperview(this.selectedHyperviewIndex - 1);
    } else if ($event === HyperViewNavigationEnum.Forward) {
      if (this.selectedHyperviewIndex < this.hyperviewStates.length) {
        this.setSelectedHyperview(this.selectedHyperviewIndex + 1);
      }
    } else {
      this.setSelectedHyperview(0);
    }
  }

  private async reload(objectType?: string, objectUid?: string): Promise<void> {
    const busy = this.busy.beginBusy();
    this.hyperviewShapes = [];
    const hyperviewType = objectType || this.objectType;
    const hyperviewUid = objectUid || this.objectUid;
    try {
      const name = this.hyperviewName;
      const shapes = await this.objectHyperviewService.get(hyperviewType, hyperviewUid, name);

      // put in the cache
      this.cached.set(name, shapes);

      // is it still the one we need?
      this.hyperviewShapes = shapes || [];
      if (this.navigation.navigation) {
        this.navigation.back = this.selectedHyperviewIndex > 0;
        this.navigation.first = this.selectedHyperviewIndex > 0;
        this.navigation.forward = this.selectedHyperviewIndex < this.hyperviewStates.length - 1;
      }
    } finally {
      busy.endBusy();
    }
  }

  /**
   * Add a hyperview object to the hyperview states array in the correct index and reload if needed.
   * @param type hpyerview type
   * @param uid hyperview uid
   * @param index the new index in the hyperview states array
   * @param reload set false if don't need to reload
   */
  private addHyperviewObject(type: string, uid: string, index: number, reload = true): void {
    this.hyperviewStates.map((hyperview) => (hyperview.selected = false));
    this.hyperviewStates.splice(index);
    this.hyperviewStates.push({ type, uid, selected: true });
    if (reload) {
      this.reload(type, uid);
    }
  }

  /**
   * Reload the selected hyperview by navigation.
   * @param index the index of the selected hyperview in the hyperview states
   */
  private setSelectedHyperview(index: number): void {
    this.hyperviewStates.map((hyperview) => (hyperview.selected = false));
    this.hyperviewStates[index].selected = true;
    const selectedState = this.selectedHyperview;
    this.reload(selectedState.type, selectedState.uid);
  }

  /**
   * Returns the selected hyperview index.
   */
  private get selectedHyperviewIndex(): number {
    return this.hyperviewStates.findIndex((hyperview) => hyperview.selected);
  }

  /**
   * Returns the selected hyperview.
   */
  private get selectedHyperview(): ObjectHyperview {
    return this.hyperviewStates.find((hyperview) => hyperview.selected);
  }
}
