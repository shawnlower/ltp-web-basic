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
    default:
      return state;

  }
}

