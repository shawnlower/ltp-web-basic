import { BrowserModule } from '@angular/platform-browser';
import {
         BrowserAnimationsModule
} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { StoreModule } from '@ngrx/store';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ItemsListComponent } from './items-list/items-list.component';
import { ModalEditorComponent } from './modal-editor/modal-editor.component';
import { itemReducer } from './item';
import { BasicEditorComponent } from './basic-editor/basic-editor.component';

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
    StoreModule.forRoot({ item: itemReducer })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
