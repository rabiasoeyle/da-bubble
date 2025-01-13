import { inject, Injectable } from '@angular/core';
import { FirebaseApp, getApps } from '@angular/fire/app';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Database, getDatabase, ref, set } from '@angular/fire/database';
import { Firestore } from '@angular/fire/firestore/firebase';
import { from, Observable } from 'rxjs';
import { getAuth, onAuthStateChanged } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  firebase = inject(FirebaseApp);
  firebaseAuth = inject(Auth);
  // firebaseDatabase = inject(Database);
  user = {};
  // auth = getAuth();
  constructor() {
    console.log('Firebase Apps:',this.firebase , getApps()); // Prüfen, ob Apps initialisiert wurden
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
      onAuthStateChanged(this.firebaseAuth, (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/auth.user
          const uid = user.uid;
          console.log("User-ID:"+uid);
          // ...
        } else {
          // User is signed out
          // ...
        }
      });
      return from(promise);
  }

  login(email:string, password:string):Observable <void>{
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
    .then(()=>{})
    // this.user = this.getCurrentUser(); 
    // console.log("Nutzer:"+this.user);
    
onAuthStateChanged(this.firebaseAuth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    const uid = user.uid;
    console.log("User-ID:"+uid);
    // ...
  } else {
    // User is signed out
    // ...
  }
});
    return from(promise);
  }
  // Aktuellen Benutzer abrufen
  async getCurrentUser() {
    return this.firebaseAuth.currentUser;
  }

  // Benutzerdaten in der Realtime-Datenbank speichern
  async saveUserData(userId: string, userData: any) {
    const db = getDatabase(this.firebase);
    //here i should look if i can find another solution.
    const userRef = ref(db, `/users/${userId}`);
    return set(userRef, userData);
  }
}
