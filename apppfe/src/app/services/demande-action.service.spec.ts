import { TestBed } from '@angular/core/testing';

import { DemandeActionService } from './demande-action.service';

describe('DemandeActionService', () => {
  let service: DemandeActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemandeActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
