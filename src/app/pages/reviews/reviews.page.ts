import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';

import { Componente } from 'src/app/interfaces/interfaces';
import { AuthService } from 'src/app/services/auth.service';
import { MenuService } from 'src/app/services/menu.service';
import { ReviewsService } from 'src/app/services/reviews.service';
import { ThemeService } from 'src/app/services/theme.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.page.html',
  styleUrls: ['./reviews.page.scss'],
})
export class ReviewsPage implements OnInit, AfterViewInit {

  id_empresa: number | null = null;
  id_user: number | null = null;

  expandido: boolean[] = [];
  expandidoRespuesta: boolean[] = [];

  reviews: any;
  reviewsFiltrados: any;

  getResenas: any;
  resenasFiltrados: any[] = [];

  rol!: any;
  isDarkMode: any;
  componentes!: Observable<Componente[]>;

  constructor(
    private reviewsService: ReviewsService,
    public authService: AuthService,
    public usuariosService: UsuariosService,
    public menuService: MenuService,
    private router: Router,
    public themeService: ThemeService
  ) {
    this.getUserRole();

    // console.log('Rol obtenido:', this.rol);
    this.isDarkMode = this.themeService.isDarkTheme();
  }

  ngOnInit() {
    this.componentes = this.menuService.getMenuOpts();
    this.obtenerIdUsuario();
    this.expandidoRespuesta = this.resenasFiltrados.map(() => false);
  }

  ngAfterViewInit() {
    this.getReviews();
  }

  // Método para obtener reseñas desde localStorage
  getReviews(): void {
    // Obtener el id de la empresa del usuario que ha iniciado sesión
    const id_empresa = localStorage.getItem('id_empresa');

    if (id_empresa) {
      // Obtén el array de reseñas almacenado en localStorage o inicialízalo
      const reviewsGuardadas = localStorage.getItem('reviews_data');

      if (reviewsGuardadas) {
        // Parsear las reseñas
        this.reviews = JSON.parse(reviewsGuardadas);

        // Filtrar las reseñas para obtener solo aquellas que coincidan con el id_empresa actual
        this.reviewsFiltrados = this.reviews.filter((review: any) => review.id_empresa === parseInt(id_empresa, 10));

        // Loguea todas las reseñas y las reseñas filtradas
        console.log('Todas las reseñas:', this.reviews);
        console.log('Reseñas filtradas:', this.reviewsFiltrados);
      } else {
        console.error('No se encontraron reseñas en el localStorage.');
        this.reviews = [];
        this.reviewsFiltrados = [];
      }
    } else {
      console.error('ID de empresa no encontrado en el localStorage.');
    }
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
      this.getReviews();
    } else {
      console.error('Usuario no encontrado en el almacenamiento local');
    }
  }

  responderResena(resena: any): void {
    const respuesta = prompt('Ingrese su respuesta:');
  
    if (respuesta !== null) {
      // Lógica adicional si es necesario
  
      // Actualizar la respuesta en la reseña localmente
      resena.respuesta = respuesta;
  
      // Actualizar la reseña en el array local
      const index = this.reviews.findIndex((r: any) => r.id_reviews === resena.id_reviews);
      if (index !== -1) {
        this.reviews[index] = resena;
      }
  
      // Guardar el array actualizado en localStorage
      localStorage.setItem('reviews_data', JSON.stringify(this.reviews));
  
      console.log('Respuesta guardada:', respuesta);
    } else {
      console.log('La respuesta está vacía o se canceló.');
    }
  }

  // Método para abrir un cuadro de diálogo o componente modal
  // abrirCuadroDialogo(resena: any) {
  //   return this.reviewsService.mostrarCuadroDialogoParaRespuesta(resena)
  //     .then((respuesta) => {
  //       console.log('Respuesta enviada:', respuesta);
  //       return respuesta;
  //     })
  //     .catch(() => null);
  // }

  // Método para obtener el rol del usuario
  getUserRole() {
    this.rol = localStorage.getItem('userRole');
    // console.log(this.rol);

    if (!(this.rol === 'administrador' || this.rol === 'encargado')) {
      console.error('Usuario con rol', this.rol, 'no tiene permiso para acceder a esta opción.');

      this.authService.logout().subscribe(
        () => {

          this.router.navigate(['/inicio']);
        },
        (error) => {
          console.error('Error al cerrar sesión:', error);
        }
      );
    }
  }

  toggleExpansion(i: number) {
    this.expandido[i] = !this.expandido[i];
  }

  toggleExpansionRespuesta(i: number) {
    this.expandidoRespuesta[i] = !this.expandidoRespuesta[i];
  }

  // Método para cambiar entre modos oscuro y claro
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkTheme(this.isDarkMode);
  }

  // Método para cerrar sesión
  cerrarSesion(): void {
    this.authService.logout().subscribe();
  }
}
