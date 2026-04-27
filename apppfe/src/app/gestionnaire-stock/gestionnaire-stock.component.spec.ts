import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionnaireStockComponent } from './gestionnaire-stock.component';

describe('GestionnaireStockComponent', () => {
  let component: GestionnaireStockComponent;
  let fixture: ComponentFixture<GestionnaireStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionnaireStockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionnaireStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
