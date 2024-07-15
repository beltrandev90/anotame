import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Componente } from 'src/app/interfaces/interfaces';

import { TextoService } from '../../services/texto.service';
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';
import { MenuService } from 'src/app/services/menu.service';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-descripcion-local',
  templateUrl: './descripcion-local.page.html',
  styleUrls: ['./descripcion-local.page.scss'],
})
export class DescripcionLocalPage implements OnInit, AfterViewInit {

  // Variables para almacenar datos del usuario y la empresa
  id_empresa: number | null = null;
  id_user: number | null = null;
  idEmpresa!: number | null;

  // Variables para almacenar los textos obtenidos
  textos: any;
  textosFiltrados: any;

  // Formulario reactivo para la entrada de texto
  ionicForm!: FormGroup;

  // Variables para el rol del usuario y el modo oscuro
  rol!: any;
  isDarkMode: any;
  componentes!: Observable<Componente[]>;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    public textoService: TextoService,
    public authService: AuthService,
    public usuariosService: UsuariosService,
    public menuService: MenuService,
    public themeService: ThemeService,
  ) {
    // Obtener el rol del usuario y configurar el modo oscuro
    this.getUserRole();
    this.isDarkMode = this.themeService.isDarkTheme();

    // Configurar el formulario reactivo
    this.ionicForm = this.formBuilder.group({
      nomLocal: ['', [Validators.required]],
      texto: [''],
      id_empresa: [''],
      id_user: [''],
    });
  }

  ngOnInit() {
    // Obtener los componentes del menú
    this.componentes = this.menuService.getMenuOpts();

    this.obtenerIdUsuario();
  }

  ngAfterViewInit() {
    // Realiza las operaciones de filtrado después de que los datos han sido completamente cargados
    this.getTexto();
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
      this.getTexto();
    } else {
      console.error('Usuario no encontrado en el almacenamiento local');
    }
  }

  // Método para obtener el rol del usuario
  getUserRole() {
    this.rol = localStorage.getItem('userRole');

    if (!(this.rol === 'administrador')) {
      console.error('Usuario con rol', this.rol, 'no tiene permiso para acceder a esta opción.');

      this.authService.logout().subscribe(
        () => {

          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Error al cerrar sesion:', error);
        }
      );
    }
  }

  // Método para enviar un nuevo texto al servidor
  enviarTexto(): void {
    if (this.ionicForm.valid) {
      // Obtener los valores de id_empresa e id_user del localStorage
      const id_empresa = localStorage.getItem('id_empresa');
      const id_user = localStorage.getItem('id_user');

      // Verificar que los valores no sean null o undefined
      if (id_empresa && id_user) {
        const datos = { ...this.ionicForm.value, id_empresa, id_user };

        // Obtener los textos almacenados en localStorage o inicializar un arreglo vacío
        const textosGuardados = localStorage.getItem('textos');
        const textos = textosGuardados ? JSON.parse(textosGuardados) : [];

        // Buscar y reemplazar el texto existente para el mismo id_empresa e id_user
        const index = textos.findIndex((texto: any) => texto.id_empresa === id_empresa && texto.id_user === id_user);
        if (index !== -1) {
          // Si se encuentra, reemplazar el antiguo con el nuevo
          textos[index] = datos;
        } else {
          // Si no se encuentra, agregar el nuevo texto
          textos.push(datos);
        }

        // Guardar los textos actualizados en localStorage
        localStorage.setItem('textos', JSON.stringify(textos));

        // Actualizar la lista de textos después de enviar uno nuevo
        this.getTexto();
        window.location.reload();
      } else {
        console.error('No se pudo obtener el id de la empresa o el id del usuario desde el localStorage.');
      }
    }
  }

  // Método para obtener los textos del servidor
  getTexto(): void {
    // Obtener el id_empresa del localStorage
    const id_empresa = localStorage.getItem('id_empresa');

    if (id_empresa) {
      // Obtener los textos almacenados en localStorage o realizar acciones según tu lógica
      const textosGuardados = localStorage.getItem('textos');
      if (textosGuardados) {
        // Parsear los textos
        this.textos = JSON.parse(textosGuardados);

        // Filtrar los textos para obtener solo aquellos que coincidan con el id_empresa actual
        this.textosFiltrados = this.textos.filter((texto: any) => texto.id_empresa === id_empresa);

        // Loguea todos los textos y los textos filtrados
        console.log('Todos los textos:', this.textos);
        console.log('Textos filtrados:', this.textosFiltrados);
      } else {
        console.error('No se encontraron textos en el localStorage.');
        this.textos = [];
        this.textosFiltrados = [];
      }
    } else {
      console.error('No se encontró el id de la empresa en el localStorage.');
    }
  }

  // Método para cambiar el modo oscuro
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkTheme(this.isDarkMode);
  }

  // Método para cerrar sesión
  cerrarSesion(): void {
    this.authService.logout().subscribe();
  }
}