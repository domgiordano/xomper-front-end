import { Component } from "@angular/core";

@Component({
  selector: 'app-my-team',
  template: `<app-team [mode]="'my'"></app-team>`
})
export class MyTeamComponent {}