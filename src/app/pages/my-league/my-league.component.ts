import { Component } from "@angular/core";

@Component({
  selector: 'app-my-league',
  template: `<app-league [mode]="'my'"></app-league>`
})
export class MyLeagueComponent {}