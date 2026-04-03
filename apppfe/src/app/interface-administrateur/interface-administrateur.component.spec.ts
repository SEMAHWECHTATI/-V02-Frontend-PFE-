import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterfaceAdministrateurComponent } from './interface-administrateur.component';

describe('InterfaceAdministrateurComponent', () => {
  let component: InterfaceAdministrateurComponent;
  let fixture: ComponentFixture<InterfaceAdministrateurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterfaceAdministrateurComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InterfaceAdministrateurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
