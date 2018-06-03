import { BrowserModule } from '@angular/platform-browser';
import {
         BrowserAnimationsModule
} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ItemsListComponent } from './items-list/items-list.component';
import { ModalEditorComponent } from './modal-editor/modal-editor.component';
import { BasicEditorComponent } from './basic-editor/basic-editor.component';
import { reducer } from './reducers';
// import { reducer } from './reducers/item.reducer';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ItemsListComponent,
    ModalEditorComponent,
    BasicEditorComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    /**
     * StoreModule.provideStore is imported once in the root module, accepting a reducer
     * function or object map of reducer functions. If passed an object of
     * reducers, combineReducers will be run creating your application
     * meta-reducer. This returns all providers for an @ngrx/store
     * based application.
    StoreModule.forRoot(reducer),
     */
    StoreModule.forRoot({ item: reducer }),
    StoreDevtoolsModule.instrument(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() { }
}
