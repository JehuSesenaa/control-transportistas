import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceFormComponent } from './performance-form.component';

describe('PerformanceFormComponent', () => {
  let component: PerformanceFormComponent;
  let fixture: ComponentFixture<PerformanceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerformanceFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PerformanceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
