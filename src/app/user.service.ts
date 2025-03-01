import { inject, Injectable } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { Auth } from '@angular/fire/auth';
import { Database, ref, query, orderByChild, startAt, endAt, get } from '@angular/fire/database';
import { collection, collectionData, CollectionReference, DocumentData, Firestore, getDocs, where } from '@angular/fire/firestore';
import { map, Observable, tap } from 'rxjs';
import { UserData } from '../modules/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  firebase = inject(FirebaseApp);
  firebaseAuth = inject(Auth);
  // firebaseDatabase = inject(Firestore);
  private db: Firestore = inject(Firestore);
  allUsers:UserData[]=[];

  constructor() {
    this.loadAllUsers();
  }
  private async loadAllUsers() {
    try {
      const usersCollection = collection(this.db, 'users'); // Referenz zur Collection
      const userSnapshot = await getDocs(usersCollection); // Daten aus Firestore abrufen
      userSnapshot.forEach((doc) => {
        const user = doc.data();
        this.allUsers.push({
          uid: doc.id, // Firestore-Dokumenten-ID als UID speichern
          name: user['name'] || '',
          email: user['email'] || '',
          fotolink: user['fotolink'] || '',
          channels: user['channels'] || [],
          chats: user['chats'] || []
        });
      });
      console.log("✅ [DEBUG] Alle User geladen:", this.allUsers);
    } catch (error) {
      console.error("❌ Fehler beim Laden der User:", error);
    }
  }

  searchUsers(searchTerm: string): string[] {
    console.log("searchTerm",searchTerm);
    if (!searchTerm.trim()) return []; // Falls leer, nichts zurückgeben
    console.log("searchTerm2.",searchTerm);
    searchTerm = searchTerm.toLowerCase(); // Kleinbuchstaben für bessere Treffer
    return this.allUsers
      .map(user => user.name) // Nur Namen nehmen
      .filter(name => name.toLowerCase().includes(searchTerm)); // Filtern nach Suchbegriff
  }
  searchPrivatChats(){
    
  }

}
