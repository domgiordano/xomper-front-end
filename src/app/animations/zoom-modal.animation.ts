import { animate, style, transition, trigger } from '@angular/animations';

export const zoomModalAnimation = trigger('zoomAnimation', [
  transition(':enter', [
    style({
      top: '{{top}}px',
      left: '{{left}}px',
      width: '{{width}}px',
      height: '{{height}}px',
      opacity: 0,
      transform: 'scale(1)'
    }),
    animate('250ms ease-out', style({
      top: '50%',
      left: '50%',
      width: '90%',
      height: 'auto',
      opacity: 1,
      transform: 'translate(-50%, -50%) scale(1)'
    }))
  ], { params: { top: 0, left: 0, width: 0, height: 0 } }),
  transition(':leave', [
    animate('200ms ease-in', style({
      top: '{{top}}px',
      left: '{{left}}px',
      width: '{{width}}px',
      height: '{{height}}px',
      opacity: 0,
      transform: 'scale(1)'
    }))
  ], { params: { top: 0, left: 0, width: 0, height: 0 } })
]);
