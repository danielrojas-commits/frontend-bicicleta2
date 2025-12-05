import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-establecimiento-listar-bicicleta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './establecimiento-listar-bicicleta.component.html',
  styleUrls: ['./establecimiento-listar-bicicleta.component.css']
})
export class EstablecimientoListarBicicletaComponent implements OnInit {
  establecimientoId = '690d03b8394c53154066b6e0';
  selectedDate: string = '';
  bicicletas: any[] = [];
  establecimiento: any = null;
  estudiantes: any[] = [];
  loading = false;
  error: string = '';
  showBicicletas = false;
  today: string = new Date().toISOString().split('T')[0];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEstablecimientoInfo();
  }

  loadEstablecimientoInfo(): void {
    this.http.get(`https://backend-registroformulario.onrender.com/api-backend-prueba/establecimiento/${this.establecimientoId}`)
      .subscribe({
        next: (data: any) => {
          this.establecimiento = data;
          this.estudiantes = data.estudiantes || [];
        },
        error: (err) => {
          this.error = 'Error loading establishment information';
          console.error(err);
        }
      });
  }

  cargarBicicletas(): void {
    if (!this.selectedDate) {
      this.error = 'Por favor selecciona una fecha';
      return;
    }

    this.loading = true;
    this.error = '';
    this.bicicletas = [];

    const formattedDate = this.formatDate(this.selectedDate);
    const apiUrl = `https://backend-registroformulario.onrender.com/api-backend-prueba/bicicleta/establecimiento/${this.establecimientoId}/fecha/${formattedDate}`;

    this.http.get(apiUrl).subscribe({
      next: (data: any) => {
        this.bicicletas = Array.isArray(data) ? data : data.data || [];
        this.loading = false;

        if (this.bicicletas.length === 0) {
          this.error = 'No hay información de bicicletas para la fecha seleccionada';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al cargar las bicicletas. Por favor intenta de nuevo.';
        console.error(err);
      }
    });
  }

  formatDate(dateString: string): string {
    return dateString;
  }

  toggleBicicletas(): void {
    this.showBicicletas = !this.showBicicletas;
  }
}
