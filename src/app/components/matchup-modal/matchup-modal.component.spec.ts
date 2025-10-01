import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchupModalComponent } from './matchup-modal.component';

describe('MatchupModalComponent', () => {
  let component: MatchupModalComponent;
  let fixture: ComponentFixture<MatchupModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MatchupModalComponent]
    });
    fixture = TestBed.createComponent(MatchupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
