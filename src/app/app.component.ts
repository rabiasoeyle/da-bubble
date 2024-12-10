import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'da-bubble';
  constructor(){
  }
}

const firebase = {
  apiKey: "AIzaSyA71jwQ3pIqlVwMAWybxUTctoVCr3PvQmw",
  authDomain: "da-bubble-85cd2.firebaseapp.com",
  projectId: "da-bubble-85cd2",
  storageBucket: "da-bubble-85cd2.firebasestorage.app",
  messagingSenderId: "1053306260929",
  appId: "1:1053306260929:web:934cf2ec44748823ffb340"
};

bootstrapApplication(AppComponent, {
  providers: [
    provideFirebaseApp(() => initializeApp(firebase)), // Initialisierung hier
    provideAuth(() => getAuth()), // Auth-Service bereitstellen
  ],
}).catch(err => console.error("help" + err));

