import { Action } from '@ngrx/store';

import { Item } from '../models/item.model';

export const LOAD_ITEM = '[Action] Load Item';
export const RESET_EDITOR = '[Action] Reset Editor';
export const EDITOR_CLOSED = '[Action] Editor Closed';
export const EDITOR_OPENED = '[Action] Editor Opened';

/*
 * Reset all controls in editor modal
 */
export class ResetEditor implements Action {
  readonly type = RESET_EDITOR;

  constructor() {
  }
}

/*
 * Indicates that the editor modal was just closed
 */
export class EditorClosed implements Action {
  readonly type = EDITOR_CLOSED;

  constructor() {
  }
}

/*
 * Indicates that the editor modal was just opened
 *  - Load item if needed
 *  - Load default item
 */
export class EditorOpened implements Action {
  readonly type = EDITOR_OPENED;

  constructor() {
  }
}

// Load a new item
export class LoadItem implements Action {
  readonly type = LOAD_ITEM;

  constructor(public payload: Item) {
  }
}

export type Actions
  = ResetEditor
  | EditorOpened
  | EditorClosed
  | LoadItem;

