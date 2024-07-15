import { Component, OnInit } from '@angular/core';

import { AlertController } from '@ionic/angular';
import { switchMap, catchError } from 'rxjs/operators';
import { Subscription, throwError } from 'rxjs';  // Importa Subscription de RxJS
import { EmpresaService } from 'src/app/services/empresa.service';
import { RefreshService } from 'src/app/services/refresh.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

import { v4 as uuidv4 } from 'uuid';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {

  ionicForm!: FormGroup;
  submitted = false;
  idEmpresaSeleccionada: string | null = null;

  constructor(
    public formBuilder: FormBuilder,
    public alertController: AlertController,
  ) {
    this.ionicForm = this.formBuilder.group({
      nombre: new FormControl("", Validators.compose([Validators.required])),
      apellido: new FormControl("", Validators.compose([Validators.required])),
      email: new FormControl("", Validators.compose([Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")])),
      password: new FormControl("", Validators.compose([Validators.required, Validators.minLength(6)])),
      confirmPassword: new FormControl("", Validators.compose([Validators.required, Validators.minLength(6)])),
      rol: new FormControl("administrador", Validators.compose([Validators.required])),
      id_empresa: new FormControl("", Validators.compose([Validators.required])),
    }, {
      validators: this.MustMatch('password', 'confirmPassword')
    });
  }

  ngOnInit() {
    // Recuperar el id de la empresa del localStorage
    const storedIdEmpresa = localStorage.getItem('id_empresa');
    if (storedIdEmpresa) {
      this.idEmpresaSeleccionada = storedIdEmpresa;
      this.ionicForm.get('id_empresa')?.setValue(this.idEmpresaSeleccionada);
    }

    // Genera un id único para id_user
    const uniqueIdEmpresa = uuidv4();

    // Asigna el valor único a id_user en el formulario
    this.ionicForm.get('id_user')?.setValue(uniqueIdEmpresa);
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

  errorControl() {
    return this.ionicForm.controls;
  }

  alert(event: any) {
    console.log(event.target);

    const datos = {
      nombre: event.target.nombre,
      apellido: event.target.apellido,
      email: event.target.email,
      password: event.target.password,
      rol: event.target.rol,
    }

    console.log(datos);

    this.submitted = true;

    if (this.ionicForm.invalid) {
      return;
    }
  }
  enviarDatos() {
    this.submitted = true;
  
    if (this.ionicForm.invalid) {
      console.log('Formulario no válido. Deteniendo envío de datos.');
      return;
    }
  
    // Obtener usuarios almacenados localmente
    const storedUserData = localStorage.getItem('usuario');
    let userDataArray = storedUserData ? JSON.parse(storedUserData) : [];
  
    // Agregar el nuevo usuario al array
    userDataArray.push(this.ionicForm.value);
  
    // Almacenar el array actualizado en localStorage
    localStorage.setItem('usuario', JSON.stringify(userDataArray));
  
    // Generar un id_user único
    const idUser = uuidv4();
  
    // Almacenar el ID del usuario en localStorage
    localStorage.setItem('id_user', idUser);
  
    // Asignar el id_user al formulario
    this.ionicForm.get('id_user')?.setValue(idUser);
  
    this.mostrarAlertaOK('Atención', 'Se ha enviado un email de verificación de usuario');
  }
  

  // Método para mostrar alerta de éxito
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
}