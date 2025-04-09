import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserData } from '../../../../modules/user';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth.service';
import { UserService } from '../../../user.service';

@Component({
  selector: 'app-member-details',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './member-details.component.html',
  styleUrl: './member-details.component.scss'
})
export class MemberDetailsComponent {
  profiles = [
    "./assets/img/Elias.png",
    "./assets/img/Elise.png",
    "./assets/img/Frederik.png",
    "./assets/img/Noah.png",
    "./assets/img/Sofia.png",
    "./assets/img/Steffen.png",
  ];
  chooseFotolink:boolean=false;
  chosedAvatar:boolean=false;
  @Input() profileDetails:boolean=false;
  @Input() editUserData:boolean=false;
  @Input() userData: UserData|null=null;
  @Output() closeDetailsEvent = new EventEmitter<void>();
  @Output() editDataEvent = new EventEmitter<void>();
  @Output() changedUserDataEvent = new EventEmitter<void>();
  changeData ={
    name:""
  }
  newFotolink:string="";

  constructor(private authService:AuthService, private userService:UserService){}

  closeUserDetails(){
    this.closeDetailsEvent.emit();
  }

  toggleEditProfile(){
    this.editDataEvent.emit();
    this.editUserData =!this.editUserData;
  }

  saveNewName(){
    if(this.userData){
      this.userService.updateUserName(this.userData.uid, this.changeData.name)
      this.changedUserDataEvent.emit();
    }
  }

  startChangeFotolink(){
    this.chooseFotolink = !this.chooseFotolink;
  }

  changeFotolink(){
    if(this.userData){
      this.userService.updateUserProfile(this.userData.uid, this.newFotolink)
    }
  }

  saveNewLink(link:string){
    this.newFotolink = link;
  }

}
