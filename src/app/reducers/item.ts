import { Item } from '../models/item.model';
import * as actions from '../actions/item.actions';

export interface State {
  loaded: boolean;
  data: Item[];
}

export const initialState: State = {
  loaded: false,
  data: [],
};

export function reducer(state: State = initialState, action) {

  switch (action.type) {
    case actions.LOADED_ITEM: {
      console.log(this.type);
      const data = [...state.data, action.payload];
      return { ...state, data };
    }

    case actions.REMOVE_ITEM: {
      console.log(this.type);
      const data = state.data.filter(
        item => item !== action.payload
      );
      return { ...state, data };
    }

    case actions.SELECT_ITEM:
      console.log(this.type);
      return state;

    case actions.DESELECT_ITEM:
      console.log(this.type);
      return state;

    default:
      console.log('itemReducer: default action');
      return state;

  }
}
