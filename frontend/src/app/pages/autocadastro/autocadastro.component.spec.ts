import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AutocadastroComponent } from './autocadastro.component';

describe('AutocadastroComponent', () => {
  let component: AutocadastroComponent;
  let fixture: ComponentFixture<AutocadastroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocadastroComponent, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutocadastroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});