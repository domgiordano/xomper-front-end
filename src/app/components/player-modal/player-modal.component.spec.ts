import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerModalComponent } from './player-modal.component';

describe('PlayerModalComponent', () => {
  let component: PlayerModalComponent;
  let fixture: ComponentFixture<PlayerModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerModalComponent]
    });
    fixture = TestBed.createComponent(PlayerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
