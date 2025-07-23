import { TestBed } from '@angular/core/testing';

import { DailyTrackingService } from './daily-tracking.service';

describe('DailyTrackingService', () => {
  let service: DailyTrackingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DailyTrackingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
