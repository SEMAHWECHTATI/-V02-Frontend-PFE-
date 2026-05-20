import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandematrielComponent } from './demandematriel.component';

describe('DemandematrielComponent', () => {
  let component: DemandematrielComponent;
  let fixture: ComponentFixture<DemandematrielComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandematrielComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DemandematrielComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
