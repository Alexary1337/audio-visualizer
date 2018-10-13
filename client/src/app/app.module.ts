import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AudioVisualizerComponent } from './components/audio-visualizer/audio-visualizer.component';
import { AppRoutingModule } from './/app-routing.module';
import { VisualizeServiceComponent } from './components/visualize-service/visualize-service.component';
import { DxButtonModule, DxFileUploaderModule, DxLoadPanelModule, DxTextBoxModule } from 'devextreme-angular';

@NgModule({
  declarations: [
    AppComponent,
    AudioVisualizerComponent,
    VisualizeServiceComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    DxButtonModule,
    DxFileUploaderModule,
    DxLoadPanelModule,
    DxTextBoxModule
  ],
  providers: [HttpClient],
  bootstrap: [AppComponent]
})
export class AppModule { }
