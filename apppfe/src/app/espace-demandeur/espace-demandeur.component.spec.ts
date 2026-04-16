import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspaceDemandeurComponent } from './espace-demandeur.component';

describe('EspaceDemandeurComponent', () => {
  let component: EspaceDemandeurComponent;
  let fixture: ComponentFixture<EspaceDemandeurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspaceDemandeurComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EspaceDemandeurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
