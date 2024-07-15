import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ThemeService } from './services/theme.service';
import { HttpClientModule } from '@angular/common/http';

import { NgxPrintModule } from 'ngx-print';
import { QRCodeModule } from 'angularx-qrcode';
import { ContactoService } from './services/contacto.service';
import { HorariosService } from './services/horarios.service';
import { DiasService } from './services/dias.service';
import { TextoService } from './services/texto.service';
import { NotificacionService } from './services/notificacion.service';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getStorage, provideStorage } from '@angular/fire/storage';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    HttpClientModule,
    NgxPrintModule,
    QRCodeModule,
    AppRoutingModule,
    IonicModule.forRoot({}),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],
  providers: [
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    }, 
    ContactoService,
    HorariosService,
    DiasService,
    ThemeService,
    NotificacionService,
    TextoService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}