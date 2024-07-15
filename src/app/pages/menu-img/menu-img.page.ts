import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';

import { ThemeService } from 'src/app/services/theme.service';
import { MenuUploadService } from 'src/app/services/menu-upload.service';
import { DiasService } from 'src/app/services/dias.service';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-menu-img',
  templateUrl: './menu-img.page.html',
  styleUrls: ['./menu-img.page.scss'],
})
export class MenuImgPage implements OnInit, AfterViewInit {

  BASE_RUTA: string = "http://localhost/anotame/APIANOTAME/public/uploads";

  // Archivo seleccionado para cargar
  selectedFile: File | null = null;

  // Identificadores de empresa y usuario
  id_empresa: number | null = null;
  id_user: string | null = null;

  // Arreglos para almacenar menús y días disponibles
  menus: any;
  menusFiltrados: any;
  arrImgAndDay: any;
  availableDays: string[] = [];

  // Variable para almacenar información sobre los días
  dias: any;

  // Formulario Reactivo Angular
  form: FormGroup;

  rol!: any;
  isDarkMode: boolean = false;

  constructor(
    private router: Router,
    public alertController: AlertController,
    private formBuilder: FormBuilder,
    private menuUploadService: MenuUploadService,
    public usuariosService: UsuariosService,
    private diasService: DiasService,
    public authService: AuthService,
    public themeService: ThemeService,
  ) {
    this.isDarkMode = this.themeService.isDarkTheme();

    this.form = this.formBuilder.group({
      dia: new FormControl('', { updateOn: 'blur' }),
      id_empresa: [''],
      id_user: [''],
    });

    this.arrImgAndDay = [];
  }

  ngOnInit() {
    this.getUserRole();
    // console.log('Rol obtenido:', this.rol);

    this.isDarkMode = this.themeService.isDarkTheme();

    this.obtenerIdUsuario();
    this.dias = this.diasService.getDias();
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


  // Método para obtener el rol del usuario
  getUserRole() {
    this.rol = localStorage.getItem('userRole');
    // console.log(this.rol);

    // Verifica si el usuario tiene permisos para acceder a esta opción
    if (!(this.rol === 'administrador' || this.rol === 'encargado')) {
      console.error('Usuario con rol', this.rol, 'no tiene permiso para acceder a esta opción.');
      this.authService.logout().subscribe(
        () => {

          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Error al cerrar sesión:', error);
        }
      )
    }
  }

  // Método ejecutado al seleccionar un archivo
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
  }

  // Método para cargar una imagen
  uploadImage(): void {
    if (this.selectedFile) {
      const id_empresa = localStorage.getItem('id_empresa');
      const id_user = localStorage.getItem('id_user');

      if (id_empresa && id_user) {
        const selectedDay = this.form.get('dia')?.value;

        // Verifica si el día seleccionado es válido
        if (selectedDay && this.dias.includes(selectedDay)) {
          this.convertirImagenABase64(this.selectedFile).then((base64) => {
            if (base64) {
              const nuevaImagen = { menu_img: base64, id_empresa, id_user, dia: selectedDay };

              const imagenesGuardadas = localStorage.getItem('menu_img_data') || '[]';
              const imagenes = JSON.parse(imagenesGuardadas);

              imagenes.push(nuevaImagen);

              // Guardar el array actualizado en localStorage
              localStorage.setItem('menu_img_data', JSON.stringify(imagenes));

              window.location.reload();
              // Actualizar la lista de imágenes después de enviar una nueva
              this.getMenu();
            } else {
              console.error('La conversión de la imagen a base64 no fue exitosa.');
            }
          }).catch((error) => {
            console.error('Error al convertir la imagen a base64:', error);
          });
        } else {
          console.error('Día seleccionado no válido.');
        }
      } else {
        console.error('No se pudo obtener el id de la empresa o el id del usuario desde el localStorage.');
      }
    } else {
      console.error('No se ha seleccionado ningún archivo.');
    }
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

  convertirImagenABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  async borrarImg(id_menu: string) {

    let menusGuardadas = localStorage.getItem('menu_img_data') || '[]';
    let menus = JSON.parse(menusGuardadas);
        
    console.log('Contenido de menus antes de la búsqueda:', menus);

    if (!menus || menus.length === 0) {
      console.error('El array de menus está vacío o es null.');
      return; // Salir del método si el array está vacío o null
    }

    // Encuentra el índice de la carta con el campo id_user específico
    const index = menus.findIndex((menu: any) => menu && menu.id_user !== undefined && menu.id_user === menu.id_user);

    if (index !== -1) {
      // Elimina la carta específica del array
      menus.splice(index, 1);
    
      // Guarda el array actualizado en el localStorage
      localStorage.setItem('menu_img_data', JSON.stringify(menus));

      const alert = await this.alertController.create({
        header: 'Confirmar',
        message: '¿Estás seguro de que deseas borrar este menu?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              console.log('Borrado de carta cancelado');
            }
          },
          {
            text: 'Borrar',
            handler: async () => {
              // Actualiza la lista de cartas en la aplicación
              this.getMenu();
            }
          }
        ]
      });

      await alert.present();
    } else {
      console.error('No se encontró la carta con el campo id_user especificado.');
    }
  }

  // Método para obtener la URL de la imagen
  obtenerUrlImg(menu: any): string {
    if (menu && menu.menu_img) {
      return `${this.BASE_RUTA}/${menu.menu_img}`;
    } else {
      // Manejar el caso en que menu o menu.menu_img sea undefined
      console.error('La propiedad menu_img es undefined en el menú:', menu);
      return ''; // O proporcionar una URL predeterminada o manejar según sea necesario
    }
  }

  // Método para alternar el modo oscuro
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkTheme(this.isDarkMode);
  }

  // Método para cerrar sesión
  cerrarSesion(): void {
    this.authService.logout().subscribe();
  }
}
