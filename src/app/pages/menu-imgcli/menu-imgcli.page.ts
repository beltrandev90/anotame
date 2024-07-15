import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

import { AuthClienteService } from 'src/app/services/auth-cliente.service';
import { DiasService } from 'src/app/services/dias.service';
import { MenuUploadService } from 'src/app/services/menu-upload.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-menu-imgcli',
  templateUrl: './menu-imgcli.page.html',
  styleUrls: ['./menu-imgcli.page.scss'],
})
export class MenuImgcliPage implements OnInit, AfterViewInit {

  BASE_RUTA: string = "http://localhost/anotame/APIANOTAME/public/uploads";

  selectedFile: File | null = null;

  availableDays: string[] = [];
  dias: any;

  menus: any;
  menusFiltrados: any;

  idEmpresa: any;
  id_empresa: number | null = null;
  id_user: number | null = null;

  rol!: any;
  isDarkMode: boolean = false;

  constructor(
    private router: Router,
    public authServiceCliente: AuthClienteService,
    public themeService: ThemeService,
    private diasService: DiasService,
    private menuUploadService: MenuUploadService,
  ) {
    this.isDarkMode = this.themeService.isDarkTheme();
  }

  ngOnInit() {
    this.getUserRole();
    this.isDarkMode = this.themeService.isDarkTheme();

    this.obtenerIdUsuario();
  }

  ngAfterViewInit() {
    // Realiza las operaciones de filtrado después de que los datos han sido completamente cargados
    this.getMenu();
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
      this.getMenu();
    } else {
      console.error('Usuario no encontrado en el almacenamiento local');
    }
  }

  getUserRole() {
    this.rol = localStorage.getItem('userRole');
    // console.log(this.rol);

    if (!(this.rol === 'cliente')) {
      console.error('Cliente con rol', this.rol, 'no tiene permiso para acceder a esta opción.');

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

  // Manejo la selección de archivos
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
  }

  // Método para obtener los datos del menú desde el servicio
  getMenu(): void {
    // Obtener el id de la empresa del usuario que ha iniciado sesión
    const id_empresa = localStorage.getItem('id_empresa');

    if (id_empresa) {
      // Obtén el array de menús almacenado en localStorage o inicialízalo
      const menusGuardados = localStorage.getItem('menu_img_data') || '[]';
      const menus = JSON.parse(menusGuardados);

      // Filtra solo los menús que pertenecen al mismo id_empresa
      this.menusFiltrados = menus.filter((menu: any) => menu.id_empresa === id_empresa);
    } else {
      console.error('No se encontró el id de la empresa en el localStorage.');
    }
  }



  // Método para obtener la URL de la imagen
  obtenerUrlImg(menu: any): string {
    if (menu && menu.menu_img) {
      return `${this.BASE_RUTA}/${menu.menu_img}`;
    } else {
      // Manejo el caso en que menu o menu.menu_img sea undefined
      console.error('La propiedad menu_img es undefined en el menú:', menu);
      return ''; // O proporciono una URL predeterminada o manejo según sea necesario
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
