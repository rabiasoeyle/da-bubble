import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { provideHttpClient } from '@angular/common/http';
 
export const appConfig: ApplicationConfig = {
    providers: [
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideFirebaseApp(() => initializeApp(
        {"projectId":"da-bubble-85cd2",
          "appId":"1:1053306260929:web:934cf2ec44748823ffb340",
          "storageBucket":"da-bubble-85cd2.firebasestorage.app",
          "apiKey":"AIzaSyA71jwQ3pIqlVwMAWybxUTctoVCr3PvQmw",
          "authDomain":"da-bubble-85cd2.firebaseapp.com",
          "messagingSenderId":"1053306260929"})),
      provideAuth(() => getAuth()), 
      provideFirestore(() => getFirestore()), 
      provideDatabase(() => getDatabase()),
      provideHttpClient(),
      provideRouter(routes),
    ],
};
