import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModalSenhaGerada } from './modal-senha-gerada.component';

describe('ModalSenhaGerada', () => {
  let component: ModalSenhaGerada;
  let fixture: ComponentFixture<ModalSenhaGerada>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalSenhaGerada],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: { senha: '1234' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalSenhaGerada);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});