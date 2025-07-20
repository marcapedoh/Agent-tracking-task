import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveDetailsComponent } from './inactive-details.component';

describe('InactiveDetailsComponent', () => {
  let component: InactiveDetailsComponent;
  let fixture: ComponentFixture<InactiveDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InactiveDetailsComponent]
    });
    fixture = TestBed.createComponent(InactiveDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
