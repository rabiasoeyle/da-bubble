import { inject, Injectable, Input } from '@angular/core';
import { FirebaseApp, getApps } from '@angular/fire/app';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Database, getDatabase, ref, set } from '@angular/fire/database';
import { addDoc, collection, doc, DocumentData, DocumentReference, Firestore, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, from, merge, Observable } from 'rxjs';
import { getAuth, onAuthStateChanged, User, UserCredential } from "firebase/auth";
import {GoogleAuthProvider, signInWithPopup } from "@angular/fire/auth";
export interface UserData {
    uid: string;
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
  currentUid: string | null = null;
  private userDataSubject = new BehaviorSubject<UserData | null>(null); // Initial null
  public userData$ = this.userDataSubject.asObservable(); // Observable für Komponenten
  constructor() {
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
      uid: uid,
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

  // async updateUserProfile(uid: string, fotolink: string): Promise<void> {
  //   try {
  //     const userDocRef = doc(this.firebaseDatabase, `users/${uid}`);
  //     await setDoc(userDocRef, {fotolink }, { merge: true });
  //   } catch (error) {
  //     console.error('Fehler beim Aktualisieren des Profilbilds:', error);
  //   }
  // }
  async updateUserProfile(uid: string, data: { userName: string; userEmail: string; fotolink: string }): Promise<void> {
    try {
      const userDocRef = doc(this.firebaseDatabase, `users/${uid}`);
      await setDoc(userDocRef, data, { merge: true }); // Benutzer-Dokument erstellen oder aktualisieren
      console.log('Benutzerdaten erfolgreich aktualisiert:', data);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Benutzers:', error);
    }
  }

  async googleSignin(): Promise<void> {
    // try {
    //   const provider = new GoogleAuthProvider();
    //   const result = await signInWithPopup(this.firebaseAuth, provider);
    //   const user: User = result.user;

    //   // Falls du weitere Benutzerdaten speichern willst
    //   const photoURL = user.photoURL || ''; // Foto des Benutzers
    //   await this.updateUserProfile(user.uid, photoURL);

    //   console.log('Erfolgreich mit Google angemeldet:', user);
    // } catch (error) {
    //   console.error('Fehler bei der Google-Anmeldung:', error);
    // }
    // async googleSignin(): Promise<void> {
      try {
        const provider = new GoogleAuthProvider(); // Google-Provider initialisieren
        const credential = await signInWithPopup(this.firebaseAuth, provider); // Mit Popup anmelden
        const user = credential.user; // Angemeldeter Benutzer
    
        if (user) {
          const fotolink = user.photoURL || ''; // Fallback für das Profilbild
          console.log('Benutzerinformationen:', user);
    
          // Benutzerprofil aktualisieren (optional)
          await this.updateUserProfile(user.uid, {
            userName: user.displayName || '',
            userEmail: user.email || '',
            fotolink: fotolink,
          });
        }
      } catch (error) {
        console.error('Fehler bei der Google-Authentifizierung:', error);
      }
    }
  }

  // Aktuellen Benutzer abrufen
  // async getCurrentUser() {
  //   return this.firebaseAuth.currentUser;
  // }

