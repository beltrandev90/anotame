import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Componente } from 'src/app/interfaces/interfaces';
import { AuthClienteService } from 'src/app/services/auth-cliente.service';
import { MenuCliService } from 'src/app/services/menu-cli.service';
import { ReservasService } from 'src/app/services/reservas.service';
import { ThemeService } from 'src/app/services/theme.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { NotificacionService } from 'src/app/services/notificacion.service';
import { HorariosService } from 'src/app/services/horarios.service';

@Component({
  selector: 'app-reservascli',
  templateUrl: './reservascli.page.html',
  styleUrls: ['./reservascli.page.scss'],
})
export class ReservascliPage implements OnInit {
  @Output() reservaEnviada = new EventEmitter<any>();

  id_empresa: number | null = null;
  id_user: number | null = null;

  envioReservaEnProceso = false;

  reservaForm!: FormGroup;
  reservas: any;
  idEmpresa: any;

  esLocale = es;
  horariosRestaurante: any[] = [];

  fechaSeleccionada: any;
  fechaCreacionActual: string = '';
  static ESTADO_PENDIENTE = 'pendiente';
  static ESTADO_CONFIRMADA = 'confirmada';
  static ESTADO_CANCELADA = 'cancelada';

  submitted = false;
  rol!: any;
  isDarkMode: any;
  componentes!: Observable<Componente[]>;

  constructor(
    private formBuilder: FormBuilder,
    public alertController: AlertController,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private menuCli: MenuCliService,
    private reservasService: ReservasService,
    private clienteService: ClientesService,
    public authServiceCli: AuthClienteService,
    public horariosService: HorariosService,
    private notificacionService: NotificacionService,
    public themeService: ThemeService
  ) {
    this.getUserRole();
    this.isDarkMode = this.themeService.isDarkTheme();

    // Inicializa el formulario para las reservas
    this.reservaForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      numPax: ['', Validators.required],
      fechaHoraReserva: ['', Validators.required],
      notasEspeciales: ['', Validators.required],
      estadoReserva: ['pendiente', Validators.required],
      fechaCreacion: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.componentes = this.menuCli.getMenuOptsCli();
    this.obtenerIdUsuario();
    this.obtenerHorariosRestaurante();
  }

  cargarHorariosDesdeLocalStorage() {
    const horariosGuardados = localStorage.getItem('horarios');
    if (horariosGuardados) {
      this.horariosRestaurante = JSON.parse(horariosGuardados);
      console.log(
        'Horarios del restaurante cargados desde localStorage:',
        this.horariosRestaurante
      );
    }
  }


  mostrarMensajeError(mensaje: string) {
    this.alertController
      .create({
        header: 'Atención',
        message: mensaje,
        buttons: ['OK'],
      })
      .then((alert) => alert.present());
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

 
    } else {
      console.error('Usuario no encontrado en el almacenamiento local');
    }
  }

  obtenerHorariosRestaurante() {
    const id_empresaSeleccionado = localStorage.getItem('id_empresa');

    if (id_empresaSeleccionado) {
      const horariosString = localStorage.getItem('horarios');
      this.horariosRestaurante = horariosString
        ? JSON.parse(horariosString)
        : [];

      this.horariosRestaurante = this.horariosRestaurante.filter(
        (horario) => horario.id_empresa === id_empresaSeleccionado
      );

      console.log(
        'Horarios del restaurante cargados desde localStorage:',
        this.horariosRestaurante
      );
    } else {
      console.error('Id_empresa no encontrado.');
    }
  }

  enviarReserva() {
    if (this.reservaForm.valid) {
      const idEmpresaString = localStorage.getItem('id_empresa');
      const id_empresa = idEmpresaString ? parseInt(idEmpresaString, 10) : null;
      const id_cliente = localStorage.getItem('id_cliente'); // Obtener id_cliente del localStorage
  
      if (!this.envioReservaEnProceso && id_cliente) { // Verificar si se encontró id_cliente
        this.envioReservaEnProceso = true;
  
        const nuevaReserva = {
          numPax: this.reservaForm.get('numPax')?.value,
          fechaHoraReserva: this.reservaForm.get('fechaHoraReserva')?.value,
          notasEspeciales: this.reservaForm.get('notasEspeciales')?.value,
          estadoReserva: this.reservaForm.get('estadoReserva')?.value,
          fechaCreacion:
            this.reservaForm.get('fechaCreacion')?.value ||
            new Date().toISOString(),
          id_empresa: id_empresa,
          id_cliente: id_cliente, // Incluir id_cliente en la reserva
        };
  
        const reservasGuardadas = localStorage.getItem('reservas') || '[]';
        const reservas = JSON.parse(reservasGuardadas);
  
        reservas.push(nuevaReserva);
  
        localStorage.setItem('reservas', JSON.stringify(reservas));

        this.reservaForm.reset();
  
        // setTimeout(() => {
        //   window.location.reload();
        // }, 500);
      }
    } else {
      console.error('El formulario de reserva no es válido.');
    }
  }
  

  guardarReservaEnLocalStorage(reserva: any) {
    const reservasGuardadas = localStorage.getItem('reservas') || '[]';
    const reservas = JSON.parse(reservasGuardadas);

    reservas.push(reserva);

    localStorage.setItem('reservas', JSON.stringify(reservas));
  }

  cargarReservaGuardadas() {
    const reservasGuardadas = localStorage.getItem('reservas');
    if (reservasGuardadas) {
      this.reservas = JSON.parse(reservasGuardadas);
    }
  }

  eliminarOpcion(campo: string): void {
    this.reservaForm.get(campo)?.reset();
  }

  obtenerFechaActual(): void {
    const ahora = new Date();
    this.fechaCreacionActual = ahora.toISOString();
    console.log(this.fechaCreacionActual);

    this.reservaForm.get('fechaCreacion')?.setValue(this.fechaCreacionActual);
  }

  getUserRole() {
    this.rol = localStorage.getItem('userRole');
    console.log(this.rol);

    if (!(this.rol === 'cliente')) {
      console.error(
        'Cliente con rol',
        this.rol,
        'no tiene permiso para acceder a esta opción.'
      );

      this.authServiceCli.logout().subscribe(
        () => {
          this.router.navigate(['/logincli']);
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
    this.authServiceCli.logout().subscribe();
  }
}
