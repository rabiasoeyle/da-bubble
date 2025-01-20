import { inject, Injectable, Input } from '@angular/core';
import { FirebaseApp, getApps } from '@angular/fire/app';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Database, getDatabase, ref, set } from '@angular/fire/database';
import { addDoc, collection, doc, DocumentData, DocumentReference, Firestore, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, from, merge, Observable } from 'rxjs';
import { getAuth, onAuthStateChanged, sendSignInLinkToEmail, User, UserCredential } from "firebase/auth";
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
  actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be in the authorized domains list in the Firebase Console.
    url: 'https://www.example.com/finishSignUp?cartId=1234',
    // This must be true.
    handleCodeInApp: true,
    iOS: {
      bundleId: 'com.example.ios'
    },
    android: {
      packageName: 'com.example.android',
      installApp: true,
      minimumVersion: '12'
    },
    dynamicLinkDomain: 'example.page.link'
  };

  private userDataSubject = new BehaviorSubject<UserData | null>(null); // Initial null
  public userData$ = this.userDataSubject.asObservable(); // Observable für Komponenten
  constructor() {
  }

  register(email:string, name:string, password:string):Observable <void>{
    //Firebase saves observables and not promises, 
    //so we should change them to oberservables
    // sendSignInLinkToEmail(this.firebaseAuth, email, this.actionCodeSettings)
    //   .then(() => {
    //     // The link was successfully sent. Inform the user.
    //     // Save the email locally so you don't need to ask the user for it again
    //     // if they open the link on the same device.
    //     window.localStorage.setItem('emailForSignIn', email);
    //     // ...
    //   })
    //   .catch((error) => {
    //     const errorCode = error.code;
    //     const errorMessage = error.message;
    //     // ...
    // });
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

  async addData(uid: string, email:string|any, name:string|any) {
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

  async updateUserProfile(uid: string, fotolink: string): Promise<void> {
    try {
      const userDocRef = doc(this.firebaseDatabase, `users/${uid}`);
      await setDoc(userDocRef, {fotolink }, { merge: true });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Profilbilds:', error);
    }
  }
  // async updateUserProfile(uid: string, data: { userName: string; userEmail: string; fotolink: string }): Promise<void> {
  //   try {
  //     const userDocRef = doc(this.firebaseDatabase, `users/${uid}`);
  //     await setDoc(userDocRef, data, { merge: true }); // Benutzer-Dokument erstellen oder aktualisieren
  //     console.log('Benutzerdaten erfolgreich aktualisiert:', data);
  //   } catch (error) {
  //     console.error('Fehler beim Aktualisieren des Benutzers:', error);
  //   }
  // }

  async googleSignin(): Promise<void> {
      try {
        const provider = new GoogleAuthProvider(); // Google-Provider initialisieren
        const credential = await signInWithPopup(this.firebaseAuth, provider); // Mit Popup anmelden
        const user = credential.user; // Angemeldeter Benutzer
    
        if (user) {
          this.addData(user.uid, user.email, user.displayName);
          return this.getData(user.uid).then((data) => {
            this.userDataSubject.next(data);
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

