import { Component, inject, OnInit } from '@angular/core';
import { AuthService, UserData } from '../auth.service';
import { HeaderComponent } from './header/header.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [HeaderComponent,ReactiveFormsModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  userData: UserData | null = null;
  router = inject(Router);
  sidenavIsOpen:boolean = true;
  sidenavButtonText:string="Workspace-Menü schließen";
  profiles:object = {"":""};
  directMessagesOpen:boolean = true;
  channelsOpen:boolean = true;
  addChannelOpen:boolean = false;
  fb = inject(FormBuilder);
  addChannelForm = this.fb.nonNullable.group({
      channelname:['', Validators.required],
      description:['', Validators.required],
      
    })

  constructor(private authService: AuthService) {
  }

  changeSidenavStatus(){
    this.sidenavIsOpen = !this.sidenavIsOpen;
    if(this.sidenavIsOpen){
      this.sidenavButtonText="Workspace-Menü schließen"
    }else{
      this.sidenavButtonText="Workspace-Menü öffnen"
    }
  }
  
  ngOnInit(): void {
    this.authService.userData$.subscribe((data) => {
      this.userData = data;
      if(this.userData == null){
          this.router.navigateByUrl('');
      }
      console.log('Aktuelle Benutzerdaten im main:', this.userData);
    });
  }
  changeChannelAreaStatus(){
    this.channelsOpen = !this.channelsOpen;
  }
  changeMessageAreaStatus(){
    this.directMessagesOpen = !this.directMessagesOpen;
  }
  createChannel(){

  }
  addChannelDialog(){
    this.addChannelOpen = !this.addChannelOpen;
  }
  onAddChannel(){
    const rawForm = this.addChannelForm.getRawValue();
    this.authService.createChannel(rawForm.channelname, rawForm.description);
  }
}