import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AlertController } from '@ionic/angular';

import { UsuariosService } from '../../services/usuarios.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm!: FormGroup;
  submitted = false;
  recordarDatos = false;

  BASE_RUTA = "http://localhost/anotame/APIANOTAME/public/";

  constructor(
    public formBuilder: FormBuilder,
    private router: Router,
    public alertController: AlertController,
    public userLogin: UsuariosService,
    public authService: AuthService,
  ) {
    this.loginForm = this.formBuilder.group({
      email: new FormControl("", Validators.compose([Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")])),
      password: new FormControl("", Validators.compose([Validators.required, Validators.minLength(6)])),
      recordarDatos: [false] // valor por defecto del checkbox
    });
  }

  ngOnInit() {
    // Recupera los datos del usuario almacenados en localStorage
    const storedUserData = localStorage.getItem('usuario') || localStorage.getItem('usuarios_');
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

  enviarDatos() {
    // Obtener datos del formulario
    const storedUserData = localStorage.getItem('usuario') || localStorage.getItem('usuarios_');
    const storedUserDataUsuarios = localStorage.getItem('usuarios_');
  
    // Combinar datos de 'usuario' y 'usuarios_'
    let userDataArray: any[] = [];
  
    if (storedUserData) {
      try {
        // Intentar parsear el contenido como un array
        const userData = JSON.parse(storedUserData);
  
        if (Array.isArray(userData)) {
          userDataArray = userDataArray.concat(userData);
        } else {
          userDataArray.push(userData);
        }
      } catch (error) {
        // Si falla el parseo, asumir que es un objeto y convertirlo en un array
        userDataArray.push(JSON.parse(storedUserData));
      }
    }
  
    if (storedUserDataUsuarios) {
      try {
        // Intentar parsear el contenido como un array
        const userDataUsuarios = JSON.parse(storedUserDataUsuarios);
  
        if (Array.isArray(userDataUsuarios)) {
          userDataArray = userDataArray.concat(userDataUsuarios);
        } else {
          userDataArray.push(userDataUsuarios);
        }
      } catch (error) {
        // Si falla el parseo, asumir que es un objeto y convertirlo en un array
        userDataArray.push(JSON.parse(storedUserDataUsuarios));
      }
    }
  
    console.log('userDataArray:', userDataArray);
  
    // Verificar si el usuario está presente en alguno de los arrays de usuarios
    const usuario = this.findUserInArrays(userDataArray);
  
    console.log('Usuario:', usuario);
  
    if (usuario) {
      const userRole = usuario.rol;
      const idEmpresa = usuario.id_empresa;
  
      // Almacena el id_empresa en localStorage
      localStorage.setItem('id_empresa', idEmpresa);
  
      // Almacenar el rol en localStorage
      localStorage.setItem('userRole', userRole);
  
      localStorage.setItem('email', usuario.email);
      localStorage.setItem('nombreUsuario', usuario.nombre);
  
      // Redirige a la página principal
      this.router.navigate(['/home']);
    } else {
      this.presentAlert('Error', 'Usuario o contraseña incorrectos');
    }
  }
  
  

  findUserInArrays(userDataArray: any[]): any | null {
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
  
    for (const userData of userDataArray) {
      if (userData.email === email) {
        if (userData.password === password) {
          return userData; // Usuario encontrado
        } else {
          return null; // Contraseña incorrecta
        }
      }
    }
  
    return null; // Usuario no encontrado
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
