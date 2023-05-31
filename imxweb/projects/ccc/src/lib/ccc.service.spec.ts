import { TestBed } from '@angular/core/testing';

import { CccService } from './ccc.service';

describe('CccService', () => {
  let service: CccService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CccService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
