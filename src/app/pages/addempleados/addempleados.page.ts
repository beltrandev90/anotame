import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { v4 as uuidv4 } from 'uuid';

import { UsuariosService } from '../../services/usuarios.service';
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';
import { MenuService } from 'src/app/services/menu.service';

import { Componente } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-addempleados',
  templateUrl: './addempleados.page.html',
  styleUrls: ['./addempleados.page.scss'],
})
export class AddempleadosPage implements OnInit {

  ionicForm!: FormGroup;
  submitted = false;

  id_empresa: number | null = null;
  id_user: string | null = null;
  idEmpresa!: number | null;
  idEmpresa2: any;

  rol!: any;
  isDarkMode: any;
  componentes!: Observable<Componente[]>;

  @ViewChild('idEmpresaInput') idEmpresaInput!: ElementRef;

  constructor(
    public formBuilder: FormBuilder,
    private router: Router,
    public alertController: AlertController,
    public userRegis: UsuariosService,
    public authService: AuthService,
    public menuService: MenuService,
    public themeService: ThemeService,
  ) {
    this.ionicForm = this.formBuilder.group({
      nombre: new FormControl("", Validators.compose([Validators.required])),
      apellido: new FormControl("", Validators.compose([Validators.required])),
      email: new FormControl("", Validators.compose([Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")])),
      password: new FormControl("", Validators.compose([Validators.required, Validators.minLength(6)])),
      confirmPassword: new FormControl("", Validators.compose([Validators.required, Validators.minLength(6)])),
      rol: new FormControl("", Validators.compose([Validators.required])),
    }, {
      validators: this.MustMatch('password', 'confirmPassword')
    });
    this.getUserRole();
    this.isDarkMode = this.themeService.isDarkTheme();
  }

  ngOnInit() {
    this.componentes = this.menuService.getMenuOpts();

    const idEmpresaString = localStorage.getItem('id_empresa');
    this.idEmpresa = idEmpresaString ? parseInt(idEmpresaString, 10) : null;  // Asignar a this.idEmpresa

    if (this.idEmpresa === null) {
      console.error('Error: id_empresa no tiene un valor asignado.');
      return;
    }

    if (!this.id_user) {
      this.id_user = `user_${Math.random().toString(36).substr(2, 9)}`;
    }

    this.ionicForm.get('id_empresa')?.setValue(this.id_empresa);
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

  getUserRole() {
    this.rol = localStorage.getItem('userRole');

    if (!(this.rol === 'administrador')) {
      console.error('Usuario con rol', this.rol, 'no tiene permiso para acceder a esta opción.');
      this.authService.logout().subscribe(
        () => {
          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Error al cerrar sesión:', error);
        }
      )
    }
  }

  get f() {
    return this.ionicForm.controls;
  }

  MustMatch(password: any, confirmPassword: any) {
    return (formGroup: FormGroup) => {
      const passwordcontrol = formGroup.controls[password];
      const confirmPasswordControl = formGroup.controls[confirmPassword];

      if (confirmPasswordControl.errors && !confirmPasswordControl.errors['MustMatch']) {
        return;
      }

      if (passwordcontrol.value !== confirmPasswordControl.value) {
        confirmPasswordControl.setErrors({ MustMatch: true });
      } else {
        confirmPasswordControl.setErrors(null);
      }
    };
  }

  enviarDatos() {
    this.submitted = true;

    if (this.ionicForm.invalid) {
      console.log('Formulario no válido. Deteniendo envío de datos.');
      return;
    }

    // Obtener el nuevo usuario del formulario
    const nuevoUsuario = this.ionicForm.value;

    // Obtener el valor de id_user del localStorage
    const idUserString = localStorage.getItem('id_user');

    // Asegurarse de que id_user tiene un valor asignado
    if (idUserString) {
      // Asignar id_user al nuevo usuario
      nuevoUsuario.id_user = idUserString;

      // Obtener el valor de ID_EMPRESA del localStorage
      const idEmpresaString = localStorage.getItem('id_empresa');

      // Asegurarse de que ID_EMPRESA tiene un valor asignado
      if (idEmpresaString) {
        // Asignar ID_EMPRESA al nuevo usuario
        nuevoUsuario.id_empresa = idEmpresaString;

        // Almacenar el nuevo usuario localmente
        this.almacenarUsuarioLocalmente(nuevoUsuario);

        this.mostrarAlertaOK('Atención', 'Se ha enviado un email de verificación de usuario');
      } else {
        console.error('Error: ID_EMPRESA no tiene un valor asignado en el localStorage.');
      }
    } else {
      console.error('Error: id_user no tiene un valor asignado en el localStorage.');
    }
  }

  almacenarUsuarioLocalmente(usuario: any) {
    // Obtener el array de usuarios almacenado en localStorage
    const usuariosString = localStorage.getItem(`usuarios_`);
    const usuarios = usuariosString ? JSON.parse(usuariosString) : [];

    // Agregar el nuevo usuario al array
    usuarios.push(usuario);

    // Almacenar el array actualizado en localStorage
    localStorage.setItem(`usuarios_`, JSON.stringify(usuarios));
  }


  async mostrarAlertaOK(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: [{
        text: 'OK',
        handler: () => {
          window.location.href = '/login';
        }
      }],
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
