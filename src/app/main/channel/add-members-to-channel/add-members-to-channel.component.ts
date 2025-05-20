import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../../../modules/channel';
import { ChatService } from '../../../chat.service';
import { UserService } from '../../../user.service';

@Component({
  selector: 'app-add-members-to-channel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-members-to-channel.component.html',
  styleUrl: './add-members-to-channel.component.scss'
})
export class AddMembersToChannelComponent {
  searchResultsValue:any[]=[];
  searchResults:any[]=[];
  search="";
  selectedUser="";
  addMemberData = {name:""};
  results:any;
  userNameOrEmail:string="";
  @Input() currentChannel:Channel|null=null;
  @Output() closeDialogEvent = new EventEmitter<void>();
  
  constructor(private chatService:ChatService, private userService:UserService){}

  addMembersToChannel(){
    this.userNameOrEmail = this.addMemberData.name.trim();
    if (!this.userNameOrEmail) return; 
    if (this.userNameOrEmail.startsWith("@")) {
      this.userNameOrEmail = this.userNameOrEmail.substring(1);
    }if (this.search == "email") {
      const foundUser = this.searchResultsValue.find(user => user.email == this.userNameOrEmail);
      if (foundUser) {
        this.userNameOrEmail = foundUser.name; 
      } else {return}
    }
    this.saveName(this.userNameOrEmail);
    if(this.currentChannel ){
      this.chatService.addMembersToChannel(this.currentChannel.name, this.userNameOrEmail);
    }
    this.closeDialog();
  }

  closeDialog(){
    this.closeDialogEvent.emit();
  }

  setupSearchListener(value: string) {
    if (!value || value.length < 2) {
      this.searchResultsValue = [];
      this.searchResults = [];
      this.addMemberData.name="";
      return;
    }
    const firstChar = value.charAt(0);
    if (firstChar == "@") {
      this.searchUser(value);
    } else if (/[a-zA-Z]/.test(firstChar)) {
      this.searchMail(value);
    } else {
      this.searchNotAvailable();
    }
  }

  searchNotAvailable(){
    this.searchResultsValue = [];
    this.searchResults = [];
    this.addMemberData.name="";
  }

  searchMail(value: string){
    this.searchResultsValue = this.userService.searchUsersWithMail(value);
    let memberNames = this.currentChannel?.members.map(member => member.name) || [];
    this.searchResults = this.searchResultsValue.filter(user => !memberNames.includes(user.name));
    this.search = "email";
  }

  searchUser(value: string){
    this.searchResultsValue = this.userService.searchUsers(value.substring(1));
    let memberNames = this.currentChannel?.members.map(member => member.name) || [];
    this.searchResults = this.searchResultsValue.filter(user => !memberNames.includes(user.name));
    this.search = "name";
  }

  saveName(item: string){
    this.selectedUser = item;
    this.addMemberData.name = item; 
  }
}
