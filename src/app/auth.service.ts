import { inject, Injectable, Input } from '@angular/core';
import { FirebaseApp, getApps } from '@angular/fire/app';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Database, getDatabase, ref, set } from '@angular/fire/database';
import { addDoc, collection, doc, DocumentData, DocumentReference, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { getAuth, onAuthStateChanged, UserCredential } from "firebase/auth";

export interface UserData {
    name: string;
    email: string;
    freunde:[]|any;
    gruppe:{}|any;
    chats:{}|any;
    fotolink:string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  firebase = inject(FirebaseApp);
  firebaseAuth = inject(Auth);
  firebaseDatabase = inject(Firestore);
  user = {};
  userData:any;
  private userDataSubject = new BehaviorSubject<UserData | null>(null); // Initial null
  public userData$ = this.userDataSubject.asObservable(); // Observable für Komponenten
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
      .then((response) => {
        return updateProfile(response.user, { displayName: name })
          .then(() => {
            // Daten nur einmal hinzufügen
            const uid: string = response.user.uid;
            console.log("User-ID:", uid);
            return this.addData(uid, email, name);
          });
      });
  
    return from(promise);
  }

  async addData(uid: string, email:string, name:string) {
    const userDocRef = doc(this.firebaseDatabase, `users/${uid}`); // Dokument mit UID als Pfad
    await setDoc(userDocRef, {
      name: name,                // Key: name
      email: email,              // Key: email
      fotolink: "",              // Key: fotolink
      freunde: [],               // Key: freunde
      gruppe: {},                // Key: gruppe
      chats: {}
    }); // Beispiel-Daten
  }

  login(email: string, password: string): Observable<void> {
    const loginPromise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      if (user) {
        const uid = user.uid;
        return this.getData(uid).then((data) => {
          this.userDataSubject.next(data);
        });
      }// Rückgabe für den Fall, dass user null ist
      return Promise.resolve(); // Gibt ein leeres Promise zurück
    });
    return from(loginPromise); // Promise in Observable umwandeln
  }

  logout(): void {
    this.firebaseAuth.signOut();
    this.userDataSubject.next(null); // Setzt die Benutzerdaten zurück
  }

  private async getData(uid: string): Promise<UserData | null> {
    const userDocRef = doc(this.firebaseDatabase, `users/${uid}`);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? (userDoc.data() as UserData) : null;
  }
}

  // Aktuellen Benutzer abrufen
  // async getCurrentUser() {
  //   return this.firebaseAuth.currentUser;
  // }

