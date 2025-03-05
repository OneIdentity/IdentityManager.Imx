import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesSidesheetComponent } from './employees-sidesheet.component';

describe('EmployeesSidesheetComponent', () => {
  let component: EmployeesSidesheetComponent;
  let fixture: ComponentFixture<EmployeesSidesheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeesSidesheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeesSidesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
