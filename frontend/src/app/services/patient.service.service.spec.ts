import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PatientServiceService } from './patient.service.service';

describe('PatientServiceService', () => {
  let service: PatientServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PatientServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
