import { Component, Inject, PLATFORM_ID, AfterViewInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map.html',
  styleUrl: './map.css'
})
export class Map implements AfterViewInit, OnDestroy, OnChanges {
  private map: any;
  private L: any;
  private marcadorAtual: any = null;
  private circuloAtual: any = null;
  private destroy$ = new Subject<void>();
  private pesquisaSubject = new Subject<string>();
  
  @Input() localPesquisado: string = '';
  
  constructor(@Inject(PLATFORM_ID) public platformId: Object) {
    this.configurarDebounce();
  }

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private configurarDebounce() {
    this.pesquisaSubject.pipe(
      debounceTime(800), 
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(local => {
      if (local && local.length > 2) { 
        this.buscarELocalizarNoMapa(local);
      }
    });
  }

  async ngAfterViewInit() {
    if (this.isBrowser) {
      this.L = await import('leaflet');
      
      delete (this.L.Icon.Default.prototype as any)._getIconUrl;
      this.L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
        iconUrl: 'assets/leaflet/marker-icon.png',
        shadowUrl: 'assets/leaflet/marker-shadow.png',
      });

      this.initializeMap();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['localPesquisado'] && this.isBrowser && this.L && this.map) {
      const novoLocal = changes['localPesquisado'].currentValue;
      
      if (novoLocal) {
        this.pesquisaSubject.next(novoLocal);
      } else {
        this.limparElementosMapa();
        this.map.setView([-23.5505, -46.6333], 13);
      }
    }
  }

  private initializeMap() {
    if (!this.L) return;

    this.map = this.L.map('map').setView([-23.5505, -46.6333], 13);

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private async buscarELocalizarNoMapa(local: string) {
    if (!local || !this.map) return;

    console.log('Buscando local no mapa:', local);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(local)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.length > 0) {
        const loc = data[0];
        const lat = parseFloat(loc.lat);
        const lon = parseFloat(loc.lon);

        console.log('Local encontrado:', lat, lon);

        this.limparElementosMapa();

        this.map.setView([lat, lon], 13);

        this.marcadorAtual = this.L.marker([lat, lon]).addTo(this.map)
          .bindPopup(`<strong>${local}</strong><br>Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`)
          .openPopup();

        this.circuloAtual = this.L.circle([lat, lon], {
          color: 'blue',
          fillColor: '#1e90ff',
          fillOpacity: 0.1,
          radius: 1000
        }).addTo(this.map);

        this.map.fitBounds(this.circuloAtual.getBounds());

      } else {
        console.log('Local não encontrado:', local);
        this.limparElementosMapa();
      }
    } catch (error) {
      console.error('Erro ao buscar local no mapa:', error);
    }
  }

  private limparElementosMapa() {
    if (this.marcadorAtual) {
      this.map.removeLayer(this.marcadorAtual);
      this.marcadorAtual = null;
    }

    if (this.circuloAtual) {
      this.map.removeLayer(this.circuloAtual);
      this.circuloAtual = null;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.limparElementosMapa();
    if (this.map) {
      this.map.remove();
    }
  }
}