import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService} from '../../auth.service';
import { UserData } from '../../../modules/user';

@Component({
  selector: 'app-dialog-choose-avatar',
  standalone: true,
  imports: [],
  templateUrl: './dialog-choose-avatar.component.html',
  styleUrl: './dialog-choose-avatar.component.scss'
})
export class DialogChooseAvatarComponent {
  router = inject(Router);
  profiles = [
    "./assets/img/Elias.png",
    "./assets/img/Elise.png",
    "./assets/img/Frederik.png",
    "./assets/img/Noah.png",
    "./assets/img/Sofia.png",
    "./assets/img/Steffen.png",
  ];
  dummyProfile="./assets/img/profile.png";
  chosedAvatar:boolean = false;
  userData: UserData | null = null;
  @Output()loginUser = new EventEmitter<string>();
  constructor(private authService: AuthService){

  }
  ngOnInit(): void {
    this.authService.userData$.subscribe((data) => {
    this.userData = data;
    });
  }
  saveNewAvatar(avatarImg:any){
    this.dummyProfile = avatarImg;
    this.chosedAvatar = true;
  }
  async saveNewInfos(route:string){
    this.loginUser.emit(this.dummyProfile);
    if (this.userData) {
      // await this.authService.updateUserProfile(this.userData.uid, this.dummyProfile)
      // .then(() => {
      //   // this.goTo(route);
        
      //   });
    } else {
      console.error('User-ID fehlt, konnte Avatar nicht speichern.');
    }
  }
  goTo(route:string){
   this.router.navigateByUrl(route);
  }
}
