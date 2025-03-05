import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMembersToChannelComponent } from './add-members-to-channel.component';

describe('AddMembersToChannelComponent', () => {
  let component: AddMembersToChannelComponent;
  let fixture: ComponentFixture<AddMembersToChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMembersToChannelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMembersToChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
