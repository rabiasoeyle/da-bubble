import { inject, Injectable, OnDestroy } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class PresenceService implements OnDestroy {
ngOnDestroy(): void {
  
}
}
