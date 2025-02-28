import { inject, Injectable } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { Auth } from '@angular/fire/auth';
import { Database, ref, query, orderByChild, startAt, endAt, get } from '@angular/fire/database';
import { collection, collectionData, CollectionReference, DocumentData, Firestore, getDocs, where } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  firebase = inject(FirebaseApp);
  firebaseAuth = inject(Auth);
  // firebaseDatabase = inject(Firestore);
  private db: Firestore = inject(Firestore);
  private usersCollection: CollectionReference<DocumentData>;

  constructor() {
    this.usersCollection = collection(this.db, 'users'); // Richtige Typisierung der Collection
  }

  searchUsers(searchTerm: string): Observable<string[]> {
    console.log("searching...")
    if (!searchTerm.trim()) return new Observable<string[]>(observer => observer.next([]));

    const usersCollection = collection(this.db, 'users'); // Korrekte Firestore Collection Referenz
    return collectionData(usersCollection, { idField: 'id' }).pipe(
      map(users => users
        .map(user => user['name']) // Alle Namen extrahieren
        .filter(name => name.toLowerCase().startsWith(searchTerm.toLowerCase())) // Live-Filterung
      )
    );
  }

}
