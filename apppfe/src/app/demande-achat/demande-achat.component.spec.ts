import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeAchatComponent } from './demande-achat.component';

describe('DemandeAchatComponent', () => {
  let component: DemandeAchatComponent;
  let fixture: ComponentFixture<DemandeAchatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeAchatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DemandeAchatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
