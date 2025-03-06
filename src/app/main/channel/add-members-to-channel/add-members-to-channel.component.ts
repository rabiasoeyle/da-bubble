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
  @Input() currentChannel:Channel|null=null;
  searchResultsValue:any[]=[];
  searchResults:string[]=[];
  search="";
  selectedUser="";
  addMemberData = {name:""};
  results:any;
  userNameOrEmail:string="";
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
      console.log("neue usermail:", foundUser);
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
  if (firstChar === "@") {
    this.searchResultsValue = this.userService.searchUsers(value.substring(1));
    this.searchResults = this.searchResultsValue.map(user => user.name);
    this.search = "name";
    console.log("@User:", this.searchResults);
  } else if (/[a-zA-Z]/.test(firstChar)) {
    this.searchResultsValue = this.userService.searchUsersWithMail(value);
    this.searchResults = this.searchResultsValue.map(user => user.email);
    this.search = "email";
    console.log("email:", this.searchResults);
  } else {
    this.searchResultsValue = [];
    this.searchResults = [];
    this.addMemberData.name="";
    console.log("no-one:", this.searchResults);
  }
}
saveName(item: string) {
  this.selectedUser = item;
  this.addMemberData.name = item; 
}
}
