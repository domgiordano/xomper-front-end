import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
} from '@angular/core'
import { TEAM_COLORS } from 'src/app/constants/team-colors'
import { zoomModalAnimation } from 'src/app/animations/zoom-modal.animation'
import { TaxiSquadPlayerModel } from 'src/app/models/taxi-squad-player.model'

@Component({
  selector: 'app-taxi-squad-player-modal',
  templateUrl: './taxi-squad-player-modal.component.html',
  styleUrls: ['./taxi-squad-player-modal.component.scss'],
  animations: [zoomModalAnimation],
})
export class TaxiSquadPlayerModalComponent {
  @Input() startPos!: {
    top: number
    left: number
    width: number
    height: number
  }
  @HostBinding('@zoomAnimation') get zoom() {
    return {
      value: '',
      params: this.startPos || { top: 0, left: 0, width: 0, height: 0 },
    }
  }
  @Input() player!: TaxiSquadPlayerModel
  @Output() close = new EventEmitter<void>()

  onClose() {
    this.close.emit()
  }
  getTeamStyle(team: string | undefined) {
    if (!team) {
      return {
        backgroundColor: '#2a2a2a',
        border: '2px solid #444',
      }
    }

    const key = team.toLowerCase()
    const colors = TEAM_COLORS[key]

    if (!colors) {
      return {
        backgroundColor: '#2a2a2a',
        border: '2px solid #444',
      }
    }

    return {
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      color: '#fff',
    }
  }
  getHeightFeetInches(height: number): string {
    if (!height) return ''
    const feet = Math.floor(height / 12)
    const inches = height % 12
    return `${feet}'${inches}"`
  }
  onSteal(): void {
    // Your logic to handle the "steal" action goes here.
    console.log(`Steal action initiated for ${this.player.getFullName()}!`)
    // You might want to call a service, emit an event, or close the modal.
  }

  private getOrdinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
  }

  // Method called by the button to determine the text
  getStealPickText(draftRound: number | string): string {
    if (draftRound === 'Undrafted') {
      return '5th Round'
    }

    const round = Number(draftRound)
    const stealRound = round - 1
    if (stealRound <= 0) {
      return '5th Round'
    }

    return this.getOrdinal(stealRound) + ' Round'
  }
}
