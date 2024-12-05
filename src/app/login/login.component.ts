import { Component, OnInit } from '@angular/core';
import { trigger, style, animate, transition, keyframes} from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  start:boolean=true;

  ngOnInit(): void {
    setInterval(()=> {
      this.start=false;
    } ,3000);
  }
}
