import { Component } from "@angular/core";

@Component({
  selector: 'app-selected-team',
  template: `<app-team [mode]="'selected'"></app-team>`
})
export class SelectedTeamComponent {}