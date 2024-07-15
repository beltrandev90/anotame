import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { Componente, Usuario } from 'src/app/interfaces/interfaces';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-listauser',
  templateUrl: './listauser.page.html',
  styleUrls: ['./listauser.page.scss'],
})
export class ListauserPage implements OnInit, AfterViewInit {

  id_empresa: number | null = null;
  id_user: number | null = null;

  idEmpresa!: number | null;
  empleados: any;
  empleadosFiltrados: any;

  coloresFilas = ['#FFECBA', '#FFFFFF'];

  rol!: any;
  isDarkMode: any;
  componentes!: Observable<Componente[]>;

  constructor(
    private router: Router,
    private alertController: AlertController,
    public authService: AuthService,
  ) {
    this.getUserRole();
    // Inicializo el modo oscuro
    this.isDarkMode = JSON.parse(localStorage.getItem('isDarkMode') || 'false');
  }

  ngOnInit() {
    this.componentes = JSON.parse(localStorage.getItem('menuOpts') || '[]');

    this.obtenerIdUsuario();
  }

  ngAfterViewInit() {
    // Realiza las operaciones de filtrado después de que los datos han sido completamente cargados
    this.getEmpleados();
  }

  obtenerIdUsuario(): void {
    const usuarioString = localStorage.getItem('usuario') || localStorage.getItem('usuarios_');

    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);

      // Asigna directamente el id_empresa del usuario que ha iniciado sesión
      this.id_empresa = usuario.id_empresa || (usuario[0] ? usuario[0].id_empresa : null);
      this.id_user = usuario.id_user || null;

      // Loguea el valor de id_empresa después de la asignación
      console.log('ID Empresa (después de asignar):', this.id_empresa);

      // Llama a getTexto() después de establecer id_empresa
      this.getEmpleados();
    } else {
      console.error('Usuario no encontrado en el almacenamiento local');
    }
  }

  getUserRole() {
    this.rol = localStorage.getItem('userRole');
    // console.log(this.rol);

    // Verificar si el rol no es "administrador" 
    if (!(this.rol === 'administrador')) {
      console.error('Usuario con rol', this.rol, 'no tiene permiso para acceder a esta opción.');
      this.authService.logout().subscribe(
        () => {
          // Elimina cualquier informacion de session almacenada localmente

          // Redirigir al usuario a la pagina de inicion de sesion
          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Error al cerrar sesion:', error);
        }
      )
    }
  }

  getEmpleados() {
    // Obtiene el id de la empresa del localStorage
    const id_empresa = localStorage.getItem('id_empresa');

    if (id_empresa) {

        const empleadosGuardados = localStorage.getItem('usuarios_');

        if (empleadosGuardados) {

          this.empleados = JSON.parse(empleadosGuardados);
          this.empleadosFiltrados = this.empleados.filter((empleado: any) => empleado.id_empresa === id_empresa);

          console.log('Todos los empleados:', this.empleados);
          console.log('Empleados filtrados:', this.empleadosFiltrados);
        } else {
          console.error('El formato de datos en localStorage no es un array:');
          this.empleados = [];
          this.empleadosFiltrados = [];
        }
      } else {
        console.error('No se encontraron datos de empleados en localStorage.');
      }
  }

  borrarEmpleadoLocalStorage(id_user: any) {
    if (this.idEmpresa !== null) {
      try {
        // Obtener los empleados del localStorage
        const empleadosGuardados = localStorage.getItem(`usuarios_${this.idEmpresa}`);
  
        if (empleadosGuardados) {
          // Parsear los empleados
          let empleados = JSON.parse(empleadosGuardados);
  
          // Encontrar el índice del empleado que se va a borrar
          const index = empleados.findIndex((empleado: any) => empleado.id_user === id_user);
  
          if (index !== -1) {
            // Eliminar el empleado del array de empleados
            empleados.splice(index, 1);
  
            // Actualizar el localStorage con los empleados modificados
            localStorage.setItem(`usuarios_${this.idEmpresa}`, JSON.stringify(empleados));
  
            console.log('Empleados actualizados en localStorage:', empleados);
          } else {
            console.error('No se encontró ningún empleado con el id_user:', id_user);
          }
        } else {
          console.error('No se encontraron datos de empleados en localStorage.');
        }
      } catch (error) {
        console.error('Error al actualizar localStorage:', error);
      }
    } else {
      console.error('ID de empresa es nulo.');
    }
  }
  
  borrarEmpleado(id_user: any) {
    if (this.idEmpresa !== null) {
      try {
        // Obtener los empleados del localStorage
        const empleadosGuardados = localStorage.getItem(`usuarios_${this.idEmpresa}`);
  
        if (empleadosGuardados) {
          // Parsear los empleados
          let empleados = JSON.parse(empleadosGuardados);
  
          // Encontrar el índice del empleado que se va a borrar
          const index = empleados.findIndex((empleado: any) => empleado.id_user === id_user);
  
          if (index !== -1) {
            // Eliminar el empleado del array de empleados
            empleados.splice(index, 1);
  
            // Actualizar el localStorage con los empleados modificados
            localStorage.setItem(`usuarios_${this.idEmpresa}`, JSON.stringify(empleados));
  
            console.log('Empleados actualizados en localStorage:', empleados);
          } else {
            console.error('No se encontró ningún empleado con el id_user:', id_user);
          }
        } else {
          console.error('No se encontraron datos de empleados en localStorage.');
        }
      } catch (error) {
        console.error('Error al actualizar localStorage:', error);
      }
    } else {
      console.error('ID de empresa es nulo.');
    }
  }
  
  filtrarEmpleados(criterio: string, valor: string) {
    if (!valor) {
      valor = '';
    }

    // Asegúrate de que this.empleados tenga datos antes de filtrar
    if (Array.isArray(this.empleados)) {
      this.empleadosFiltrados = this.empleados.filter((empleado: any) => {
        const valorLower = valor.toLowerCase();
        switch (criterio) {
          case 'nombre':
            return empleado.nombre.toLowerCase().includes(valorLower);
          case 'email':
            return empleado.email.toLowerCase().includes(valorLower);
          default:
            return false;
        }
      });
    }
  }

  // Cambia el modo oscuro
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('isDarkMode', JSON.stringify(this.isDarkMode));
  }

  cerrarSesion(): void {
    this.authService.logout().subscribe();
  }
}
