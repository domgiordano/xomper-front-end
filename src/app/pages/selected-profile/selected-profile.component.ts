import { Component } from "@angular/core";

@Component({
  selector: 'app-selected-profile',
  template: `<app-profile [mode]="'selected'"></app-profile>`
})
export class SelectedProfileComponent {}