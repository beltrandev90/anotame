import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Componente, Empresa } from 'src/app/interfaces/interfaces';

import { AuthClienteService } from 'src/app/services/auth-cliente.service';
import { AuthService } from 'src/app/services/auth.service';
import { EmpresaService } from 'src/app/services/empresa.service';
import { MenuCliService } from 'src/app/services/menucli.service';
import { ThemeService } from 'src/app/services/theme.service';
import { ProvinciasService } from 'src/app/services/provincias.service';

@Component({
  selector: 'app-seleccion-empresa',
  templateUrl: './seleccion-empresa.page.html',
  styleUrls: ['./seleccion-empresa.page.scss'],
})
export class SeleccionEmpresaPage implements OnInit {

  idEmpresa!: number;
  empresas!: any;
  empresasFiltradas: Empresa[] = [];

  provincias: any[] = [];

  filtroTipoLocal: string = '';
  filtroProvincia: string = '';
  filtroCodigoPostal: string = '';
  filtroNombreRestaurante: string = '';

  rol!: any;
  isDarkMode: any;
  componentes!: Observable<Componente[]>;

  constructor(
    private router: Router,
    public authServiceCli: AuthClienteService,
    private menuCli: MenuCliService,
    private empresaService: EmpresaService,
    public authService: AuthService,
    public themeService: ThemeService,
    private provinciasService: ProvinciasService
  ) {
    this.getUserRole();
    this.isDarkMode = this.themeService.isDarkTheme();
  }

  ngOnInit() {
    this.componentes = this.menuCli.getMenuOptsCli();
    this.getEmpresas();
    //this.getProvincias();
    this.aplicarFiltros();
    this.idEmpresa = this.authService.getIdEmpresa();
    this.provincias = this.provinciasService.getProvincias();
  }

  // Método para seleccionar una empresa
  seleccionarEmpresa(event: any) {
    const idEmpresa = event.detail.value;

    if (idEmpresa) {
      // Busca la empresa seleccionada en la lista de empresas
      const empresaSeleccionada = this.empresas.find((empresa: Empresa) => empresa.id_empresa === idEmpresa);

      if (empresaSeleccionada) {
        // Almacena el ID de la empresa en localStorage
        this.redirigirYAlmacenarIdEmpresa(empresaSeleccionada.id_empresa.toString());
      } else {
        console.error('Empresa no encontrada en la lista de empresas.');
      }
    } else {
      console.error('ID de empresa no válido');
    }
  }


  // Método para redirigir y almacenar el ID de la empresa seleccionada
  redirigirYAlmacenarIdEmpresa(idEmpresa: string) {
    this.router.navigate(['/homecli']);
    localStorage.setItem('id_empresa', idEmpresa);
  }

  // Método para redirigir y almacenar la empresa actual
  redirigirYAlmacenar() {
    const idEmpresa = this.idEmpresa;

    if (idEmpresa) {
      const idEmpresaString = idEmpresa.toString();
      this.redirigirYAlmacenarIdEmpresa(idEmpresaString);
    }
  }

  // Método para obtener la lista de empresas
  getEmpresas() {
    // Intenta obtener las empresas desde el localStorage
    const empresasLocalStorage = localStorage.getItem('empresa');

    // Si hay datos en el localStorage, conviértelos a un array
    if (empresasLocalStorage) {
      try {
        this.empresas = JSON.parse(empresasLocalStorage);
        this.empresasFiltradas = this.empresas;
      } catch (error) {
        console.error('Error al analizar los datos del localStorage:', error);
      }
    } else {
      console.warn('No hay datos de empresas en el localStorage.');
    }
  }


  // Método para aplicar los filtros de búsqueda
  aplicarFiltros() {
    if (this.empresas) {
      this.empresasFiltradas = this.empresas.filter((empresa: Empresa) =>
        (this.filtroTipoLocal === '' || this.pasaFiltroTipoLocal(empresa)) &&
        (this.filtroProvincia === '' || this.pasaFiltroProvincia(empresa)) &&
        (this.filtroCodigoPostal === '' || this.pasaFiltroCodigoPostal(empresa)) &&
        (this.filtroNombreRestaurante === '' || this.pasaFiltroNombreRestaurante(empresa))
      );
    }
  }

  // Métodos para comprobar si una empresa pasa los filtros individuales
  pasaFiltroTipoLocal(empresa: Empresa): boolean {
    return empresa.tipoLocal === this.filtroTipoLocal;
  }

  pasaFiltroProvincia(empresa: Empresa): boolean {
    return empresa.provincia === this.filtroProvincia;
  }

  pasaFiltroCodigoPostal(empresa: Empresa): boolean {
    return empresa.cPostal.includes(this.filtroCodigoPostal);
  }

  pasaFiltroNombreRestaurante(empresa: Empresa): boolean {
    return empresa.empresa.includes(this.filtroNombreRestaurante);
  }

  // Método para borrar los filtros de búsqueda
  borrarFiltro() {
    this.filtroTipoLocal = '';
    this.filtroProvincia = '';
    // Restablecer otros filtros si es necesario
    this.aplicarFiltros(); // Aplicar los filtros después de restablecer
  }

  // Método para obtener el rol del usuario
  getUserRole() {
    this.rol = localStorage.getItem('userRole');

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

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkTheme(this.isDarkMode);
  }

  cerrarSesion(): void {
    this.authServiceCli.logout().subscribe();
  }
}
