import { Component, inject } from '@angular/core';
import { AuthService} from '../../auth.service';
import { Router } from '@angular/router';
import { UserData } from '../../../modules/user';
import { UserService } from '../../user.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, filter, switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  router = inject(Router);
  // userService = inject(UserService);
  userData: UserData | null = null;
  toggleMenuIsOpen:boolean = false;
  suggestions: string[] = [];
  showSuggestions = false;
  input = new FormControl('');

  constructor(private authService: AuthService, private userService: UserService) {
    
  }
  async searchUsers(value: string) {
    if (!value.trim()) return [];
    return this.userService.searchUsers(value.toLowerCase());
  }
  selectUser(user: string) {
    this.input.setValue(user);
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
