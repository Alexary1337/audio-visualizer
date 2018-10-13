import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AudioVisualizerComponent } from './components/audio-visualizer/audio-visualizer.component';
import { VisualizeServiceComponent } from './components/visualize-service/visualize-service.component';

const routes: Routes = [
  { path: '', redirectTo: '/new', pathMatch: 'full' },
  { path: 'old', component: VisualizeServiceComponent },
  { path: 'new', component: AudioVisualizerComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
