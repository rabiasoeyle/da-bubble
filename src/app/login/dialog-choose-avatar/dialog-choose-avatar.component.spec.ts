import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogChooseAvatarComponent } from './dialog-choose-avatar.component';

describe('DialogChooseAvatarComponent', () => {
  let component: DialogChooseAvatarComponent;
  let fixture: ComponentFixture<DialogChooseAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogChooseAvatarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogChooseAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
