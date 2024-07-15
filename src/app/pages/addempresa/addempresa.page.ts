import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Componente } from 'src/app/interfaces/interfaces';
import { AuthService } from 'src/app/services/auth.service';
import { EmpresaService } from 'src/app/services/empresa.service';
import { MenuService } from 'src/app/services/menu.service';
import { ProvinciasService } from 'src/app/services/provincias.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-addempresa',
  templateUrl: './addempresa.page.html',
  styleUrls: ['./addempresa.page.scss'],
})
export class AddempresaPage implements OnInit  {

  empresas: any;
  empresaForm!: FormGroup;
  idEmpresa!: number | null;
  id_user: string | null = null;
  id_empresa: number | null = null;

  provincias: string[] = [];
  submitted = false;

  rol!: any;
  isDarkMode: any;
  componentes!: Observable<Componente[]>;

  @ViewChild('idEmpresaInput') idEmpresaInput!: ElementRef;

  constructor(
    public formBuilder: FormBuilder,
    public alertController: AlertController,
    private router: Router,
    public empresaRegis: EmpresaService,
    public provinciasService: ProvinciasService,
    public authService: AuthService,
    public menuService: MenuService,
    public themeService: ThemeService,
  ) {
    this.empresaForm = this.formBuilder.group({
      cif: new FormControl("", Validators.compose([Validators.required, Validators.pattern("[A-Za-z]{1}[0-9]{8}")])),
      empresa: new FormControl("", Validators.compose([Validators.required])),
      direccion: new FormControl("", Validators.compose([Validators.required])),
      provincia: new FormControl("", Validators.compose([Validators.required])),
      ciudad: new FormControl("", Validators.compose([Validators.required])),
      cPostal: new FormControl("", Validators.compose([Validators.required])),
      tipoLocal: new FormControl("", Validators.compose([Validators.required])),
    });
    this.getUserRole();
    // console.log('Rol obtenido:', this.rol);
    this.isDarkMode = this.themeService.isDarkTheme();
  }

  ngOnInit() {
    this.componentes = this.menuService.getMenuOpts();
    this.provincias = this.provinciasService.getProvincias();

    const idEmpresaString = localStorage.getItem('id_empresa');
    this.idEmpresa = idEmpresaString ? parseInt(idEmpresaString, 10) : null;  // Asignar a this.idEmpresa

    if (this.idEmpresa === null) {
      console.error('Error: id_empresa no tiene un valor asignado.');
      return;
    }

    if (!this.id_user) {
      this.id_user = `user_${Math.random().toString(36).substr(2, 9)}`;
    }

    this.empresaForm.get('id_empresa')?.setValue(this.id_empresa);
  }

  obtenerIdUsuario(): void {
    const usuarioString = localStorage.getItem('usuario');

    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      const idUsuario = usuario.id_user ? usuario.id_user : null;
      const idEmpresa = usuario.id_empresa ? usuario.id_empresa : null;

      this.idEmpresa = idEmpresa;
      this.id_user = idUsuario;
      this.id_empresa = idEmpresa;

      this.id_user = idUsuario;
      this.id_empresa = idEmpresa;
    } else {
      console.error('Usuario no encontrado en el almacenamiento local');
    }
  }


  // Obtener el rol del usuario
  getUserRole() {
    this.rol = localStorage.getItem('userRole');
    // console.log(this.rol);

    // Verificar si el rol no es "administrador" 
    if (!(this.rol === 'administrador')) {
      console.error('Usuario con rol', this.rol, 'no tiene permiso para acceder a esta opción.');
      this.authService.logout().subscribe(
        () => {
          // Elimina cualquier informacion de session almacenada localmente

          // Redirigir al usuario a la pagina de inicion de sesion
          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Error al cerrar sesion:', error);
        }
      )
    }
  }

  // Getter para acceder fácilmente a los controles del formulario
  get f() {
    return this.empresaForm.controls;
  }

  // Obtener la lista de provincias al iniciar la página
  // getProvincias() {
  //   this.provinciasService.getProvincias().subscribe(async (ans) => {
  //     this.provincias = ans;
  //   });
  // }

  enviarDatos() {
    this.submitted = true;

    if (this.empresaForm.invalid) {
      console.log('Formulario no válido. Deteniendo envío de datos.');
      return;
    }

    // Obtener el nuevo usuario del formulario
    const nuevaEmpresa = this.empresaForm.value;

    // Obtener el valor de id_user del localStorage
    const idEmpresaString = localStorage.getItem('id_empresa');

    // Asegurarse de que id_user tiene un valor asignado
    if (idEmpresaString) {
      // Asignar id_user al nuevo usuario
      nuevaEmpresa.id_empresa = idEmpresaString;

      // Obtener el valor de ID_EMPRESA del localStorage
      //const idEmpresaString = localStorage.getItem('id_empresa');

      // Asegurarse de que ID_EMPRESA tiene un valor asignado
      if (idEmpresaString) {
        // Asignar ID_EMPRESA al nuevo usuario
        nuevaEmpresa.id_empresa = idEmpresaString;

        // Almacenar el nuevo usuario localmente
        this.almacenarEmpresaLocalmente(nuevaEmpresa);

        this.mostrarAlertaOK('Atención', 'Datos almacenados localmente');
      } else {
        console.error('Error: ID_EMPRESA no tiene un valor asignado en el localStorage.');
      }
    } else {
      console.error('Error: id_user no tiene un valor asignado en el localStorage.');
    }
  }

  almacenarEmpresaLocalmente(empresa: any) {
    // Obtener el array de usuarios almacenado en localStorage
    const empresaString = localStorage.getItem(`empresas_`);
    const empresas = empresaString ? JSON.parse(empresaString) : [];

    // Agregar el nuevo usuario al array
    empresas.push(empresa);

    // Almacenar el array actualizado en localStorage
    localStorage.setItem(`empresas_`, JSON.stringify(empresas));
  }

  // Método para mostrar alerta de éxito
  async mostrarAlertaOK(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: [{
        text: 'OK',
        handler: () => {
          const empresa = localStorage.getItem('empresa');
          console.log('Nombre de la empresa en localStorage:', empresa);
          window.location.href = '/config-empleados';
        }
      }],
      cssClass: 'custom-alert-header'
    });

    await alert.present();
  }

  // Método para mostrar alerta de error
  async mostrarAlertaNO(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK'],
      cssClass: 'custom-alert-header'
    });

    await alert.present();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkTheme(this.isDarkMode);
  }

  cerrarSesion(): void {
    this.authService.logout().subscribe();
  }
}
