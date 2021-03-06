import { Action } from '@ngrx/store';

import { Item } from '../models/item.model';

// Consts for actions
export const LOADED_ITEM = 'LOADED_ITEM';
export const UPDATE_ITEM = 'UPDATE_ITEM';
export const REMOVE_ITEM = 'REMOVE_ITEM';
export const SELECT_ITEM = 'SELECT_ITEM';
export const DESELECT_ITEM = 'DESELECT_ITEM';

/**
 * After an item has been loaded from the service
 */
export class ItemLoaded implements Action {
  readonly type = LOADED_ITEM;

  constructor(public payload: Item) {
  }
}

/*
 * Changes the currently selected item
 */
export class SelectItem implements Action {
  readonly type = SELECT_ITEM;

  constructor(public payload: Item) {
  }
}

/**
 * After an item has been updated *locally*
 * Should trigger a save to our remote store
 */
export class UpdateItem implements Action {
  readonly type = UPDATE_ITEM;

  constructor(public payload: Item) {
  }
}

/*
 * Remove an item from the current view
 */
export class RemoveItem implements Action {
  readonly type = REMOVE_ITEM;

  constructor(public payload: Item) {
  }
}

export type Actions
  = SelectItem
  | ItemLoaded
  | UpdateItem
  | RemoveItem
