import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GererDemandeInscriComponent } from './gerer-demande-inscri.component';

describe('GererDemandeInscriComponent', () => {
  let component: GererDemandeInscriComponent;
  let fixture: ComponentFixture<GererDemandeInscriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GererDemandeInscriComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GererDemandeInscriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
