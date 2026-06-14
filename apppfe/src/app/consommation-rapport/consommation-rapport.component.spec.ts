import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsommationRapportComponent } from './consommation-rapport.component';

describe('ConsommationRapportComponent', () => {
  let component: ConsommationRapportComponent;
  let fixture: ComponentFixture<ConsommationRapportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsommationRapportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsommationRapportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
