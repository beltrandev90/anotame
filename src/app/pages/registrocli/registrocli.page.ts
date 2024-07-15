import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-registrocli',
  templateUrl: './registrocli.page.html',
  styleUrls: ['./registrocli.page.scss'],
})
export class RegistrocliPage {

  ionicForm!: FormGroup;
  submitted = false;

  constructor(
    public formBuilder: FormBuilder,
    public alertController: AlertController,
  ) { 
    this.ionicForm = this.formBuilder.group({
      nombre: new FormControl("", Validators.compose([ Validators.required ])),
      apellido: new FormControl("", Validators.compose([ Validators.required ])),
      email: new FormControl("", Validators.compose([ Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")])),
      password: new FormControl("", Validators.compose([ Validators.required, Validators.minLength(6) ])),
      telf: new FormControl("", Validators.compose([ Validators.required ])),
      confirmPassword: new FormControl("", Validators.compose([ Validators.required, Validators.minLength(6) ])),
      rol: new FormControl("cliente", Validators.compose([Validators.required])),
    },{
      validators: this.MustMatch('password', 'confirmPassword')
    });
  }

  get f() { 
    return this.ionicForm.controls; 
  }

  MustMatch(password:any, confirmPassword:any) {
    return (formGroup:FormGroup) => {
      const passwordcontrol = formGroup.controls[password];
      const confirmPasswordControl = formGroup.controls[confirmPassword];

      if(confirmPasswordControl.errors && !confirmPasswordControl.errors['MustMatch']) {
        return;
      }

      if(passwordcontrol.value !== confirmPasswordControl.value) {
        confirmPasswordControl.setErrors({ MustMatch: true });
      } else {
        confirmPasswordControl.setErrors(null);
      }
    };
  }

  async mostrarAlertaOK(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: [{
        text: 'OK',
        handler: () => {
          window.location.href = '/logincli';
        }
      }],
      cssClass: 'custom-alert-header'
    });

    await alert.present();
  }

  async mostrarAlertaNO(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK'],
      cssClass: 'custom-alert-header'
    });

    await alert.present();
  }

  alert(event: any) {
    this.submitted = true;

    if (this.ionicForm.invalid) {
      return;
    }

    // Obtener datos almacenados en localStorage
    const clientesGuardadosString = localStorage.getItem('clientes') || '[]';
    const clientesGuardados = JSON.parse(clientesGuardadosString);

    const nuevoCliente = {
      nombre: event.target.nombre,
      apellido: event.target.apellido,
      email: event.target.email,
      telf: event.target.telf,
      password: event.target.password,
      rol: event.target.rol,
    };

    // Agregar el nuevo cliente al array de clientes
    clientesGuardados.push(nuevoCliente);

    // Almacenar el array actualizado en localStorage
    localStorage.setItem('clientes', JSON.stringify(clientesGuardados));

    // Generar un id_cliente único (si lo necesitas)
    const idCliente = uuidv4();

    // Puedes almacenar el id_cliente aquí si lo necesitas

    this.mostrarAlertaOK('Atención', 'Se ha enviado un email de verificación de usuario');
  }

  enviarDatos() {
    this.submitted = true;

    if (this.ionicForm.invalid) {
      console.log('Formulario no válido. Deteniendo envío de datos.');
      return;
    }

    // Obtener datos almacenados en localStorage
    const clientesGuardadosString = localStorage.getItem('clientes') || '[]';
    const clientesGuardados = JSON.parse(clientesGuardadosString);

    const nuevoCliente = {
      nombre: this.ionicForm.get('nombre')?.value,
      apellido: this.ionicForm.get('apellido')?.value,
      email: this.ionicForm.get('email')?.value,
      telf: this.ionicForm.get('telf')?.value,
      password: this.ionicForm.get('password')?.value,
      rol: this.ionicForm.get('rol')?.value,
    };

    // Agregar el nuevo cliente al array de clientes
    clientesGuardados.push(nuevoCliente);

    // Almacenar el array actualizado en localStorage
    localStorage.setItem('clientes', JSON.stringify(clientesGuardados));

    // Generar un id_cliente único (si lo necesitas)
    const idCliente = uuidv4();

    // Puedes almacenar el id_cliente aquí si lo necesitas

    this.mostrarAlertaOK('Atención', 'Se ha enviado un email de verificación de usuario');
  }

}
