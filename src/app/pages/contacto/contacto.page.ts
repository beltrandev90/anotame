import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, catchError, map, of } from 'rxjs';

import { Router } from '@angular/router';
import { Componente } from 'src/app/interfaces/interfaces';

import { AuthService } from 'src/app/services/auth.service';
import { ContactoService } from 'src/app/services/contacto.service';
import { MenuService } from 'src/app/services/menu.service';
import { ThemeService } from 'src/app/services/theme.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.page.html',
  styleUrls: ['./contacto.page.scss'],
})
export class ContactoPage implements OnInit, AfterViewInit {
  id_empresa: string | null = null;
  id_user: number | null = null;
  idEmpresa!: number | null;

  datos: any;
  datosFiltrados: any;

  ionicForm!: FormGroup;
  rol!: any;
  isDarkMode: any;
  componentes!: Observable<Componente[]>;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    public authService: AuthService,
    public contactService: ContactoService,
    public usuariosService: UsuariosService,
    public menuService: MenuService,
    public themeService: ThemeService
  ) {
    this.getUserRole();
    this.isDarkMode = this.themeService.isDarkTheme();

    this.ionicForm = this.formBuilder.group({
      nomLocal: ['', [Validators.required]],
      direccion: [''],
      telf1: [''],
      telf2: [''],
      id_empresa: [''],
      id_user: [''],
    });
  }

  ngOnInit() {
    this.componentes = this.menuService.getMenuOpts();

    this.obtenerIdUsuario();
  }

  ngAfterViewInit() {
    this.getDatos();
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

      // Llama a getDatos() después de establecer id_empresa
      this.getDatos();
    } else {
      console.error('Usuario no encontrado en el almacenamiento local');
    }
  }

  // Método para obtener el rol del usuario
  getUserRole() {
    this.rol = localStorage.getItem('userRole');

    if (!(this.rol === 'administrador' || this.rol === 'encargado')) {
      console.error(
        'Usuario con rol',
        this.rol,
        'no tiene permiso para acceder a esta opción.'
      );

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

  enviarDatos() {
    if (this.ionicForm.valid) {
      // Obtener los valores de id_empresa e id_user del localStorage
      const id_empresa = localStorage.getItem('id_empresa');
      const id_user = localStorage.getItem('id_user');

      // Verificar que los valores no sean null o undefined
      if (id_empresa && id_user) {
        const dats = { ...this.ionicForm.value, id_empresa, id_user };

        // Loguea el valor de id_empresa antes de agregarlo a tus datos
        console.log('ID Empresa (antes de agregar a datos):', id_empresa);

        // Obtener los datos almacenados en localStorage o inicializar un arreglo vacío
        const datosGuardados = localStorage.getItem('datos');
        const datos = datosGuardados ? JSON.parse(datosGuardados) : [];

        // Buscar y reemplazar el dato existente para el mismo id_empresa e id_user
        const index = datos.findIndex((dato: any) => dato.id_empresa === id_empresa && dato.id_user === id_user);
        if (index !== -1) {
          // Si se encuentra, reemplazar el antiguo con el nuevo
          datos[index] = dats;
        } else {
          // Si no se encuentra, agregar el nuevo dato
          datos.push(dats);
        }

        // Guardar los datos actualizados en localStorage
        localStorage.setItem('datos', JSON.stringify(datos));

        // Actualizar la lista de datos después de enviar uno nuevo
        this.getDatos();
        window.location.reload();
      } else {
        console.error('No se pudo obtener el id de la empresa o el id del usuario desde el localStorage.');
      }
    }
  }

  getDatos(): void {
    // Obtener el id_empresa del localStorage
    const id_empresa = localStorage.getItem('id_empresa');

    // Loguea el valor de id_empresa antes de filtrar los datos
    console.log('ID Empresa (antes del filtrado):', id_empresa);

    // Obtener los datos almacenados en localStorage
    const datosGuardados = localStorage.getItem('datos');

    if (datosGuardados) {
      // Parsear los datos
      this.datos = JSON.parse(datosGuardados);

      // Filtrar los datos para obtener solo aquellos que coincidan con el id_empresa actual
      this.datosFiltrados = this.datos.filter((dato: any) => dato.id_empresa === id_empresa);

      // Loguea todos los datos y los datos filtrados
      console.log('Todos los datos:', this.datos);
      console.log('Datos filtrados:', this.datosFiltrados);
    } else {
      console.error('No se encontraron datos en el localStorage.');
      this.datos = [];
      this.datosFiltrados = [];
    }
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
