import { Action } from '@ngrx/store';

export const TOGGLE_EDITOR = '[Action] Toggle Editor';

/**
 * Toggle the editor modal
 */
export class ToggleEditorAction implements Action {
  readonly type = TOGGLE_EDITOR;

  constructor() {
  }
}
