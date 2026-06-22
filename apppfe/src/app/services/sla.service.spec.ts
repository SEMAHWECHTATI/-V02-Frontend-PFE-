import { TestBed } from '@angular/core/testing';

import { SLAService } from './sla.service';

describe('SLAService', () => {
  let service: SLAService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SLAService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
