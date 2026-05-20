import { TestBed } from '@angular/core/testing';

import { DemandematrielServiceService } from './demandematriel-service.service';

describe('DemandematrielServiceService', () => {
  let service: DemandematrielServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemandematrielServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
