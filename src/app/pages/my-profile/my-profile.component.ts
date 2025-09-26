import { Component } from "@angular/core";

@Component({
  selector: 'app-my-profile',
  template: `<app-profile [mode]="'my'"></app-profile>`
})
export class MyProfileComponent {}