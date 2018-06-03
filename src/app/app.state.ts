import { Item } from './item';

export interface AppState {
    item: Item;
    showEditor: boolean;
}

export const initialState: ItemState = {
  loaded: false,
  data: [],
};

export interface ItemState {
  loaded: boolean;
  data: Item[];
}


