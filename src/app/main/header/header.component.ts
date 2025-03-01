import { Component, inject, OnInit } from '@angular/core';
import { AuthService} from '../../auth.service';
import { Router } from '@angular/router';
import { UserData } from '../../../modules/user';
import { UserService } from '../../user.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

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
  showSuggestions = false;
  input = new FormControl('');
  searchResults: string[] = []; 

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
        // console.log(value);
        this.searchResults = this.userService.searchUsers(value || ''); // Suche ausführen
        console.log("searchResults:", this.searchResults)
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
