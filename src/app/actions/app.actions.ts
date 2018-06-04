import { Action } from '@ngrx/store';

import * as actions from '../actions/app.actions';

export const TOGGLE_EDITOR = '[Action] Toggle Editor';

/**
 * Toggle the editor modal
 */
export class ToggleEditor implements Action {
  readonly type = TOGGLE_EDITOR;

  constructor() {
  }
}

export type Actions
  = ToggleEditor;
