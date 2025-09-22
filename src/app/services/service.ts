import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Dados {
  main: { temp: number; temp_min: number; temp_max: number; humidity: number; };
  weather: { description: string; icon: string; }[];
  wind: { speed: number; };
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class Service {
  chaveClima = "5e60ddea80e0f338afe9d48f9543165f";
  urlClima: string = "https://api.openweathermap.org/data/2.5/weather"
  urlLocal = "https://nominatim.openstreetmap.org/search"

  constructor(private http : HttpClient){}

  public GetLatitude(pais: string) : Observable<any>{
    return this.http.get(`${this.urlLocal}?q=${encodeURIComponent(pais)}&format=jsonv2&limit=1`, {
          headers: { 'User-Agent': 'WeatherApp/1.0' } });
  }

  public GetClima(lat: number, lon: number): Observable<Dados> {
    return this.http.get<Dados>(`${this.urlClima}?lat=${lat}&lon=${lon}&appid=${this.chaveClima}&units=metric&lang=pt_br`)
  }
}
