import { Routes } from '@angular/router';
import { EstudianteCrear } from './componentes/estudiante-crear/estudiante-crear';
import { EstudiantesListar } from './componentes/estudiantes-listar/estudiantes-listar';
import { BuscarPorRut } from './componentes/buscar-por-rut/buscar-por-rut';
import { BuscarBicicletasPorRut } from './componentes/buscar-bicicletas-por-rut/buscar-bicicletas-por-rut';
import { Inicio } from './componentes/inicio/inicio';
import { BicicletaListar } from './componentes/bicicleta-listar/bicicleta-listar';
import { BicicletaCrear } from './componentes/bicicleta-crear/bicicleta-crear';
import { BicicletaEstudianteCrear } from './componentes/bicicleta-estudiante-crear/bicicleta-estudiante-crear';
import { CrearAcceso } from './componentes/crear-acceso/crear-acceso';
import { LoginAcceso } from './componentes/login-acceso/login-acceso';
import { ListarAcceso } from './componentes/listar-acceso/listar-acceso';
import { RegistrarEstablecimiento } from './componentes/registrar-establecimiento/registrar-establecimiento';
import { ListarEstablecimiento } from './componentes/listar-establecimiento/listar-establecimiento';
import { BicicletaExito } from './componentes/bicicleta-exito/bicicleta-exito';

export const routes: Routes = [
    {
        path: "",
        component: Inicio
    },
    {
        path: "crear-acceso",
        component: CrearAcceso
    },
    {
        path: "login-acceso",
        component: LoginAcceso
    },
    {
        path: "listar-acceso",
        component: ListarAcceso
    },
    {
        path: "estudiante-crear",
        component: EstudianteCrear
    },
    {
        path: "estudiante-listar",
        component: EstudiantesListar
    },
    {
        path: "buscar-por-rut",
        component: BuscarPorRut
    },
    {
        path: "buscar-bicicleta-por-rut",
        component: BuscarBicicletasPorRut
    },
    {
        path: "bicicleta-listar",
        component: BicicletaListar
    },
    {
        path: "bicicleta-crear",
        component: BicicletaCrear
    },
    {
        path: "bicicleta-estudiante-crear",
        component: BicicletaEstudianteCrear
    },
    {
        path: "bicicleta-exito",
        component: BicicletaExito
    },
    {
        path: "registrar-establecimiento",
        component: RegistrarEstablecimiento
    }
    ,
    {
        path: "listar-establecimiento",
        component: ListarEstablecimiento
    }
];
