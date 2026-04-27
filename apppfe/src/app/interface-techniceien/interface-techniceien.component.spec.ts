import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterfaceTechniceienComponent } from './interface-techniceien.component';

describe('InterfaceTechniceienComponent', () => {
  let component: InterfaceTechniceienComponent;
  let fixture: ComponentFixture<InterfaceTechniceienComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterfaceTechniceienComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InterfaceTechniceienComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
