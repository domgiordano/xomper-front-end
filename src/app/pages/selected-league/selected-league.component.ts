import { Component } from "@angular/core";

@Component({
  selector: 'app-selected-league',
  template: `<app-league [mode]="'selected'"></app-league>`
})
export class SelectedLeagueComponent {}