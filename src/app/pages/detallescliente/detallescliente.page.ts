import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-detallescliente',
  templateUrl: './detallescliente.page.html',
  styleUrls: ['./detallescliente.page.scss'],
})
export class DetallesclientePage implements OnInit {

  usuarioData: any;
  mostrarItem: boolean = false;

  id_empresa: number | null = null;
  id_user: number | null = null;

  clienteData: any; // Cambiado de 'empleados' a 'clienteData'
  nombreCliente: string | null = null; // Cambiado de 'nombre' a 'nombreCliente'
  emailCliente: string | null = null; // Cambiado de 'email' a 'emailCliente'

  @Input() cliente: any;
  isDarkMode: any;

  constructor(
    public popoverController: PopoverController,
    public themeService: ThemeService,
  ) { }

  ngOnInit() {
    this.obtenerDatosCliente();
  }


  obtenerDatosCliente(): void {
    const clienteString = localStorage.getItem('clientes'); // Obtener los datos del cliente del localStorage

    if (clienteString) {
      this.clienteData = JSON.parse(clienteString); // Almacenar los datos del cliente en la variable clienteData
    } else {
      console.error('No se encontraron datos del cliente en el almacenamiento local.');
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkTheme(this.isDarkMode);
  }

  cerrarPopover() {
    this.popoverController.dismiss();
  }
}
