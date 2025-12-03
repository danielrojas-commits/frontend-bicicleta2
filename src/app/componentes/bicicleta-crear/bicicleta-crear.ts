import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Estudiante, EstudianteModel } from '../../servicios/estudiante';
import { Bicicleta, BicicletaModel } from '../../servicios/bicicleta';

@Component({
  selector: 'app-bicicleta-crear',
  imports: [ReactiveFormsModule, CommonModule, RouterModule, FormsModule],
  templateUrl: './bicicleta-crear.html',
  styleUrl: './bicicleta-crear.css'
})
export class BicicletaCrear {

  // Inyección de servicios
  private estudianteService = inject(Estudiante);
  private bicicletaService = inject(Bicicleta);

  // Variables de control
  mensaje = '';
  estudianteEncontrado: EstudianteModel | null = null;
  bicicletasDelEstudiante: BicicletaModel[] = [];
  pasoActual: 'buscar' | 'registrarEstudiante' | 'registrarBicicleta' | 'opciones' = 'buscar';
  bicicletaSeleccionada: BicicletaModel | null = null;

  // Formulario para buscar estudiante
  rutForm = new FormGroup({
    rut: new FormControl<string>('', Validators.required)
  });

  // Formulario para registrar estudiante
  estudianteForm = new FormGroup({
    nombre: new FormControl<string>('', Validators.required),
    apellido: new FormControl<string>('', Validators.required),
    rut: new FormControl<string>('', Validators.required),
    correo: new FormControl<string>('', [Validators.required, Validators.email])
  });

  // Formulario para registrar bicicleta
  bicicletaForm = new FormGroup({
    marca: new FormControl<string>('', Validators.required),
    modelo: new FormControl<string>(''),
    color: new FormControl<string>('', Validators.required),
    estacionamiento: new FormControl<string>('', Validators.required),
    identificador: new FormControl<string>('')
  });

  // QR generator state
  qrNumbers = Array.from({ length: 9 }, (_, i) => i + 1);
  qrSelection = 'A1';
  qrImageUrl: string | null = null;
  targetUrl: string | null = null;

  // ======================
  //  FLUJO PRINCIPAL
  // ======================

  buscarEstudiante() {
    const rut = this.rutForm.value.rut?.trim();
    if (!rut) return;

    this.estudianteService.buscarPorRut(rut).subscribe({
      next: (estudiante) => {
        this.estudianteEncontrado = estudiante;
        this.mensaje = `✅ Estudiante encontrado: ${estudiante.nombre} ${estudiante.apellido}`;
        this.obtenerBicicletasDeEstudiante(estudiante.rut);
      },
      error: () => {
        this.mensaje = '⚠️ Estudiante no encontrado. Debes registrarlo.';
        this.estudianteEncontrado = null;
        this.estudianteForm.patchValue({ rut });
        this.pasoActual = 'registrarEstudiante';
      }
    });
  }

  registrarEstudiante() {
    if (this.estudianteForm.invalid) {
      this.mensaje = '❌ Completa todos los campos para registrar estudiante.';
      return;
    }

    const nuevoEstudiante = this.estudianteForm.value as EstudianteModel;
    this.estudianteService.crearEstudiante(nuevoEstudiante).subscribe({
      next: (est) => {
        this.estudianteEncontrado = est;
        this.mensaje = '✅ Estudiante registrado correctamente.';
        this.pasoActual = 'registrarBicicleta';
      },
      error: () => (this.mensaje = '❌ Error al registrar estudiante.')
    });
  }

  obtenerBicicletasDeEstudiante(rut: string) {
    this.bicicletaService.getBicicletaPorEstudianteRut(rut).subscribe({
      next: (bicis) => {
        this.bicicletasDelEstudiante = bicis;
        if (bicis.length > 0) {
          this.mensaje = '⚠️ El estudiante ya tiene bicicletas registradas.';
          this.pasoActual = 'opciones';
        } else {
          this.pasoActual = 'registrarBicicleta';
        }
      },
      error: () => {
        this.bicicletasDelEstudiante = [];
        this.pasoActual = 'registrarBicicleta';
      }
    });
  }

  // ======================
  //  SELECCIONAR BICICLETA EXISTENTE
  // ======================

  seleccionarBicicleta(bici: BicicletaModel) {
    this.bicicletaSeleccionada = bici;

    // Mostrar mensaje con contexto
    this.mensaje = `✅ Bicicleta seleccionada: ${bici.marca} - ${bici.color}. 
    Puedes registrar otra o cambiar el estacionamiento.`;

    // Ofrecer directamente la opción de modificar estacionamiento
    this.pasoActual = 'registrarBicicleta';

    // Precargamos los datos de la bici, dejando el campo estacionamiento vacío para que el alumno lo cambie
    this.bicicletaForm.patchValue({
      marca: bici.marca,
      modelo: bici.modelo,
      color: bici.color,
      estacionamiento: ''
    });
  }
  
  // ======================
  //  OPCIONES AL ENCONTRAR BICICLETAS
  // ======================

  registrarNuevaBicicleta() {
    this.bicicletaSeleccionada = null;
    this.bicicletaForm.reset();
    this.pasoActual = 'registrarBicicleta';
  }

  cambiarEstacionamiento(bici: BicicletaModel) {
    this.bicicletaSeleccionada = bici;
    this.bicicletaForm.patchValue({
      marca: bici.marca,
      modelo: bici.modelo,
      color: bici.color,
      estacionamiento: ''
    });
    this.mensaje = `🔄 Cambia el estacionamiento para la bicicleta ${bici.marca} (${bici.color})`;
    this.pasoActual = 'registrarBicicleta';
  }

  // ======================
  //  REGISTRO DE BICICLETA
  // ======================

  registrarBicicleta() {
    if (!this.estudianteEncontrado) {
      this.mensaje = '⚠️ Primero debe existir un estudiante válido.';
      return;
    }
    if (this.bicicletaForm.invalid) {
      this.mensaje = '❌ Completa todos los campos requeridos.';
      return;
    }

    const formValues = this.bicicletaForm.getRawValue();

    if (this.bicicletaSeleccionada && (this.bicicletaSeleccionada._id || (this.bicicletaSeleccionada as any).id)) {
      const id = this.bicicletaSeleccionada._id ?? (this.bicicletaSeleccionada as any).id;
      // En actualizaciones, para crear el nuevo registro incluimos los campos mínimos que el backend suele requerir
      const payload: any = {
        rut: this.estudianteEncontrado.rut,
        marca: formValues.marca ?? this.bicicletaSeleccionada?.marca,
        modelo: formValues.modelo ?? this.bicicletaSeleccionada?.modelo,
        color: formValues.color ?? this.bicicletaSeleccionada?.color,
        estacionamiento: formValues.estacionamiento,
        identificador: (formValues as any).identificador
      };
      // Nuevo comportamiento: crear un registro nuevo con los datos actuales y eliminar el anterior
      const createNewThenDelete = (payloadToSend: any, oldId: string) => {
        console.debug('[BicicletaCrear] Creando nuevo registro con payload:', payloadToSend);
        this.bicicletaService.registrarBicicleta(payloadToSend).subscribe({
          next: (created: any) => {
            console.debug('[BicicletaCrear] Creación exitosa, id creado:', created?._id ?? created?.id ?? created);
            this.bicicletaService.eliminarBicicleta(oldId).subscribe({
              next: () => {
                console.debug('[BicicletaCrear] Eliminación exitosa del id anterior:', oldId);
                this.mensaje = '✅ Estacionamiento actualizado (registro nuevo creado y anterior eliminado).';
                // Abrir pestaña de éxito con los datos nuevos
                const createdObj = created && (created._id || created.id) ? created : { ...payloadToSend, _id: created?._id ?? created?.id };
                this.openSuccessTab(createdObj, 'updated');
                this.reiniciarFlujo();
              },
              error: (delErr) => {
                console.error('Error eliminando registro anterior, pero creación OK', delErr);
                this.mensaje = '⚠️ Registro nuevo creado, pero no se pudo eliminar el registro anterior (revisa logs).';
                this.reiniciarFlujo();
              }
            });
          },
          error: (createErr) => {
            console.error('Error creando nuevo registro de bicicleta', createErr);
            this.mensaje = `❌ No fue posible crear el nuevo registro (status: ${createErr?.status ?? '??'}).`;
          }
        });
      };

      createNewThenDelete(payload, id);
    } else {
      const bicicleta: any = {
        rut: this.estudianteEncontrado.rut,
        ...formValues
      };
      this.bicicletaService.registrarBicicleta(bicicleta).subscribe({
        next: () => {
          this.mensaje = '✅ Bicicleta registrada correctamente.';
          // Abrir pestaña de éxito
          this.openSuccessTab(bicicleta, 'created');
          this.reiniciarFlujo();
        },
        error: (err) => {
          console.error('Error registrar bicicleta', err);
          this.mensaje = `❌ Error al registrar bicicleta (status: ${err?.status ?? '??'})`;
        }
      });
    }
  }

  // ======================
  // QR Generation
  // ======================

  generarQR() {
    const estacionamiento = this.qrSelection || 'A1';
    const identificador = 'Campus-Lincoyan';
    // Construimos la URL de destino dentro de la app
    const base = window.location.origin;
    const path = '/bicicleta-estudiante-crear';
    const url = `${base}${path}?estacionamiento=${encodeURIComponent(estacionamiento)}&identificador=${encodeURIComponent(identificador)}`;
    this.targetUrl = url;
    // use external API to create QR image
    this.qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`;
  }

  copiarUrl() {
    if (!this.targetUrl) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(this.targetUrl);
    } else {
      const t = document.createElement('textarea');
      t.value = this.targetUrl;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      document.body.removeChild(t);
    }
  }

  reiniciarFlujo() {
    this.bicicletaForm.reset();
    this.rutForm.reset();
    this.estudianteEncontrado = null;
    this.bicicletasDelEstudiante = [];
    this.pasoActual = 'buscar';
  }

  // Abre una nueva pestaña mostrando los datos de la bicicleta creada/actualizada
  private openSuccessTab(payload: any, action: 'created' | 'updated' = 'created') {
    const params = new URLSearchParams();
    params.set('action', action);
    if (payload._id) params.set('id', payload._id);
    if (payload.id) params.set('id', payload.id);
    if (payload.rut) params.set('rut', payload.rut);
    if (payload.marca) params.set('marca', payload.marca);
    if (payload.modelo) params.set('modelo', payload.modelo ?? '');
    if (payload.color) params.set('color', payload.color);
    if (payload.estacionamiento) params.set('estacionamiento', payload.estacionamiento);
    if (payload.identificador) params.set('identificador', payload.identificador);
    const url = `${window.location.origin}/bicicleta-exito?${params.toString()}`;
    window.open(url, '_blank');
  }

}
