import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModalCheckIn } from './modal-check-in.component';

describe('ModalCheckIn', () => {
  let component: ModalCheckIn;
  let fixture: ComponentFixture<ModalCheckIn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCheckIn],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCheckIn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});