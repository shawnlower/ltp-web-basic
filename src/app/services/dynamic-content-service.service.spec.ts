import { TestBed, inject } from '@angular/core/testing';

import { DynamicContentService } from './dynamic-content-service.service';

describe('DynamicContentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DynamicContentService]
    });
  });

  it('should be created', inject([DynamicContentService], (service: DynamicContentService) => {
    expect(service).toBeTruthy();
  }));
});
