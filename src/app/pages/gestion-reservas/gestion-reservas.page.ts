import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, PopoverController } from '@ionic/angular';
import { Observable, interval } from 'rxjs';

import { DatePipe } from '@angular/common';
import { Componente } from 'src/app/interfaces/interfaces';
import { DetallesclientePage } from '../detallescliente/detallescliente.page';

import { AuthService } from 'src/app/services/auth.service';
import { MenuService } from 'src/app/services/menu.service';
import { ReservasService } from 'src/app/services/reservas.service';
import { ThemeService } from 'src/app/services/theme.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-gestion-reservas',
  templateUrl: './gestion-reservas.page.html',
  styleUrls: ['./gestion-reservas.page.scss'],
})
export class GestionReservasPage implements OnInit, AfterViewInit {


  @Component({
    selector: 'app-detallescliente',
    templateUrl: './detallescliente.page.html',
    styleUrls: ['./detallescliente.page.scss'],
  })

  @Input() cliente: any;

  id_empresa: number | null = null;
  id_user: number | null = null;

  reservasFiltradas: any;
  reservas: any;

  filtroMes: string | null = null;
  filtroAnio: string | null = null;

  idEmpresa!: number | null;

  coloresFilas = ['#FFECBA', '#FFFFFF'];

  rol!: any;
  isDarkMode: any;
  componentes!: Observable<Componente[]>;

  @ViewChild('idEmpresaInput') idEmpresaInput!: ElementRef;

  constructor(
    public alertController: AlertController,
    private popoverController: PopoverController,
    private router: Router,
    public authService: AuthService,
    public usuariosService: UsuariosService,
    public menuService: MenuService,
    private clientesService: ClientesService,
    private reservasService: ReservasService,
    public themeService: ThemeService
  ) {
    this.getUserRole();
    // console.log('Rol obtenido:', this.rol);
    this.isDarkMode = this.themeService.isDarkTheme();

    // Programar la ejecución periódica para verificar y eliminar reservas expiradas
    // const intervaloEjecucion = 60 * 60 * 1000; // Cada hora en milisegundos
    // interval(intervaloEjecucion).subscribe(() => {
    //   this.verificarYEliminarReservasExpiradas();
    // });

    const intervaloEjecucion = 5 * 60 * 1000; // Cada 5 minutos en milisegundos
    interval(intervaloEjecucion).subscribe(() => {
      this.verificarYEliminarReservasExpiradas();
    });

    this.getReservas();
  }

  ngOnInit() {
    this.componentes = this.menuService.getMenuOpts();

    // Programar la ejecución periódica para verificar y eliminar reservas expiradas cada minuto
    setInterval(() => {
      this.verificarYEliminarReservasExpiradas();
    }, 60000);

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

  aplicarFiltros() {
    // console.log('Filtros aplicados:', this.filtroMes, this.filtroAnio);

    this.reservasFiltradas = this.reservas.filter((reserva: any) => {
      const fechaReserva = new Date(reserva.fechaHoraReserva);
      const mesReserva = (fechaReserva.getMonth() + 1).toString().padStart(2, '0');
      const anioReserva = fechaReserva.getFullYear().toString();

      // Formatear el filtroMes y filtroAnio al formato de fecha de las reservas
      const filtroMesFormato = this.filtroMes ? this.filtroMes.padStart(2, '0') : null;
      const filtroAnioFormato = this.filtroAnio ? this.filtroAnio : null;

      // console.log('Fecha de la reserva:', fechaReserva);
      // console.log('Mes y año de la reserva:', mesReserva, anioReserva);
      // console.log('Filtros formateados:', filtroMesFormato, filtroAnioFormato);

      // Verificar si los filtros están definidos y coinciden con el mes y año de la reserva
      const resultadoFiltro = (!filtroMesFormato || mesReserva === filtroMesFormato) &&
        (!filtroAnioFormato || anioReserva === filtroAnioFormato);

      // console.log('Resultado del filtro:', resultadoFiltro);

      return resultadoFiltro;
    });

    console.log('Reservas filtradas:', this.reservasFiltradas);
  }

  borrarFiltro() {
    this.filtroAnio = '';
    this.filtroMes = '';
    // Restablecer otros filtros si es necesario
    this.aplicarFiltros(); // Aplicar los filtros después de restablecer
  }

  // Función para dar formato a fechas y horas
  formatFechaHora(fecha: Date | string | null): string {
    const datePipe = new DatePipe('en-US');
    // Validar si la fecha es válida
    const isValidDate = fecha && !isNaN(new Date(fecha).getTime());
    // Utilizar el operador ternario para proporcionar un valor predeterminado si la fecha no es válida
    return isValidDate ? datePipe.transform(fecha, 'dd/MM/yyyy HH:mm') ?? '' : '';
  }

  // Modifica la función cambiarEstadoReserva
  async cambiarEstadoReserva(reserva: any): Promise<void> {
    console.log('Cambiando estado de reserva:', reserva);
    const opcionesEstado = [
      { estado: 'pendiente', color: '#ff830f' },
      { estado: 'aceptada', color: '#008000' },
      { estado: 'cancelada', color: '#FF0000' }
    ];

    const buttons = opcionesEstado.map(opcion => ({
      text: opcion.estado.charAt(0).toUpperCase() + opcion.estado.slice(1),
      handler: () => {
        console.log('Cambiando estado:', opcion.estado);

        // Actualiza el estado de la reserva localmente
        reserva.estadoReserva = opcion.estado;

        // Actualiza la reserva en el array local
        const index = this.reservas.findIndex((r: any) => r.id_reserva === reserva.id_reserva);
        if (index !== -1) {
          this.reservas[index] = reserva;
        }

        // Guarda el array actualizado en localStorage
        localStorage.setItem('reservas', JSON.stringify(this.reservas));

        // Muestra un cuadro de diálogo con botones para cambiar el estado

      }
    }));

    // Mostrar un cuadro de diálogo con botones para cambiar el estado
    const alert = await this.alertController.create({
      header: 'Cambiar Estado',
      buttons: buttons
    });

    await alert.present();
  }

  async mostrarDetallesCliente(usuarioData: any) {
    const popover = await this.popoverController.create({
      component: DetallesclientePage,
      componentProps: {
        usuarioData: usuarioData,
      },
      translucent: true,
      cssClass: 'my-custom-popover'
    });

    await popover.present();

  }  

  // Funciones auxiliares relacionadas con la gestión de reservas
  private obtenerEstadoColor(reserva: any, opcionesEstado: any[]): any {
    const estadoReserva = reserva.estadoReserva.toLowerCase();
    const color = this.getEstadoColor(estadoReserva);
    return { estado: estadoReserva, color: color };
  }

  // Función para obtener el color asociado a un estado de reserva
  public getEstadoColor(estado: string): string {
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

  // Función para actualizar el estado de una reserva en el almacenamiento local
  private actualizarReservaLocalStorage(reserva: any): void {
    const reservasLocalStorage: any[] = JSON.parse(localStorage.getItem('reservas') || '[]');
    const index = reservasLocalStorage.findIndex(r => r.id_reserva && r.id_reserva === reserva.id_reserva);
    if (index !== -1) {
      // Actualizar estado y color de la reserva en el almacenamiento local
      reservasLocalStorage[index].estadoReserva = reserva.estadoReserva;
      reservasLocalStorage[index].estadoColor = reserva.estadoColor;
      // Actualizar toda la lista de reservas en el almacenamiento local
      localStorage.setItem('reservas', JSON.stringify(reservasLocalStorage));
    }
  }

  // Función para verificar y eliminar reservas expiradas
  verificarYEliminarReservasExpiradas(): void {
    const tiempoExpiracion = 60000; // 1 minuto en milisegundos
    this.reservas.forEach(async (reserva: any) => {
      const fechaHoraReserva = new Date(reserva.fechaHoraReserva).getTime();
      const tiempoActual = new Date().getTime();
      if (tiempoActual - fechaHoraReserva > tiempoExpiracion) {
        // Borrar reserva expirada de la base de datos
        await this.reservasService.borrarReserva(reserva.id_reserva);
        console.log(`Eliminando reserva expirada de la base de datos: ${reserva.id_reserva}`);
        window.location.reload();
      }
    });
  }

  // Funciones relacionadas con la autenticación del usuario
  getUserRole() {
    this.rol = localStorage.getItem('userRole');
    if (!(this.rol === 'administrador' || this.rol === 'encargado' || this.rol === 'camarero')) {
      this.authService.logout().subscribe(
        () => {

          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Error al cerrar sesión:', error);
        }
      );
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkTheme(this.isDarkMode);
  }

  cerrarSesion(): void {
    this.authService.logout().subscribe();
  }
}
