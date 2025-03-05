import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesReportingToMeComponent } from './employees-reporting-to-me.component';

describe('EmployeesReportingToMeComponent', () => {
  let component: EmployeesReportingToMeComponent;
  let fixture: ComponentFixture<EmployeesReportingToMeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeesReportingToMeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeesReportingToMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
