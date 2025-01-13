import { inject, Injectable } from '@angular/core';
import { FirebaseApp, getApps } from '@angular/fire/app';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Database, getDatabase, ref, set } from '@angular/fire/database';
import { addDoc, collection, doc, DocumentReference, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { getAuth, onAuthStateChanged } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  firebase = inject(FirebaseApp);
  firebaseAuth = inject(Auth);
  firebaseDatabase = inject(Firestore);
  user = {};
  userData={};
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
          const uid:string = user.uid;
          console.log("User-ID:"+ uid);
          this.addData(uid, email, name);
        } else {
          // User is signed out
        }
      });
      return from(promise);
  }

  async addData(uid: string, email:string, name:string) {
    const userDocRef = doc(this.firebaseDatabase, `users/${uid}`); // Dokument mit UID als Pfad
    await setDoc(userDocRef, {userName:name,userEmail:email,fotolink:"",freundeliste:"",chatliste:"",gruppenliste:""}); // Beispiel-Daten
    console.log('Daten erfolgreich hinzugefügt');
  }

  login(email:string, password:string):Observable <void>{
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
    .then(()=>{})
    // this.user = this.getCurrentUser(); 
    // console.log("Nutzer:"+this.user);
    
    onAuthStateChanged(this.firebaseAuth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        const uid = user.uid;
        console.log("User-ID:"+uid);
        
        const userDocRef = doc(this.firebaseDatabase, `users/${uid}`); // Dokument der aktuellen UID abrufen
        this.getData(userDocRef) // Dokument abrufen
            // ...
      } else {
        // User is signed out
        this.userData={};
      }
});
    return from(promise);
  }

  async getData(userDocRef:DocumentReference){
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      console.log('Benutzerdaten:', userDoc.data());
      this.userData=userDoc.data();
      console.log(this.userData);
      return userDoc.data(); // Daten des Benutzers zurückgeben
    } else {
      console.log('Kein Dokument für diesen Benutzer gefunden');
      return null; // Kein Dokument vorhanden
    }

  }

  // Aktuellen Benutzer abrufen
  async getCurrentUser() {
    return this.firebaseAuth.currentUser;
  }
}
