import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlaGestionComponent } from './sla-gestion.component';

describe('SlaGestionComponent', () => {
  let component: SlaGestionComponent;
  let fixture: ComponentFixture<SlaGestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlaGestionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SlaGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
