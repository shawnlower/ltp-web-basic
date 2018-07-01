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

    case actions.SELECT_ITEM:
      return {...state, selectedItem: action.payload};

    case actions.DESELECT_ITEM:
      return state;

    default:
      return state;

  }


}

export const getSelected = (state: State) => state.selectedItem;


