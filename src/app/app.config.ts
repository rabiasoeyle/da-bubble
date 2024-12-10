import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp } from "firebase/app";

import { provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideHttpClient } from '@angular/common/http';

// Your web app's Firebase configuration
const firebase = {
  apiKey: "AIzaSyA71jwQ3pIqlVwMAWybxUTctoVCr3PvQmw",
  authDomain: "da-bubble-85cd2.firebaseapp.com",
  projectId: "da-bubble-85cd2",
  storageBucket: "da-bubble-85cd2.firebasestorage.app",
  messagingSenderId: "1053306260929",
  appId: "1:1053306260929:web:bcf0a0885aeb3f38ffb340"
};
// const firebase = {
//   apiKey: "AIzaSyA71jwQ3pIqlVwMAWybxUTctoVCr3PvQmw",
//   authDomain: "da-bubble-85cd2.firebaseapp.com",
//   projectId: "da-bubble-85cd2",
//   storageBucket: "da-bubble-85cd2.firebasestorage.app",
//   messagingSenderId: "1053306260929",
//   appId: "1:1053306260929:web:934cf2ec44748823ffb340"
// };

// Initialisiere Firebase vor anderen Imports:
const app = initializeApp(firebase);

console.log(app); 

// export const appConfig: ApplicationConfig = {
//   providers: [provideRouter(routes), 
//     provideHttpClient(),
//       provideFirebaseApp(() => app), 
//       provideAuth(() => getAuth()), 
//       provideFirestore(() => getFirestore()),
//       provideDatabase(() => getDatabase()), 
//       provideFunctions(() => getFunctions()), 
//       provideMessaging(() => getMessaging()), 
//       provideStorage(() => getStorage())
//     ]
// };
