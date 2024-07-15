import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Componente } from 'src/app/interfaces/interfaces';

import { AuthClienteService } from 'src/app/services/auth-cliente.service';
import { CartaUploadService } from 'src/app/services/carta-upload.service';
import { MenuCliService } from 'src/app/services/menucli.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-cartacli',
  templateUrl: './cartacli.page.html',
  styleUrls: ['./cartacli.page.scss'],
})
export class CartacliPage implements OnInit, AfterViewInit {

  BASE_RUTA: string = "http://localhost/anotame/APIANOTAME/public/uploads";

  selectedFile: File | null = null;

  // Arreglos para almacenar las cartas y las cartas filtradas
  cartas: any;
  cartasFiltradas: any;

  id_empresa: number | null = null;
  id_user: number | null = null;

  // Variable para almacenar el ID de la empresa
  idEmpresa: any;

  rol!: any;
  isDarkMode: boolean = false;
  componentes!: Observable<Componente[]>;

  constructor(
    private router: Router,
    private cartaUploadService: CartaUploadService,
    public authServiceCliente: AuthClienteService,
    private menuCli: MenuCliService,
    public themeService: ThemeService,
  ) {
    this.isDarkMode = this.themeService.isDarkTheme();
  }

  ngOnInit() {
    this.componentes = this.menuCli.getMenuOptsCli();
    this.getUserRole();
    this.isDarkMode = this.themeService.isDarkTheme();

    this.obtenerIdUsuario();
  }

  ngAfterViewInit() {
    // Realiza las operaciones de filtrado después de que los datos han sido completamente cargados
    this.getCarta();
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
      this.getCarta();
    } else {
      console.error('Usuario no encontrado en el almacenamiento local');
    }
  }

  // Método para obtener el rol del usuario
  getUserRole() {
    this.rol = localStorage.getItem('userRole');

    // Verificar el rol y manejar el acceso no autorizado
    if (!(this.rol === 'cliente')) {
      console.error('Cliente con rol', this.rol, 'no tiene permiso para acceder a esta opción.');

      // Cerrar sesión y redirigir al inicio
      this.authServiceCliente.logout().subscribe(
        () => {

          this.router.navigate(['/logincli']);
        },
        (error) => {
          console.error('Error al cerrar sesión:', error);
        }
      );
    }
  }

  // Método que se ejecuta al seleccionar un archivo para cargar
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
  }

  getCarta(): void {
    // Obtener el id de la empresa del usuario que ha iniciado sesión
    const id_empresa = localStorage.getItem('id_empresa');

    if (id_empresa) {
      // Obtén el array de cartas almacenado en localStorage o inicialízalo
      const cartasGuardadas = localStorage.getItem('carta_img_data') || '[]';
      const cartas = JSON.parse(cartasGuardadas);

      // Filtra solo las cartas que pertenecen al mismo id_empresa
      this.cartasFiltradas = cartas.filter((carta: any) => carta.id_empresa === id_empresa);
    } else {
      console.error('No se encontró el id de la empresa en el localStorage.');
    }
  }

  // Método para obtener la URL de la imagen
  obtenerUrlImg(carta: any): string {
    if (carta && carta.carta_img) {
      return `${this.BASE_RUTA}/${carta.carta_img}`;
    } else {
      // Manejar el caso en que carta o carta.carta_img sea undefined
      console.error('La propiedad carta_img es undefined en la carta:', carta);
      return ''; // O proporcionar una URL predeterminada o manejar según sea necesario
    }
  }

  // Método para cambiar el modo visual del tema
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkTheme(this.isDarkMode);
  }

  // Método para cerrar la sesión del usuario
  cerrarSesion(): void {
    this.authServiceCliente.logout().subscribe();
  }
}
