import { Component, inject } from '@angular/core';
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
  dummyProfile="./assets/img/Profile.png";
  userData: UserData | null = null;
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
  saveNewAvatar(avatarImg:any){
    this.dummyProfile = avatarImg;
    if (this.userData) {
      this.authService.updateUserProfile(this.userData.uid, avatarImg)
      .then(() => {});
    } else {
      console.error('User-ID fehlt, konnte Avatar nicht speichern.');
    }

  }

  goTo(route:string){
    this.router.navigateByUrl(route);
  }
}
