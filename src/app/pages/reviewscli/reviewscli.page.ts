import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';

import { Componente } from 'src/app/interfaces/interfaces';

import { AuthClienteService } from 'src/app/services/auth-cliente.service';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { MenuCliService } from 'src/app/services/menu-cli.service';
import { ReviewsService } from 'src/app/services/reviews.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-reviewscli',
  templateUrl: './reviewscli.page.html',
  styleUrls: ['./reviewscli.page.scss'],
})
export class ReviewscliPage implements OnInit, AfterViewInit {

  id_empresa: number | null = null;
  id_user: number | null = null;

  expandido: boolean = false;
  expandidoRespuesta: boolean[] = [];

  stars: { icon: string, color: string }[] = [];
  resenas: { nombre: string, calificacion: number, comentario: string }[] = [];

  clienteData: any;
  idEmpresa: any;

  reviews: any;
  reviewsFiltrados: any;

  reviewForm!: FormGroup;

  rol!: any;
  isDarkMode: any;
  componentes!: Observable<Componente[]>;

  @ViewChild('idEmpresaInput') idEmpresaInput!: ElementRef;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private reviewsService: ReviewsService,
    public authService: AuthService,
    private clienteService: ClientesService,
    public authServiceCli: AuthClienteService,
    private menuCli: MenuCliService,
    public themeService: ThemeService
  ) {
    this.getUserRole();
    // console.log('Rol obtenido:', this.rol);
    this.isDarkMode = this.themeService.isDarkTheme();
    this.inicializarEstrellas();

    // Crear el formulario con controles iniciales
    this.reviewForm = this.formBuilder.group({
      id_cliente: [''],
      id_empresa: [''],
      calificacion: [0, Validators.required],
      comentario: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.componentes = this.menuCli.getMenuOptsCli();

    this.obtenerIdUsuario();

  }

  ngAfterViewInit() {
    // Realiza las operaciones de filtrado después de que los datos han sido completamente cargados
    this.getReviews();
  }

  // Método para inicializar las estrellas
  inicializarEstrellas() {
    this.stars = Array(5).fill({ icon: 'star-outline', color: 'medium' });
  }

  // Método para manejar la calificación
  calificar(index: number) {
    // console.log('Valor de la calificación:', index);

    // Actualiza el valor de la calificación en el formulario
    this.reviewForm.get('calificacion')?.setValue(index);

    // Cambia el color de las estrellas
    this.stars = this.stars.map((star, i) => ({
      icon: i < index ? 'star' : 'star-outline',
      color: i < index ? 'warning' : 'medium',
    }));
  }

  enviarResena() {
    if (this.reviewForm.valid) {
      // Recuperar el valor de id_empresa del localStorage
      const idEmpresaString = localStorage.getItem('id_empresa');
      const id_empresa = idEmpresaString ? parseInt(idEmpresaString, 10) : null;

      const calificacion = this.reviewForm.get('calificacion')?.value;

      const nuevaResena = {
        id_empresa: id_empresa,
        calificacion: calificacion,
        comentario: this.reviewForm.get('comentario')?.value,
      };

      // Obtén el array de reseñas almacenado en localStorage o inicialízalo
      const reviewsGuardadas = localStorage.getItem('reviews_data') || '[]';
      const reviews = JSON.parse(reviewsGuardadas);

      // Agregar la nueva reseña al array
      reviews.push(nuevaResena);

      // Guardar el array actualizado en localStorage
      localStorage.setItem('reviews_data', JSON.stringify(reviews));

      // Recargar la página para mostrar la nueva reseña
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      console.error('El formulario de reseña no es válido.');
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

  // Método para eliminar reseñas
  eliminarResena(index: number) {
    this.resenas.splice(index, 1);
    localStorage.setItem('resenas', JSON.stringify(this.resenas));
  }

  // Método para obtener el rol del usuario
  getUserRole() {
    this.rol = localStorage.getItem('userRole');
    // console.log(this.rol);

    if (!(this.rol === 'cliente')) {
      console.error('Cliente con rol', this.rol, 'no tiene permiso para acceder a esta opción.');

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

  // Función para alternar la expansión
  toggleExpansion() {
    this.expandido = !this.expandido;
  }

  toggleExpansionRespuesta(i: number) {
    this.expandidoRespuesta[i] = !this.expandidoRespuesta[i];
  }

  // Método para cambiar el modo oscuro
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkTheme(this.isDarkMode);
  }

  // Método para cerrar sesión
  cerrarSesion(): void {
    this.authServiceCli.logout().subscribe();
  }
}
