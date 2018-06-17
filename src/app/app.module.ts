import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { BasicEditorComponent } from './components/basic-editor/basic-editor.component';
import { CardComponent } from './components/card/card.component';
import { HomeComponent } from './components/home/home.component';
import { ItemsListComponent } from './components/items-list/items-list.component';
import { ItemHeaderComponent } from './components/item-header/item-header.component';
import { ItemSectionComponent } from './components/item-section/item-section.component';
import { ModalEditorComponent } from './components/modal-editor/modal-editor.component';
import { RdfaEditorComponent } from './components/rdfa-editor/rdfa-editor.component';

import { ItemDirective } from './directives/item.directive';

import { reducer } from './reducers';
import { reducers } from './reducers';

// import { KeyboardShortcutsService } from './services/keyboard-shortcuts.service';

@NgModule({
  declarations: [
    AppComponent,
    BasicEditorComponent,
    RdfaEditorComponent,
    CardComponent,
    HomeComponent,
    ItemHeaderComponent,
    ItemSectionComponent,
    ItemsListComponent,
    ModalEditorComponent,
    ItemDirective,
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
