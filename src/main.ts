import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app/app.routes'; // Falls du Router verwendest
import { provideRouter } from '@angular/router';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
.catch((err) => console.error(err));
