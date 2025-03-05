import { TestBed } from '@angular/core/testing';

import { SamplePluginService } from './sample-plugin.service';

describe('SamplePluginService', () => {
  let service: SamplePluginService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SamplePluginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
