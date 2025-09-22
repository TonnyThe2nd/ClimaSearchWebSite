import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Componente } from './componente/componente';
import { Map } from './map/map';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Componente],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('weather');
}
