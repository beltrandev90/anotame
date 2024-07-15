import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Componente, Horario } from 'src/app/interfaces/interfaces';
import { HorariosService } from '../../services/horarios.service';
import { AuthService } from 'src/app/services/auth.service';
import { MenuService } from 'src/app/services/menu.service';
import { ThemeService } from 'src/app/services/theme.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-horarios',
  templateUrl: './horarios.page.html',
  styleUrls: ['./horarios.page.scss'],
})
export class HorariosPage implements OnInit, AfterViewInit {

  ionicForm: FormGroup;

  id_empresa: string | null = null; // Cambiado a string
  id_user: number | null = null;

  horarios: any;
  horariosFiltrados: any;

  diasSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  diasSeleccionados: Set<string> = new Set<string>();

  cerradoMostrado: { [key: string]: boolean } = {};

  horariosSeleccionados: Horario[] = [];
  hora_apertura: { [key: string]: string } = {};
  hora_cierre: { [key: string]: string } = {};

  rol!: any;
  isDarkMode: any;
  componentes!: Observable<Componente[]>;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    public horariosService: HorariosService,
    public authService: AuthService,
    public themeService: ThemeService,
    public usuariosService: UsuariosService,
    public menuService: MenuService,
  ) {
    // Inicialización del formulario y obtención del rol del usuario
    this.ionicForm = this.formBuilder.group({
      id_empresa: [''],
      id_user: [''],
    });
    this.getUserRole();
    this.isDarkMode = this.themeService.isDarkTheme();
  }

  ngOnInit() {
    // Obtener la lista de componentes del menú
    this.componentes = this.menuService.getMenuOpts();

    this.obtenerIdUsuario();
  }

  ngAfterViewInit() {
    // Realiza las operaciones de filtrado después de que los datos han sido completamente cargados
    this.getHorarios(); 
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
      this.getHorarios();
 
    } else {
      console.error('Usuario no encontrado en el almacenamiento local');
    }
  }

  // Obtener el rol del usuario y verificar permisos
  getUserRole() {
    this.rol = localStorage.getItem('userRole');

    if (!(this.rol === 'administrador' || this.rol === 'encargado')) {
      console.error('Usuario con rol', this.rol, 'no tiene permiso para acceder a esta opción.');
      this.authService.logout().subscribe(
        () => {

          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Error al cerrar sesión:', error);
          // Manejo de errores
        }
      )
    }
  }

  agregarHorario(dia: string): void {
    if (!dia) {
      console.error('El valor del día es nulo o indefinido.');
      return;
    }
  
    const hora_apertura = this.hora_apertura[dia];
    const hora_cierre = this.hora_cierre[dia];
  
    // Obtener el id_empresa del localStorage
    const id_empresa = localStorage.getItem('id_empresa');
  
    if (!id_empresa) {
      console.error('El id_empresa no está presente en el localStorage.');
      return;
    }
  
    const nuevoHorario: Horario = {
      dia: dia,
      hora_apertura: hora_apertura,
      hora_cierre: hora_cierre,
      id_user: this.id_user !== null ? this.id_user : 0,
      id_empresa: id_empresa
    };
  
    // Simula la llamada al servicio subirHorario
    const horariosGuardados = localStorage.getItem('horarios');
    const horarios = horariosGuardados ? JSON.parse(horariosGuardados) : [];
  
    const index = horarios.findIndex((h: { dia: string; id_empresa: string }) => h.dia === dia && h.id_empresa === id_empresa);
  
    if (index !== -1) {
      // Si existe un horario para el mismo día e id_empresa, actualiza el horario existente
      horarios[index].hora_apertura = nuevoHorario.hora_apertura;
      horarios[index].hora_cierre = nuevoHorario.hora_cierre;
    } else {
      // Si no existe un horario para el mismo día e id_empresa, agrega el nuevo horario
      horarios.push(nuevoHorario);
    }
  
    localStorage.setItem('horarios', JSON.stringify(horarios));
  
    // Actualiza horariosSeleccionados después de la operación
    this.horariosSeleccionados = horarios;
    window.location.reload();
  
    console.log('Horarios después de agregar:', this.horariosSeleccionados);
  }
  


  // Método para obtener los horarios del servidor
  getHorarios(): void {
    // Obtener el id_empresa del localStorage
    const id_empresa = localStorage.getItem('id_empresa');

    if (id_empresa) {
      // Obtener los horarios almacenados en localStorage o realizar acciones según tu lógica
      const horariosGuardados = localStorage.getItem('horarios');
      if (horariosGuardados) {
        // Parsear los horarios
        this.horarios = JSON.parse(horariosGuardados);

        // Filtrar los horarios para obtener solo aquellos que coincidan con el id_empresa actual
        this.horariosFiltrados = this.horarios.filter((horario: any) => horario.id_empresa === id_empresa);

        // Loguea todos los horarios y los horarios filtrados
        console.log('Todos los horarios:', this.horarios);
        console.log('Horarios filtrados:', this.horariosFiltrados);
      } else {
        console.error('No se encontraron horarios en el localStorage.');
        this.horarios = [];
        this.horariosFiltrados = [];
        this.initHorariosPredeterminados();
      }
    } else {
      console.error('No se encontró el id de la empresa en el localStorage.');
    }
  }

  // Inicializar horarios predeterminados
  initHorariosPredeterminados() {
    this.horariosSeleccionados = this.diasSemana.map(dia => ({
      dia: dia,
      hora_apertura: 'cerrado',
      hora_cierre: 'cerrado',
      id_user: this.id_user !== null ? this.id_user : 0,
      id_empresa: this.id_empresa !== null ? this.id_empresa : ''
    }));

    this.cerradoMostrado = {};
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkTheme(this.isDarkMode);
  }

  cerrarSesion(): void {
    this.authService.logout().subscribe();
  }
}
