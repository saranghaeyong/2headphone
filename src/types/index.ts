export type HeadphoneState = 'assembled' | 'exploding' | 'exploded' | 'reassembling';

export type InteractionState = 'idle' | 'pressing' | 'dragging' | 'releasing';

export type CursorMode = 'default' | 'rotate' | 'open' | 'click' | 'reconstruct' | 'drag';

export type ActiveDestination = null | 'films' | 'music';

export type ViewportMode = 'mobile' | 'tablet' | 'desktop';

export interface HeadphonePartTransform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

