import { ComponentFixture, TestBed } from '@angular/core/testing'

import { TaxiSquadPlayerModalComponent } from './taxi-squad-player-modal.component'

describe('PlayerModalComponent', () => {
  let component: TaxiSquadPlayerModalComponent
  let fixture: ComponentFixture<TaxiSquadPlayerModalComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaxiSquadPlayerModalComponent],
    })
    fixture = TestBed.createComponent(TaxiSquadPlayerModalComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
