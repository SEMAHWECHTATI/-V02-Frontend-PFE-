import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigGlobaleComponent } from './config-globale.component';

describe('ConfigGlobaleComponent', () => {
  let component: ConfigGlobaleComponent;
  let fixture: ComponentFixture<ConfigGlobaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigGlobaleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigGlobaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
