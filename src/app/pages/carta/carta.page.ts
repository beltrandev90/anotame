import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-carta',
  templateUrl: './carta.page.html',
  styleUrls: ['./carta.page.scss'],
})
export class CartaPage implements OnInit, AfterViewInit {

  BASE_RUTA: string = "http://localhost/anotame/APIANOTAME/public/uploads";

  formCarta: FormGroup;

  // Archivo seleccionado
  selectedFile: File | null = null;

  // Lista de archivos subidos
  uploadedFiles: any[] = [];

  cartas: any;
  cartasFiltradas: any;

  id_empresa: number | null = null;
  id_user: string | null = null;

  rol!: any;
  isDarkMode: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private router: Router,
    public authService: AuthService,
    public themeService: ThemeService,
    public usuariosService: UsuariosService,
  ) {
    this.isDarkMode = this.themeService.isDarkTheme();

    this.formCarta = this.formBuilder.group({
      carta_img: [''],
      id_empresa: [''],
      id_user: [''],
    });
  }

  ngOnInit() {
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

    if (!(this.rol === 'administrador' || this.rol === 'encargado')) {
      console.error('Usuario con rol', this.rol, 'no tiene permiso para acceder a esta opción.');
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

  // Método que se ejecuta al seleccionar un archivo
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
  }

  async enviarCarta(): Promise<void> {
    if (this.selectedFile) {
      // Obtener los valores de id_empresa e id_user del localStorage
      const id_empresa = localStorage.getItem('id_empresa');
      const id_user = localStorage.getItem('id_user');

      // Verificar que los valores no sean null o undefined
      if (id_empresa && id_user) {
        try {
          const base64 = await this.convertirImagenABase64(this.selectedFile);
          if (base64) {
            const nuevaCarta = { carta_img: base64, id_empresa, id_user };

            // Obtén el array de cartas almacenado en localStorage o inicialízalo
            const cartasGuardadas = localStorage.getItem('carta_img_data') || '[]';
            const cartas = JSON.parse(cartasGuardadas);

            // Agregar la nueva carta al array
            cartas.push(nuevaCarta);

            // Guardar el array actualizado en localStorage
            localStorage.setItem('carta_img_data', JSON.stringify(cartas));

            window.location.reload();
            // Actualizar la lista de cartas después de enviar una nueva
            this.getCarta();
          } else {
            console.error('La conversión de la imagen a base64 no fue exitosa.');
          }
        } catch (error) {
          console.error('Error al convertir la imagen a base64:', error);
        }
      } else {
        console.error('No se pudo obtener el id de la empresa o el id del usuario desde el localStorage.');
      }
    } else {
      console.error('No se ha seleccionado ningún archivo.');
    }
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

  convertirImagenABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  async borrarCarta(id_user: string) {
    // Obtén el array de cartas almacenado en localStorage o inicialízalo si es null o undefined
    let cartasGuardadas = localStorage.getItem('carta_img_data') || '[]';
    let cartas = JSON.parse(cartasGuardadas);
    
    console.log('Contenido de cartas antes de la búsqueda:', cartas);
    
    // Verificar si el array de cartas está vacío o null
    if (!cartas || cartas.length === 0) {
      console.error('El array de cartas está vacío o es null.');
      return; // Salir del método si el array está vacío o null
    }
    
    // Encuentra el índice de la carta con el campo id_user específico
    const index = cartas.findIndex((carta: any) => carta && carta.id_user !== undefined && carta.id_user === carta.id_user);

    
    if (index !== -1) {
      // Elimina la carta específica del array
      cartas.splice(index, 1);
    
      // Guarda el array actualizado en el localStorage
      localStorage.setItem('carta_img_data', JSON.stringify(cartas));
    
      const alert = await this.alertController.create({
        header: 'Confirmar',
        message: '¿Estás seguro de que deseas borrar esta carta?',
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
              this.getCarta();
            }
          }
        ]
      });
    
      await alert.present();
    } else {
      console.error('No se encontró la carta con el campo id_user especificado.');
    }
  }
  

  // Método para cambiar el estado del modo oscuro
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkTheme(this.isDarkMode);
  }

  // Método para cerrar sesión
  cerrarSesion(): void {
    this.authService.logout().subscribe();
  }
}
