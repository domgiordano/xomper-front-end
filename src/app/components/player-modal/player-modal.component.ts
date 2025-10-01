import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { PlayerModel } from 'src/app/models/player.model';
import { animate, style, transition, trigger } from '@angular/animations';
import { TEAM_COLORS } from 'src/app/constants/team-colors';
import { zoomModalAnimation } from 'src/app/animations/zoom-modal.animation';

@Component({
  selector: 'app-player-modal',
  templateUrl: './player-modal.component.html',
  styleUrls: ['./player-modal.component.scss'],
  animations: [zoomModalAnimation]
})
export class PlayerModalComponent {
  @Input() startPos!: { top: number, left: number, width: number, height: number };
  @HostBinding('@zoomAnimation') get zoom() {
    return { value: '', params: this.startPos || { top: 0, left: 0, width: 0, height: 0 } };
  }
  @Input() player!: PlayerModel;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
  getTeamStyle(team: string | undefined) {
    if (!team) {
      return {
        backgroundColor: '#2a2a2a',
        border: '2px solid #444'
      };
    }

    const key = team.toLowerCase();
    const colors = TEAM_COLORS[key];

    if (!colors) {
      return {
        backgroundColor: '#2a2a2a',
        border: '2px solid #444'
      };
    }

    return {
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      color: '#fff'
    };
  }
  getHeightFeetInches(height: number): string {
    if (!height) return '';
    const feet = Math.floor(height / 12);
    const inches = height % 12;
    return `${feet}'${inches}"`;
  }
}

