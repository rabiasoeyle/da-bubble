import { Component, inject } from '@angular/core';
import { AuthService, UserData } from '../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  router = inject(Router);
  userData: UserData | null = null;
  toggleMenuIsOpen:boolean = false;

  constructor(private authService: AuthService){
  }
  ngOnInit(): void {
    this.authService.userData$.subscribe((data) => {
      this.userData = data;
      if(this.userData == null){
          this.router.navigateByUrl('');
      }
      console.log('Aktuelle Benutzerdaten:', this.userData);
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
