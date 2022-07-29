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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM } from 'qbm';
import { OwnerCandidateOptions } from './owner.model';
import { OwnerControlComponent } from './owner-control.component';
import { OwnerControlService } from './owner-control.service';


@Component({
  selector: 'imx-cdr-editor',
  template: '<p>MockRequestTable</p>'
})
class MockCdr {
  @Input() cdr: any;
  @Output() controlCreated = new EventEmitter<any>();
}

describe('OwnerControlComponent', () => {
  let component: OwnerControlComponent;
  let fixture: ComponentFixture<OwnerControlComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        MatRadioModule,
        MatCardModule,
        MatTooltipModule
      ],
      declarations: [
        OwnerControlComponent,
        MockCdr
      ],
      providers: [
        {
          provide: OwnerControlService,
          useValue: {
            createGroupOwnerPersonCdr: jasmine.createSpy('createGroupOwnerPersonCdr')
          }
        }
      ]
    })
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OwnerControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  for (const testcase of [
    {options:OwnerCandidateOptions.people, createHandler:true},
    {options:OwnerCandidateOptions.people, createHandler:false},
    {options:OwnerCandidateOptions.roles, createHandler:true},
    {options:OwnerCandidateOptions.roles, createHandler:false},
  ]) {
    it('calls right editor', () => {
      const control = new FormControl('');

      expect(() => {
        component.onFormControlCreated(control,testcase.options,testcase.createHandler);
      }).not.toThrowError();
      
    });  
  }
  
});
