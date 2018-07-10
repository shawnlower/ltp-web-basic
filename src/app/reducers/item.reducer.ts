import { Item } from '../models/item.model';
import * as actions from '../actions/item.actions';

export interface State {
  loaded: boolean;
  data: Item[];
  selectedItem: Item;
}

export const initialState: State = {
  loaded: false,
  data: [],
  selectedItem: null
};

export function reducer(state: State = initialState, action) {

  switch (action.type) {
    case actions.LOADED_ITEM: {
      const data = [...state.data, action.payload];
      return { ...state, data };
    }

    case actions.REMOVE_ITEM: {
      const data = state.data.filter(
        item => item !== action.payload
      );
      return { ...state, data };
    }

    case actions.UPDATE_ITEM: {
      const updated: Item = action.payload;
      const existing: Item =
        state.data.find(i => i.uri === updated.uri);

      state.data.splice(
        state.data.indexOf(existing), 1, updated);

      console.log(action, action.payload);
      return state;
    }

    case actions.SELECT_ITEM:
      return {...state, selectedItem: action.payload};

    case actions.DESELECT_ITEM:
      return state;

    default:
      return state;

  }


}

export const getSelected = (state: State) => state.selectedItem;


