import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { provideHttpClient } from '@angular/common/http';


const firebaseConfig = {
  apiKey: "AIzaSyA71jwQ3pIqlVwMAWybxUTctoVCr3PvQmw",
  authDomain: "da-bubble-85cd2.firebaseapp.com",
  projectId: "da-bubble-85cd2",
  storageBucket: "da-bubble-85cd2.firebasestorage.app",
  messagingSenderId: "1053306260929",
  appId: "1:1053306260929:web:934cf2ec44748823ffb340"
};

 
 
export const appConfig: ApplicationConfig = {
    providers: [
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideFirebaseApp(() => initializeApp(
        {"projectId":"da-bubble-85cd2",
          "appId":"1:1053306260929:web:934cf2ec44748823ffb340",
          "storageBucket":"da-bubble-85cd2.firebasestorage.app",
          "apiKey":"AIzaSyA71jwQ3pIqlVwMAWybxUTctoVCr3PvQmw",
          "authDomain":"da-bubble-85cd2.firebaseapp.com",
          "messagingSenderId":"1053306260929"})), // Firebase-App initialisieren
      provideAuth(() => getAuth()), // Auth-Service bereitstellen
      provideFirestore(() => getFirestore()), // Optional: Firestore
      provideDatabase(() => getDatabase()),
      provideHttpClient(), // Falls HTTP benötigt wird
      provideRouter(routes), // Falls Routing benötigt wird
    ],
};
