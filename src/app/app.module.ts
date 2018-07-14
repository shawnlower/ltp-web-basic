import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';


import { AppComponent } from './components/app/app.component';
import { AppRoutingModule } from './app-routing.module';
import { BasicEditorComponent } from './components/basic-editor/basic-editor.component';
import { CardComponent } from './components/card/card.component';
import { HomeComponent } from './components/home/home.component';
import { ItemDirective } from './directives/item.directive';
import { ItemHeaderComponent } from './components/item-header/item-header.component';
import { ItemSectionComponent } from './components/item-section/item-section.component';
import { ItemsListComponent } from './components/items-list/items-list.component';
import { ModalEditorComponent } from './components/modal-editor/modal-editor.component';
import { UsageComponent } from './components/usage/usage.component';
import { reducer } from './reducers';
import { reducers } from './reducers';
import { FormValidatorDirective } from './directives/form-validator.directive';

@NgModule({
  declarations: [
    AppComponent,
    BasicEditorComponent,
    CardComponent,
    FormValidatorDirective,
    HomeComponent,
    ItemDirective,
    ItemHeaderComponent,
    ItemSectionComponent,
    ItemsListComponent,
    ModalEditorComponent,
    UsageComponent
  ],
  entryComponents: [
    ItemHeaderComponent,
    ItemSectionComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgbModule.forRoot(),
    ReactiveFormsModule,
    /**
     * StoreModule.provideStore is imported once in the root module, accepting a reducer
     * function or object map of reducer functions. If passed an object of
     * reducers, combineReducers will be run creating your application
     * meta-reducer. This returns all providers for an @ngrx/store
     * based application.
    StoreModule.forRoot(reducer),
     */
    StoreModule.forRoot({... reducers }),
    StoreDevtoolsModule.instrument(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() { }
}
