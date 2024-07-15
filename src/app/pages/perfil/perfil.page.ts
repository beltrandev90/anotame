import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit, AfterViewInit {

  usuarioData: any;
  mostrarItem: boolean = false;

  id_empresa: number | null = null;
  id_user: number | null = null;

  empleados: any;
  empleadosFiltrados: any;
  
  // Propiedades para almacenar el email y el nombre de usuario
  nombreUsuario: string | null = null;
  email: string | null = null;

  constructor(
    private usuariosService: UsuariosService,
  ) { }

  ngOnInit() {
    this.obtenerIdUsuario();
  }

  ngAfterViewInit() {
    // Realiza las operaciones de filtrado después de que los datos han sido completamente cargados
    this.getEmpleados();
  }

  obtenerIdUsuario(): void {
    // Obtener email y nombre de usuario del localStorage
    this.email = localStorage.getItem('email');
    this.nombreUsuario = localStorage.getItem('nombreUsuario');
  }

  getEmpleados() {
    // Obtiene el id de la empresa del localStorage
    const id_empresa = localStorage.getItem('id_empresa');

    if (id_empresa) {

      this.empleados = [{ email: this.email, nombre: this.nombreUsuario }]; // Modifica aquí según la estructura de tus datos
      this.empleadosFiltrados = this.empleados;

      console.log('Todos los empleados:', this.empleados);
      console.log('Empleados filtrados:', this.empleadosFiltrados);
    } else {
      console.error('No se encontró el id de la empresa en localStorage.');
    }
  }

  toggleMostrarItem() {
    this.mostrarItem = !this.mostrarItem;
  }
}
