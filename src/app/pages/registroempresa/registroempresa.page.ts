import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ProvinciasService } from 'src/app/services/provincias.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-registroempresa',
  templateUrl: './registroempresa.page.html',
  styleUrls: ['./registroempresa.page.scss'],
})
export class RegistroempresaPage implements OnInit {

  empresaForm!: FormGroup;
  submitted = false;
  provincias: string[] = [];

  constructor(
    public formBuilder: FormBuilder,
    public alertController: AlertController,
    public provinciasService: ProvinciasService,
    private router: Router,
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
  }

  ngOnInit() {
    this.provincias = this.provinciasService.getProvincias();
    // Genera un id único para id_empresa
    const uniqueIdEmpresa = uuidv4();

    // Asigna el valor único a id_empresa en el formulario
    this.empresaForm.get('id_empresa')?.setValue(uniqueIdEmpresa);


  }

  // Getter para acceder fácilmente a los controles del formulario
  get f() {
    return this.empresaForm.controls;
  }

  // Método para enviar los datos del formulario al servidor
  enviarDatos() {
    this.submitted = true;

    // Verificar si el formulario es válido
    if (this.empresaForm.invalid) {
      return;
    }

    // Obtener el valor actual de 'id_empresa' del localStorage
    const currentIdEmpresa = localStorage.getItem('id_empresa') || '0';

    // Incrementar el valor actual de 'id_empresa'
    const newIdEmpresa = String(Number(currentIdEmpresa) + 1);

    // Asignar id_empresa al formulario antes de almacenar los datos
    this.empresaForm.get('id_empresa')?.setValue(newIdEmpresa);

    // Almacenar el nuevo valor de 'id_empresa' en localStorage
    localStorage.setItem('id_empresa', newIdEmpresa);

    // Obtener datos existentes de localStorage o inicializar un array vacío
    const empresaData = JSON.parse(localStorage.getItem('empresa') || '[]') as any[];

    // Obtener el array actualizado de localStorage
    const updatedEmpresaData = JSON.parse(localStorage.getItem('empresa') || '[]') as any[];

    // Agregar los datos del formulario al array
    const formDataWithId = { ...this.empresaForm.value, id_empresa: newIdEmpresa }; // Incluir id_empresa en los datos
    updatedEmpresaData.push(formDataWithId);

    // Almacenar el array actualizado en localStorage
    localStorage.setItem('empresa', JSON.stringify(updatedEmpresaData));

    // Mostrar alerta de éxito y redirigir a la página de registro
    this.mostrarAlertaOK('Enhorabuena', 'Empresa registrada correctamente');
    this.router.navigate(['/registro']);
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
          window.location.href = '/registro';
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
}
