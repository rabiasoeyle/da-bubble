import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Channel } from '../../../modules/channel';
import { ChatService } from '../../chat.service';
import { AuthService } from '../../auth.service';
import { UserData } from '../../../modules/user';
import { Message } from '../../../modules/messages';
import { Member } from '../../../modules/member';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Chat } from '../../../modules/chat';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent implements OnInit, OnChanges{
  userData: UserData |null = null;
  fb = inject(FormBuilder);
  addChannelForm = this.fb.nonNullable.group({
    channelname:['', Validators.required],
    description:['', Validators.required],
  })
sendMessageForm = this.fb.nonNullable.group({
  message:['', Validators.required],
  })
addMemberForm = this.fb.nonNullable.group({
  name:['', Validators.required],
})
changeChannelNameForm = this.fb.nonNullable.group({
  name:['', Validators.required],
})
changeChannelDescrForm =this.fb.nonNullable.group({
  description:['', Validators.required],
})
editMessageForm= this.fb.nonNullable.group({
  message:['', Validators.required],
  })
  @Input()currentChannelName:string = "kein Name";
  openDetailsOfChannel= false;
  editChannel=false;
  addMemberToChannel=false;
  membersOfChannelList=false;
  memberDetails:boolean= false;
  currentProfileDetail:any;
  channelDeleted:boolean=false;
  deletedChannelname:string="";
  currentChannel:Channel | null = null;
  userChats:Chat[]=[];
  @Output() openChat = new EventEmitter<number>();
  constructor(private chatService:ChatService,private cdr: ChangeDetectorRef, private authService:AuthService){
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentChannelName']) {
      this.openChannel(this.currentChannelName);
    }
  }
  ngOnInit() {
    this.loadLiveUserData();
    this.openChannel(this.currentChannelName);
  }
loadLiveUserData(){
  this.authService.userData$.subscribe((data) => {
    this.userData = data;
  });
}
async openChannel(channelName: string) {
  this.chatService.getChannelLiveUpdates(channelName);
  this.chatService.currentChannel.subscribe(async (data) => {
  if (!data) {
    this.currentChannel = null;
    return;
  }
  const messagesWithUserData = data.messages ? await this.chatService.loadMessages(data.messages): [];
  const membersWithUserData = data.members ? await this.chatService.loadMembers(data.members): [];
  const creatorUID: string = data.created.createdFrom; // Einzelne UID aus Firebase
  const creator = await this.authService.getUserInfo(creatorUID);
  const createdAt = data.created.createdAt? (data.created.createdAt.toDate() || new Date(data.created.createdAt)): null; // Timestamp umwandeln
  const formattedDate = this.chatService.formatDate(createdAt);
  this.currentChannel = {
    name: data.name || channelName,
    description: data.description || "Keine Beschreibung verfügbar",
    created: {
      createdFrom: creator['name'],
      createdAt:formattedDate,
    },
    messages: messagesWithUserData,
    members:membersWithUserData,
    membersAmount:data.members.length,
  }});
}

startEditMessage(id:number){
  if(this.currentChannel != null){
    const msg = this.currentChannel.messages[id];
    msg.editing = true;
  }
}
closeEditMessage(id:number){
  if(this.currentChannel!=null){
    const msg = this.currentChannel.messages[id];
    msg.editing = false;
  }
}
editMessage(id:number){
  const rawForm = this.editMessageForm.getRawValue();
  if(this.currentChannel && rawForm.message !=""){
    this.chatService.editMessage(this.currentChannel.name, rawForm.message, id);
  }
}
sendMessage(){
  const rawForm = this.sendMessageForm.getRawValue();
    if(this.currentChannel){
      this.chatService.sendMessage(rawForm.message, this.currentChannel.name);
    }
}
openDetailsAboutChannel(){
  this.openDetailsOfChannel = !this.openDetailsOfChannel;
}
addMembersToChannelDialog(){
  this.membersOfChannelList=false;
    this.addMemberToChannel =!this.addMemberToChannel;
}
addMembersToChannel(channelname:string){
  const rawForm = this.addMemberForm.getRawValue();
    this.chatService.addMembersToChannel(channelname, rawForm.name);
}
openMembersList(){
  this.membersOfChannelList = !this.membersOfChannelList;
}
async openUserDetails(idx:number){
  this.membersOfChannelList = false;
    this.addMemberToChannel = false;
    if(this.memberDetails = true && idx==9999){
      this.memberDetails = false;
      return
    }
    this.currentProfileDetail = await this.authService.getUserInfo(this.currentChannel?.members[idx].uid);
    this.memberDetails = !this.memberDetails;
}
async goToPersonalMessages(){
  if(this.userData){
    const messagesWMembers = await this.chatService.createChat(this.userData?.uid, this.currentProfileDetail.uid )
  } await this.loadUserChats().then(() => {
      for (let i = 0; i < this.userChats.length; i++) {
        if (this.userChats[i].chatPartner.uid == this.currentProfileDetail.uid) {
          this.openChat.emit(i);
        }
      }
  });
  this.memberDetails = false;
}
async loadUserChats(){
  this.userChats = [];
  if(this.userData){
     const userChat: Chat[] = await this.chatService.getUserChats(this.userData?.uid);
     if (userChat) {
      this.userChats.push(...userChat);
    }
  }
}
openEditChannel(){
  this.editChannel = !this.editChannel;
}
deleteChannelAtUser(channelname:string){
  this.chatService.deleteChannelAtMember(channelname);
    if(this.editChannel){
      this.editChannel=false;
    }
    this.openDetailsAboutChannel();
    if(this.currentChannel){
      this.deletedChannelname = this.currentChannel.name;
    }
    this.channelDeleted = true;
    this.currentChannel = null;
    this.chatService.unsubscribeFromChannel();
}
changeChannelName(){
  const rawForm = this.changeChannelNameForm.getRawValue();
    if(this.currentChannel && rawForm.name !=""){
      this.chatService.changeChannelName(this.currentChannel.name, rawForm.name);
      this.chatService.changeChannelNameForUsers(this.currentChannel.name, rawForm.name);
    }
    setTimeout(()=>{
      this.openEditChannel(),this.openChannel(rawForm.name), this.openDetailsAboutChannel()
    },200);
}
changeChannelDescription(){
  const rawForm = this.changeChannelDescrForm.getRawValue();
    if(this.currentChannel && rawForm.description !=""){
    this.chatService.changeChannelDescription(this.currentChannel.name, rawForm.description);
    }
    this.openEditChannel();
}
}
