import { Component, OnInit } from '@angular/core';
import { AuthService, UserData } from '../auth.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  userData: UserData | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.userData$.subscribe((data) => {
      this.userData = data;
      console.log('Aktuelle Benutzerdaten:', this.userData);
    });
  }
}