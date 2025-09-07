import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastComponent: any;

  registerToast(toastComponent: any) {
    this.toastComponent = toastComponent;
  }

  showPositiveToast(message: string) {
    if (this.toastComponent) {
      this.toastComponent.toastType = 'positive';
      this.toastComponent.showToast(message);
    }
  }

  showNegativeToast(message: string) {
    if (this.toastComponent) {
      this.toastComponent.toastType = 'negative';
      this.toastComponent.showToast(message);
    }
  }
}
