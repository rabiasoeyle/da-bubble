import { TestBed } from '@angular/core/testing';

import { ChatmessageService } from './chatmessage.service';

describe('ChatmessageService', () => {
  let service: ChatmessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatmessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
