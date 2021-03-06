import { Item } from '../models/item.model';
import * as actions from '../actions/editor.actions';

export interface State {
  dirty: boolean; // Whether any controls have been modified
  item: Item; // The item currently being edited
}

export const initialState: State = {
  dirty: false,
  item: null
};

export function reducer(state: State = initialState, action) {

  switch (action.type) {
    case actions.LOAD_ITEM: {
      // console.log(action.type, action.payload);
      return { ...state, item: action.payload };
    }

    case actions.RESET_EDITOR: {
      return state;
    }

    case actions.EDITOR_OPENED: {
      return state;
    }

    case actions.EDITOR_CLOSED: {
      return state;
    }

    default: {
      return state;
    }

  }
}


