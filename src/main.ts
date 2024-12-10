// import { bootstrapApplication } from '@angular/platform-browser';
// import { appConfig } from './app/app.config';
// import { AppComponent } from './app/app.component';

// bootstrapApplication(AppComponent, appConfig)
//   .catch((err) => console.error(err));
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app/app.routes'; // Falls du Router verwendest
import { provideRouter } from '@angular/router';

const firebaseConfig = {
  apiKey: "AIzaSyA71jwQ3pIqlVwMAWybxUTctoVCr3PvQmw",
  authDomain: "da-bubble-85cd2.firebaseapp.com",
  projectId: "da-bubble-85cd2",
  storageBucket: "da-bubble-85cd2.firebasestorage.app",
  messagingSenderId: "1053306260929",
  appId: "1:1053306260929:web:bcf0a0885aeb3f38ffb340"
};

bootstrapApplication(AppComponent, {
  providers: [
    provideFirebaseApp(() => initializeApp(firebaseConfig)), // Firebase-App initialisieren
    provideAuth(() => getAuth()), // Auth-Service bereitstellen
    provideFirestore(() => getFirestore()), // Optional: Firestore
    provideHttpClient(), // Falls HTTP benötigt wird
    provideRouter(routes), // Falls Routing benötigt wird
  ],
}).catch((err) => console.error(err));
