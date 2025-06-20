import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ScheduleConsultationComponent } from './schedule-consultation.component';

describe('ScheduleConsultationComponent', () => {
  let component: ScheduleConsultationComponent;
  let fixture: ComponentFixture<ScheduleConsultationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleConsultationComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleConsultationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});