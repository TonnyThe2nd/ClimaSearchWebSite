import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Dados, Service } from '../services/service';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Map } from '../map/map';

@Component({
  selector: 'app-componente',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    Map
  ],
  templateUrl: './componente.html',
  styleUrls: ['./componente.css']
})
export class Componente { 
  local: string = '';
  dados? : Dados;
  loading: boolean = false;
  erro: string = '';

  constructor(private service : Service, private cdr : ChangeDetectorRef){}

  pesquisarLocal(){
  console.log('Pesquisando local:', this.local);
  this.service.GetLatitude(this.local).subscribe({
    next: (res) => {
      console.log('Coordenadas encontradas:', res[0].lat, res[0].lon);
      this.pegarDadosClima(res[0].lat, res[0].lon)
    },
    error: (err) => {
      console.error('Erro ao buscar coordenadas:', err);
      this.erro = "Cidade não encontrada";
    }
  })
}

  pegarDadosClima(lat: number, lon: number){
    this.loading = true;
    this.erro = '';
    this.service.GetClima(lat, lon).pipe(
      finalize(()=> {
        this.loading=false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (res) => {
        this.dados = res;
      },
      error: (err) => {
        this.erro = "Cidade não encontrada ou erro na API: " + err.Message
        this.loading = false;
      }
    })
  }

  getIconUrl(icon: string) {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }
}
