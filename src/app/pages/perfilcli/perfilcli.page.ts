import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ClientesService } from 'src/app/services/clientes.service';

@Component({
  selector: 'app-perfilcli',
  templateUrl: './perfilcli.page.html',
  styleUrls: ['./perfilcli.page.scss'],
})
export class PerfilcliPage implements OnInit, AfterViewInit {

  clienteData: any;
  mostrarItem: boolean = false;

  id_empresa: number | null = null;
  id_user: number | null = null;

  clientes: any;
  clientesFiltrados: any;
  
  // Propiedades para almacenar el email y el nombre de usuario
  nombreCliente: string | null = null;
  email: string | null = null;

  constructor(
    private clienteService: ClientesService
  ) { }

  ngOnInit() {
    this.obtenerIdUsuario();
  }

  ngAfterViewInit() {
    // Realiza las operaciones de filtrado después de que los datos han sido completamente cargados
    this.getClientes();
  }

  obtenerIdUsuario(): void {
    // Obtener email y nombre de usuario del localStorage
    this.email = localStorage.getItem('email');
    this.nombreCliente = localStorage.getItem('nombreCliente');
  }

  getClientes() {
    // Obtiene el id de la empresa del localStorage
    const id_empresa = localStorage.getItem('id_empresa');

    if (id_empresa) {
      // Asigna los datos de cliente recuperados desde el localStorage a las propiedades correspondientes
      this.clientes = [{ email: this.email, nombre: this.nombreCliente }]; // Modifica aquí según la estructura de tus datos
      this.clientesFiltrados = this.clientes;

      console.log('Todos los clientes:', this.clientes);
      console.log('Clientes filtrados:', this.clientesFiltrados);
    } else {
      console.error('No se encontró el id de la empresa en localStorage.');
    }
  }

  toggleMostrarItem() {
    this.mostrarItem = !this.mostrarItem;
  }
}
