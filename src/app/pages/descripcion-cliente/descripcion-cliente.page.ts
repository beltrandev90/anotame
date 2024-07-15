import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Componente, Texto } from 'src/app/interfaces/interfaces';
import { AuthClienteService } from 'src/app/services/auth-cliente.service';
import { AuthService } from 'src/app/services/auth.service';
import { EmpresaService } from 'src/app/services/empresa.service';
import { MenuCliService } from 'src/app/services/menu-cli.service';
import { TextoService } from 'src/app/services/texto.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-descripcion-cliente',
  templateUrl: './descripcion-cliente.page.html',
  styleUrls: ['./descripcion-cliente.page.scss'],
})
export class DescripcionClientePage implements OnInit, AfterViewInit {

  id_empresa: number | null = null;
  id_user: number | null = null;

  textos: any;
  textosFiltrados: any;

  idEmpresa!: number | null;

  rol!: any;
  isDarkMode: any;
  componentes!: Observable<Componente[]>;

  @ViewChild('idEmpresaInput') idEmpresaInput!: ElementRef;

  constructor(
    public router: Router, 
    public authService: AuthService,
    private menuCli: MenuCliService,
    private textoService: TextoService,
    public authServiceCliente: AuthClienteService,
    public themeService: ThemeService
  ) {
    this.getUserRole();
    // console.log('Rol obtenido:', this.rol);
    this.isDarkMode = this.themeService.isDarkTheme();
  }

  ngOnInit() {
    this.componentes = this.menuCli.getMenuOptsCli();
    
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

  getUserRole() {
    this.rol = localStorage.getItem('userRole');
    // console.log(this.rol);
    
    if (!(this.rol === 'cliente')) {
      console.error('Cliente con rol', this.rol, 'no tiene permiso para acceder a esta opción.');
      this.authService.logout().subscribe(
        () => {

          this.router.navigate(['/logincli']);
        },
        (error) => {
          console.error('Error al cerrar sesion:', error);
        }
      );
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
