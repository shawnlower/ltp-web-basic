import { Item } from '../models/item.model';

import * as actions from '../actions/item.actions';

export const initialState: State = {
  loaded: false,
  data: [],
};

export interface State {
  loaded: boolean;
  data: Item[];
}

export function reducer(state: State = initialState, action) {

  console.log('Received action', action.type);
  console.log('Received state: ', state);
  switch (action.type) {
    case actions.LOADED_ITEM: {
      console.log('Adding item');
      const data = [...state.data, action.payload];
      return { ...state, data };
    }

    case actions.REMOVE_ITEM: {
      console.log('Removing item');
      const data = state.data.filter(
        item => item !== action.payload
      );
      return { ...state, data };
    }

    case actions.SELECT_ITEM:
      console.log('Selected item: ' + JSON.stringify(action.payload));
      return state;

    case actions.DESELECT_ITEM:
      console.log('De-selected item: ' + JSON.stringify(action.payload));
      return state;

    default:
      console.log('itemReducer: default action');
      return state;

  }
}

