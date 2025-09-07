// toast.component.ts

import { Component, Input, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  animations: [
    trigger('fade', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [animate('500ms ease-in')]), // Fade in over 500ms
      transition(':leave', [animate('500ms ease-out')]), // Fade out over 500ms
    ]),
  ],
})
export class ToastComponent implements OnInit {
  @Input() toastType: 'positive' | 'negative' = 'positive';
  message: string = '';
  isVisible: boolean = false;

  constructor(private ToastService: ToastService) {}

  ngOnInit() {
    this.ToastService.registerToast(this);
  }

  showToast(msg: string) {
    this.message = msg;
    this.isVisible = true;

    setTimeout(() => {
      this.isVisible = false;
      this.message = '';
    }, 3000); // The toast will disappear after 3 seconds
  }
}
