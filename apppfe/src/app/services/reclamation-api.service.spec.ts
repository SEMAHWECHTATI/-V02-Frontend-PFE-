import { TestBed } from '@angular/core/testing';

import { ReclamationApiService } from './reclamation-api.service';

describe('ReclamationApiService', () => {
  let service: ReclamationApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReclamationApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
