import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobeComponent } from './components/globe/globe.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Globe_Integration';
}
