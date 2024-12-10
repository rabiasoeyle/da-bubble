import { inject, Injectable } from '@angular/core';
import { FirebaseApp, getApps } from '@angular/fire/app';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firebase = inject(FirebaseApp);
  firebaseAuth = inject(Auth);
  constructor() {
    console.log('Firebase Apps:', getApps()); // Prüfen, ob Apps initialisiert wurden
    console.log('Auth Instance:', this.firebaseAuth);
  }

  register(email:string, name:string, password:string):Observable <void>{
    //Firebase saves observables and not promises, 
    //so we should change them to oberservables
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth, 
      email, 
      password)
      //if we want the username saved too, 
      // we must add it like this afterwards
      .then(response => updateProfile(response.user, {displayName: name}));
      return from(promise);
  }

  login(email:string, password:string):Observable <void>{
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
    .then(()=>{})
    return from(promise);
  }
}
