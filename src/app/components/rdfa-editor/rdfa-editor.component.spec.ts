import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RdfaEditorComponent } from './rdfa-editor.component';

describe('RdfaEditorComponent', () => {
  let component: RdfaEditorComponent;
  let fixture: ComponentFixture<RdfaEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RdfaEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RdfaEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
