import { TestBed } from '@angular/core/testing';

import { CccInitService } from './ccc-init.service';

describe('CccInitService', () => {
  let service: CccInitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CccInitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
