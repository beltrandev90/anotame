import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { Componente, Horario } from 'src/app/interfaces/interfaces';

import { ContactoService } from 'src/app/services/contacto.service';
import { HorariosService } from 'src/app/services/horarios.service';
import { AuthClienteService } from 'src/app/services/auth-cliente.service';
import { MenuCliService } from 'src/app/services/menu-cli.service';
import { ThemeService } from 'src/app/services/theme.service';
import { ClientesService } from 'src/app/services/clientes.service';

@Component({
  selector: 'app-contactocli',
  templateUrl: './contactocli.page.html',
  styleUrls: ['./contactocli.page.scss'],
})
export class ContactocliPage implements OnInit, AfterViewInit {

  horariosSeleccionados: Horario[] = [];

  cerradoMostrado: { [key: string]: boolean } = {};

  id_empresa: string | null = null;
  id_user: number | null = null;

  diasSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  horarios: any;
  horariosFiltrados: any;

  datos: any;
  datosFiltrados: any;

  rol: any;
  isDarkMode: any;
  componentes!: Observable<Componente[]>;

  constructor(
    private router: Router,
    public authServiceCliente: AuthClienteService,
    private contactService: ContactoService,
    private horariosService: HorariosService,
    public themeService: ThemeService,
    public clienteService: ClientesService,
    private menuCli: MenuCliService,
  ) {
    this.getUserRole();
    this.isDarkMode = this.themeService.isDarkTheme();
  }

  ngOnInit() {
    this.componentes = this.menuCli.getMenuOptsCli();

    this.obtenerIdUsuario();
  }

  ngAfterViewInit() {
    this.getDatos();
    this.getHorarios();
  }

  getDatos(): void {
    const id_empresa = localStorage.getItem('id_empresa');

    console.log('ID Empresa (antes del filtrado):', id_empresa);

    const datosGuardados = localStorage.getItem('datos');

    if (datosGuardados) {
      this.datos = JSON.parse(datosGuardados);

      if (id_empresa !== null) {
        // Filtrar los datos para obtener solo aquellos que coincidan con el id_empresa actual
        this.datosFiltrados = this.datos.filter((dato: any) => dato.id_empresa === id_empresa);
        
        console.log('Todos los datos:', this.datos);
        console.log('Datos filtrados:', this.datosFiltrados);
      } else {
        console.error('ID Empresa no encontrado en el localStorage.');
      }
    } else {
      console.error('No se encontraron datos en el localStorage.');
      this.datos = [];
      this.datosFiltrados = [];
    }
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

  obtenerIdUsuario(): void {
    const usuarioString = localStorage.getItem('usuario') || localStorage.getItem('usuarios_');

    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);

      // Asigna directamente el id_empresa del usuario que ha iniciado sesión
      this.id_empresa = usuario.id_empresa || (usuario[0] ? usuario[0].id_empresa : null);
      this.id_user = usuario.id_user || null;

      // Loguea el valor de id_empresa después de la asignación
      console.log('ID Empresa (después de asignar):', this.id_empresa);

      // Llama a getDatos() después de establecer id_empresa
      this.getDatos();
    } else {
      console.error('Usuario no encontrado en el almacenamiento local');
    }
  }


  getUserRole() {
    this.rol = localStorage.getItem('userRole');
  
    if (!(this.rol === 'cliente')) {
      console.error('Cliente con rol', this.rol, 'no tiene permiso para acceder a esta opción.');
      this.authServiceCliente.logout().subscribe(
        () => {
          this.router.navigate(['/logincli']);
        },
        (error) => {
          console.error('Error al cerrar sesión:', error);
        }
      )
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkTheme(this.isDarkMode);
  }

  cerrarSesion(): void {
    this.authServiceCliente.logout().subscribe();
  }
}
