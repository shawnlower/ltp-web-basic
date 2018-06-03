import { Action } from '@ngrx/store';

import * as itemActions from './item.actions';

import { initialState, ItemState, AppState } from './app.state';

// Our 'Item' class stores a JSON payload, as well as the content (dataType) of the item
// The JSON payload is a JSON-LD object

export class Item {
  constructor(
    public url: string,
    public dataType: string,
    public json: object) { }
}

// Consts for actions

export function itemReducer(state: ItemState = initialState, action) {

  console.log('Received action', action.type);
  console.log('Received state: ', state);
  switch (action.type) {
    case itemActions.ADD_ITEM: {
      console.log('Adding item');
      const data = [...state.data, action.payload];
      return { ...state, data };
    }

    case itemActions.REMOVE_ITEM: {
      console.log('Removing item');
      const data = state.data.filter(
        item => item !== action.payload
      );
      return { ...state, data };
    }

    case itemActions.SELECT_ITEM:
      console.log('Selected item: ' + JSON.stringify(action.payload));
      return state;

    case itemActions.DESELECT_ITEM:
      console.log('De-selected item: ' + JSON.stringify(action.payload));
      return state;

    default:
      console.log(`... what happen? (${JSON.stringify(action.type)}) ...` + JSON.stringify(action.payload));
      return state;

  }
}
