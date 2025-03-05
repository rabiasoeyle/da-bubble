import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsOfChannelComponent } from './details-of-channel.component';

describe('DetailsOfChannelComponent', () => {
  let component: DetailsOfChannelComponent;
  let fixture: ComponentFixture<DetailsOfChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsOfChannelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsOfChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
