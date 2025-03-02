import { Component, inject, Input, OnInit } from '@angular/core';
import { AuthService} from '../../auth.service';
import { Router } from '@angular/router';
import { UserData } from '../../../modules/user';
import { UserService } from '../../user.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Chat } from '../../../modules/chat';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  router = inject(Router);
  userData: UserData | null = null;
  toggleMenuIsOpen:boolean = false;
  suggestions: string[] = [];
  // showSuggestions = false;
  input = new FormControl('');
  searchResults: any = []; 
  @Input() userChats:Chat[] = [];
  constructor(private authService: AuthService, private userService: UserService) {
    this.setupSearchListener();
  }

  private setupSearchListener() {
    this.input.valueChanges
      .pipe(
        debounceTime(300), // Warte 300ms nach jeder Eingabe (vermeidet zu viele Suchanfragen)
        distinctUntilChanged() // Verhindert doppelte Suchanfragen für dieselbe Eingabe
      )
      .subscribe(value => {
        if (!value || value.length < 2) {
          this.searchResults = [];
          return;
        }
        const firstChar = value.charAt(0); // Erstes Zeichen ermitteln
        if (firstChar === "@") {
          this.searchResults = this.userService.searchUsers(value.substring(1)); // Suche nach Usernamen
          // this.searchType = "chat";
        } else if (firstChar === "#") {
          if(this.userData){
            this.searchResults = (this.userData.channels || [])
          .filter((channel: string) => 
            channel.toLowerCase().includes(value.substring(1).toLowerCase()));
          console.log("result:", this.searchResults)
          // this.searchType="channel"
          }
          // Suche nach Channels
        } else if (/[a-zA-Z]/.test(firstChar)) {
          this.searchResults = this.userService.searchUsersWithMail(value); // Suche nach E-Mail
          // this.searchType="chat";
        } else {
          this.searchResults = []; // Keine passenden Ergebnisse
        }
      });
  }
  selectChat(user: string) {
    this.input.setValue(user); // Wähle einen Benutzer aus
    this.searchResults = []; // Leere die Vorschläge
  }

  ngOnInit(): void {
    this.authService.userData$.subscribe((data) => {
      this.userData = data;
      if(this.userData == null){
          this.router.navigateByUrl('');
      }
    });
  }
  toggleMenu(){
    this.toggleMenuIsOpen = !this.toggleMenuIsOpen;

  }
  logout(){
    this.authService.logout();
    // this.router.navigateByUrl('');
  }
}
