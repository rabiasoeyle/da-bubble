import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogSendEmailPwComponent } from './dialog-send-email-pw.component';

describe('DialogSendEmailPwComponent', () => {
  let component: DialogSendEmailPwComponent;
  let fixture: ComponentFixture<DialogSendEmailPwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogSendEmailPwComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogSendEmailPwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
