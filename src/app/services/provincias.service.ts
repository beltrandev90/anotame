import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProvinciasService {
  
  BASE_RUTA ="http://localhost/anotame/APIANOTAME/public/";
  //192.168.0.16
  RUTA_PROVINCIA = "Provincias";

  constructor(
    public http: HttpClient
  ) { }

  getProvincias(): string[] {
    return [
      'Álava',
      'Albacete',
      'Alicante',
      'Almería',
      'Asturias',
      'Ávila',
      'Badajoz',
      'Barcelona',
      'Burgos',
      'Cáceres',
      'Cádiz',
      'Cantabria',
      'Castellón',
      'Ciudad Real',
      'Córdoba',
      'Cuenca',
      'Girona',
      'Granada',
      'Guadalajara',
      'Guipúzcoa',
      'Huelva',
      'Huesca',
      'Islas Baleares',
      'Jaén',
      'A Coruña',
      'La Rioja',
      'Las Palmas',
      'León',
      'Lleida',
      'Lugo',
      'Madrid',
      'Málaga',
      'Murcia',
      'Navarra',
      'Ourense',
      'Palencia',
      'Pontevedra',
      'Salamanca',
      'Santa Cruz de Tenerife',
      'Segovia',
      'Sevilla',
      'Soria',
      'Tarragona',
      'Teruel',
      'Toledo',
      'Valencia',
      'Valladolid',
      'Vizcaya',
      'Zamora',
      'Zaragoza',
    ];
  }
  

  // getProvincias() {

  //   var headers = new Headers();
  //   headers.append("Accept", "application/json");
  //   headers.append("Content-Type", "application/json");

  //   return this.http.post(this.BASE_RUTA + this.RUTA_PROVINCIA + '/getProvincias', '')
  //   .pipe(
  //     dat => {
  //       // console.log('res ' + JSON.stringify(dat));
  //       return dat;
  //     }
  //   );
  // }
}