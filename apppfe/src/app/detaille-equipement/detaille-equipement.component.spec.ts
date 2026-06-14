import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailleEquipementComponent } from './detaille-equipement.component';

describe('DetailleEquipementComponent', () => {
  let component: DetailleEquipementComponent;
  let fixture: ComponentFixture<DetailleEquipementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailleEquipementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetailleEquipementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
