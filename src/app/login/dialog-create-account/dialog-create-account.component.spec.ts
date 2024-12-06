import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCreateAccountComponent } from './dialog-create-account.component';

describe('DialogCreateAccountComponent', () => {
  let component: DialogCreateAccountComponent;
  let fixture: ComponentFixture<DialogCreateAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogCreateAccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogCreateAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
