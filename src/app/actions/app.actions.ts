import { Action } from '@ngrx/store';

import * as actions from '../actions/app.actions';

export const TOGGLE_EDITOR = '[Action] Toggle Editor';
export const TOGGLE_USAGE = '[Action] Toggle Usage';

export const SELECT_NEXT_ITEM = '[Action] Select Next Item';
export const SELECT_PREV_ITEM = '[Action] Select Prev Item';
export const ACTIVATE_ITEM = '[Action] Activate Item';

/**
 * Toggle the editor modal
 */
export class ToggleEditor implements Action {
  readonly type = TOGGLE_EDITOR;

  constructor() {
  }
}

/**
 * Toggle the usage screen
 */
export class ToggleUsage implements Action {
  readonly type = TOGGLE_USAGE;

  constructor() {
  }
}


/**
 * Select Next Item (e.g. in component list)
 */
export class SelectNextItem implements Action {
  readonly type = SELECT_NEXT_ITEM;

  constructor() {
  }
}

/**
 * Select Prev Item (e.g. in component list)
 */
export class SelectPrevItem implements Action {
  readonly type = SELECT_PREV_ITEM;

  constructor() {
  }
}

/**
 * Activate item
 */
export class ActivateItem implements Action {
  readonly type = ACTIVATE_ITEM;

  constructor() {
  }
}

export type Actions
  = ToggleEditor
  | ToggleUsage
  | SelectNextItem
  | SelectPrevItem
  | ActivateItem;
