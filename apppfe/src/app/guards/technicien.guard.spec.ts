import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { technicienGuard } from './technicien.guard';

describe('technicienGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => technicienGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
