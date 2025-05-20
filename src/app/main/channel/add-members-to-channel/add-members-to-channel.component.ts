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
  addMemberData="";
  selectedUser=false;
  results:any;
  user:any="";
  @Input() currentChannel:Channel|null=null;
  @Output() closeDialogEvent = new EventEmitter<void>();
  
  constructor(private chatService:ChatService, private userService:UserService){}

  addMembersToChannel(){
    this.addMemberData
    if (!this.addMemberData.trim()) return; 
    if (this.addMemberData.trim().startsWith("@")) {
      this.addMemberData = this.addMemberData.substring(1);
    }
      this.user = this.searchResults.find(user => user.name == this.addMemberData);
    if(this.currentChannel &&this.user!=="" ){
      this.chatService.addMembersToChannel(this.currentChannel.name, this.user.name);
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
      this.addMemberData="";
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
    this.addMemberData="";
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
    this.addMemberData = item; 
    this.selectedUser=true;
  }
}
