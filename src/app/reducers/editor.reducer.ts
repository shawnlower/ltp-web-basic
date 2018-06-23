import { Item } from '../models/item.model';
import * as actions from '../actions/editor.actions';

export interface State {
  dirty: boolean; // Whether any controls have been modified
  item: Item; // The item currently being edited
}

export const initialState: State = {
  dirty: false,
  // url, dataType, json
  item: new Item('', 'http://schema.org/Thing', {})
};

export function reducer(state: State = initialState, action) {

  switch (action.type) {
    case actions.LOAD_ITEM: {
      console.log(action.type, action.payload);
      return { ...state, item: action.payload };
    }

    case actions.RESET_EDITOR: {
      console.log(action.type, action.payload);
      return state;
    }

    case actions.EDITOR_OPENED: {
      console.log(action.type);
      return state;
    }

    case actions.EDITOR_CLOSED: {
      console.log(action.type);
      return state;
    }

    default: {
      return state;
    }

  }
}


