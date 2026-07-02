import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeActionComponent } from './demande-action.component';

describe('DemandeActionComponent', () => {
  let component: DemandeActionComponent;
  let fixture: ComponentFixture<DemandeActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeActionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DemandeActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
