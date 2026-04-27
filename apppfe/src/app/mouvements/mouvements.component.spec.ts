import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MouvementsComponent } from './mouvements.component';

describe('MouvementsComponent', () => {
  let component: MouvementsComponent;
  let fixture: ComponentFixture<MouvementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MouvementsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MouvementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
