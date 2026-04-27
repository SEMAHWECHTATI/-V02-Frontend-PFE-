import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { demandeurGuard } from './demandeur.guard';

describe('demandeurGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => demandeurGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
