import { Component } from '@angular/core';

@Component({
  selector: 'app-dialog-choose-avatar',
  standalone: true,
  imports: [],
  templateUrl: './dialog-choose-avatar.component.html',
  styleUrl: './dialog-choose-avatar.component.scss'
})
export class DialogChooseAvatarComponent {
  profiles = [
    "./assets/img/Elias.png",
    "./assets/img/Elise.png",
    "./assets/img/Frederik.png",
    "./assets/img/Noah.png",
    "./assets/img/Sofia.png",
    "./assets/img/Steffen.png",
  ];
  dummyProfile="./assets/img/Profile.png";
  constructor(){

  }

  saveNewAvatar(avatarImg:any){
    this.dummyProfile = avatarImg;
    console.log(this.dummyProfile);
  }

  goTo(route:string){

  }
}
