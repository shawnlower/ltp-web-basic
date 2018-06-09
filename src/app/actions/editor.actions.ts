import { Action } from '@ngrx/store';

export const RESET_EDITOR = '[Action] Reset Editor';

/**
 * Reset all controls in editor modal
 */
export class ResetEditor implements Action {
  readonly type = RESET_EDITOR;

  constructor() {
  }
}

export type Actions
  = ResetEditor;

