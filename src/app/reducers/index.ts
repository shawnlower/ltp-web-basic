import { ActionReducer, combineReducers, compose } from '@ngrx/store';
import { environment } from '../../environments/environment';

/**
 * storeFreeze prevents state from being mutated. When mutation occurs, an
 * exception will be thrown. This is useful during development mode to
 * ensure that none of the reducers accidentally mutates the state.
 */
import { storeFreeze } from 'ngrx-store-freeze';

/**
 * Every reducer module's default export is the reducer function itself. In
 * addition, each module should export a type or interface that describes
 * the state of the reducer plus any selector functions. The `* as`
 * notation packages up all of the exports into a single object.
 * - https://github.com/ngrx/example-app/blob/master/src/app/reducers/index.ts
 */
import * as fromApp from './app.reducer';
import * as fromEditor from './editor.reducer';
import * as fromItem from './item.reducer';

export interface State {
  app: fromApp.State;
  editor: fromEditor.State;
  item: fromItem.State;
}

export const reducers = {
  app: fromApp.reducer,
  editor: fromEditor.reducer,
  item: fromItem.reducer
};

const developmentReducer: ActionReducer<State> = combineReducers(reducers);
const productionReducer: ActionReducer<State> = combineReducers(reducers);

export function reducer(state: any, action: any) {
  if (environment.production) {
    return productionReducer(state, action);
  } else {
    return developmentReducer(state, action);
  }
}
