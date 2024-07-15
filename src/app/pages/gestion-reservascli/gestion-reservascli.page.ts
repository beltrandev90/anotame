import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Componente } from 'src/app/interfaces/interfaces';

import { AuthClienteService } from 'src/app/services/auth-cliente.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { MenuService } from 'src/app/services/menu.service';
import { ReservasService } from 'src/app/services/reservas.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-gestion-reservascli',
  templateUrl: './gestion-reservascli.page.html',
  styleUrls: ['./gestion-reservascli.page.scss'],
})
export class GestionReservascliPage implements OnInit, AfterViewInit {

  id_empresa: number | null = null;
  id_user: number | null = null;

  coloresFilas = ['#FFECBA', '#FFFFFF'];

  reservas: any;
  reservasFiltradas: any;

  clienteData: any;

  rol!: any;
  isDarkMode: any;
  componentes!: Observable<Componente[]>;

  constructor(
    private router: Router,
    public authServiceCli: AuthClienteService,
    public clienteService: ClientesService,
    private reservasService: ReservasService,
    public menuService: MenuService,
    public themeService: ThemeService
  ) {
    this.getUserRole();
    // console.log('Rol obtenido:', this.rol);
    this.isDarkMode = this.themeService.isDarkTheme();
  }

  ngOnInit() {
    this.componentes = this.menuService.getMenuOpts();
    this.obtenerIdUsuario();
  }

  ngAfterViewInit() {
    // Realiza las operaciones de filtrado después de que los datos han sido completamente cargados
    this.getReservas();
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
      this.getReservas();
    } else {
      console.error('Usuario no encontrado en el almacenamiento local');
    }
  }
  
  // Método para obtener reservas desde localStorage
  getReservas(): void {
    const id_empresa = localStorage.getItem('id_empresa');
  
    if (id_empresa) {
      // Obtén el array de reservas almacenado en localStorage o inicialízalo
      const reservasGuardadas = localStorage.getItem('reservas');
  
      if (reservasGuardadas) {
        // Parsear las reservas
        this.reservas = JSON.parse(reservasGuardadas);
  
        // Filtrar las reservas para obtener solo aquellas que coincidan con el id_empresa actual
        this.reservasFiltradas = this.reservas.filter((review: any) => review.id_empresa === parseInt(id_empresa, 10));
  
        // Loguea todas las reservas y las reservas filtradas
        console.log('Todas las reservas:', this.reservas);
        console.log('Reservas filtradas:', this.reservasFiltradas);
      } else {
        console.error('No se encontraron reservas en el localStorage.');
        this.reservas = [];
        this.reservasFiltradas = [];
      }
    } else {
      console.error('ID de empresa no encontrado en el localStorage.');
    }
  }
  
  
  


  // Dar formato a fechas y horas
  formatFechaHora(fecha: Date | string | null): string {
    const datePipe = new DatePipe('en-US');
    const isValidDate = fecha && !isNaN(new Date(fecha).getTime());
    return isValidDate ? datePipe.transform(fecha, 'dd/MM/yyyy HH:mm') ?? '' : '';
  }

  // Funciones auxiliares relacionadas con la gestión de reservas
  private obtenerEstadoColor(reserva: any, opcionesEstado: any[]): any {
    const estadoReserva = reserva.estadoReserva.toLowerCase();
    const color = this.getEstadoColor(estadoReserva);
    return { estado: estadoReserva, color: color };
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'color-naranja';
      case 'aceptada':
        return 'color-verde';
      case 'cancelada':
        return 'color-rojo';
      default:
        return 'color-naranja';
    }
  }

  // Obtener el rol del usuario autenticado
  getUserRole() {
    this.rol = localStorage.getItem('userRole');
    // console.log(this.rol);

    if (!(this.rol === 'cliente')) {
      console.error('Usuario con rol', this.rol, 'no tiene permiso para acceder a esta opción.');
      this.authServiceCli.logout().subscribe(
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
    this.authServiceCli.logout().subscribe();
  }
}
