import * as actions from '../actions/app.actions';

export interface State {
    loaded: boolean;
    showEditor: boolean;
}

export const initialState: State = {
  loaded: false,
  showEditor: false,
};

export function reducer(state: State = initialState, action) {

  switch (action.type) {
    case actions.TOGGLE_EDITOR: {
      return { ...state, showEditor: !state.showEditor};
    }

    case actions.SELECT_NEXT_ITEM :
    case actions.SELECT_PREV_ITEM: {
      return state;
    }

    default: {
      return state;
    }

  }
}

