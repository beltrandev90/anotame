import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-logincli',
  templateUrl: './logincli.page.html',
  styleUrls: ['./logincli.page.scss'],
})
export class LogincliPage implements OnInit {

  loginForm!: FormGroup;
  submitted = false;
  recordarDatos = false;

  BASE_RUTA = "http://localhost/anotame/APIANOTAME/public/";

  constructor(
    public formBuilder: FormBuilder,
    private router: Router,
    public alertController: AlertController,
  ) {
    this.loginForm = this.formBuilder.group({
      email: new FormControl("", Validators.compose([Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")])),
      password: new FormControl("", Validators.compose([Validators.required, Validators.minLength(6)])),
      recordarDatos: [false] // valor por defecto del checkbox
    });
  }

  ngOnInit() {
    // Recupera los datos del usuario almacenados en localStorage
    const storedUserData = localStorage.getItem('clientes');
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      this.loginForm.patchValue(userData);
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  // Método para manejar el evento de clic en el botón
  alert(event: any) {
    // Obtener datos del formulario
    const datos = {
      email: event.target.email,
      password: event.target.password
    }

    // Asignar el valor del checkbox a la propiedad recordarDatos
    this.recordarDatos = this.loginForm.controls['recordarDatos'].value;

    // Validaciones
    this.submitted = true;

    // Detenerse aquí si el formulario no es válido
    if (this.loginForm.invalid) {
      return;
    }

    // En lugar de mostrar la alerta, enviar los datos al servicio
    this.enviarDatos();
  }

   // Método para enviar datos al servicio de inicio de sesión
   enviarDatos() {
    // Obtener datos del formulario
    const storedUserData = localStorage.getItem('clientes');

    if (storedUserData) {
      let userDataArray: any;

      try {
        // Intentar parsear el contenido como un array
        userDataArray = JSON.parse(storedUserData);

        // Verificar si userDataArray es un array
        if (!Array.isArray(userDataArray)) {
          // Si no es un array, convertirlo en un array
          userDataArray = [userDataArray];
        }
      } catch (error) {
        // Si falla el parseo, asumir que es un objeto y convertirlo en un array
        userDataArray = [JSON.parse(storedUserData)];
      }

      // Verificar si el usuario está presente en alguno de los arrays de usuarios
      const usuario = this.findUserInArrays(userDataArray);

      if (usuario) {
        const userRole = usuario.rol;
        const idEmpresa = usuario.id_empresa;

        // Almacena el id_empresa en localStorage
        localStorage.setItem('id_empresa', idEmpresa);

        // Almacenar el rol en localStorage
        localStorage.setItem('userRole', userRole);

        localStorage.setItem('email', usuario.email);
        localStorage.setItem('nombreCliente', usuario.nombre);

        // Redirige a la página principal
        this.router.navigate(['/seleccion-empresa']);
      } else {
        this.presentAlert('Error', 'Usuario o contraseña incorrectos');
      }
    } else {
      this.presentAlert('Error', 'Usuario o contraseña incorrectos');
    }
  }

    // Función para buscar el usuario en los arrays
    findUserInArrays(userDataArray: any[]): any | null {
      const email = this.loginForm.value.email;
      const password = this.loginForm.value.password;
  
      for (const userData of userDataArray) {
        if (userData.email === email && userData.password === password) {
          return userData;
        }
      }
  
      return null;
    }
  

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

}
