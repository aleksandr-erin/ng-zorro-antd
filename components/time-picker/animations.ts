import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';

export class AnimationDuration {
  static SLOW = '0.3s'; // Modal
  static BASE = '0.2s';
  static FAST = '0.1s'; // Tooltip
}

export class AnimationCurves {
  static EASE_BASE_OUT = 'cubic-bezier(0.7, 0.3, 0.1, 1)';
  static EASE_BASE_IN = 'cubic-bezier(0.9, 0, 0.3, 0.7)';
  static EASE_OUT = 'cubic-bezier(0.215, 0.61, 0.355, 1)';
  static EASE_IN = 'cubic-bezier(0.55, 0.055, 0.675, 0.19)';
  static EASE_IN_OUT = 'cubic-bezier(0.645, 0.045, 0.355, 1)';
  static EASE_OUT_BACK = 'cubic-bezier(0.12, 0.4, 0.29, 1.46)';
  static EASE_IN_BACK = 'cubic-bezier(0.71, -0.46, 0.88, 0.6)';
  static EASE_IN_OUT_BACK = 'cubic-bezier(0.71, -0.46, 0.29, 1.46)';
  static EASE_OUT_CIRC = 'cubic-bezier(0.08, 0.82, 0.17, 1)';
  static EASE_IN_CIRC = 'cubic-bezier(0.6, 0.04, 0.98, 0.34)';
  static EASE_IN_OUT_CIRC = 'cubic-bezier(0.78, 0.14, 0.15, 0.86)';
  static EASE_OUT_QUINT = 'cubic-bezier(0.23, 1, 0.32, 1)';
  static EASE_IN_QUINT = 'cubic-bezier(0.755, 0.05, 0.855, 0.06)';
  static EASE_IN_OUT_QUINT = 'cubic-bezier(0.86, 0, 0.07, 1)';
}

const ANIMATION_TRANSITION_IN = `${AnimationDuration.BASE} ${AnimationCurves.EASE_OUT_QUINT}`;
const ANIMATION_TRANSITION_OUT = `${AnimationDuration.BASE} ${AnimationCurves.EASE_IN_QUINT}`;

export const slideMotion: AnimationTriggerMetadata = trigger('slideMotion', [
  state(
    'void',
    style({
      opacity: 0,
      transform: 'scaleY(0.8)'
    })
  ),
  state(
    'enter',
    style({
      opacity: 1,
      transform: 'scaleY(1)'
    })
  ),
  transition('void => *', [animate(ANIMATION_TRANSITION_IN)]),
  transition('* => void', [animate(ANIMATION_TRANSITION_OUT)])
]);

export const slideAlertMotion: AnimationTriggerMetadata = trigger('slideAlertMotion', [
  transition(':leave', [
    style({ opacity: 1, transform: 'scaleY(1)', transformOrigin: '0% 0%' }),
    animate(
      `${AnimationDuration.SLOW} ${AnimationCurves.EASE_IN_OUT_CIRC}`,
      style({
        opacity: 0,
        transform: 'scaleY(0)',
        transformOrigin: '0% 0%'
      })
    )
  ])
]);