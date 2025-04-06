import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Channel } from '../../../modules/channel';
import { ChatService } from '../../chat.service';
import { AuthService } from '../../auth.service';
import { UserData } from '../../../modules/user';
import { Message } from '../../../modules/messages';
import { Member } from '../../../modules/member';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Chat } from '../../../modules/chat';
import { AddMembersToChannelComponent } from './add-members-to-channel/add-members-to-channel.component';
import { UserService } from '../../user.service';
import { MemberlistComponent } from './memberlist/memberlist.component';
import { MemberDetailsComponent } from './member-details/member-details.component';
import { MessagesComponent } from './messages/messages.component';
import { DetailsOfChannelComponent } from './details-of-channel/details-of-channel.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [PickerModule,DetailsOfChannelComponent,MessagesComponent,ReactiveFormsModule,FormsModule, AddMembersToChannelComponent, MemberlistComponent, MemberDetailsComponent],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ChannelComponent implements OnInit, OnChanges{
  userData: UserData |null = null;
  fb = inject(FormBuilder);
  newMessage={
    message:"",
  }
  emojisOpen:boolean=false;
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
  constructor(private chatService:ChatService, private authService:AuthService, private userService:UserService){
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
    return this.currentChannel;
  }
  sendMessage(){
      if(this.currentChannel&& this.newMessage.message){
        this.chatService.sendMessage(this.newMessage.message, this.currentChannel.name);
        this.newMessage.message="";
      }
  }
  openDetailsAboutChannel(){
    this.openDetailsOfChannel = !this.openDetailsOfChannel;
  }
  addMembersToChannelDialog(){
    this.membersOfChannelList=false;
    this.addMemberToChannel =!this.addMemberToChannel;
  }
  openMembersList(){
    this.membersOfChannelList = !this.membersOfChannelList;
  }
  async openUserDetails(idx:number){
    console.log("userDetails:", idx);
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
  deleteChannelAtUser(){
      if(this.currentChannel){
        this.deletedChannelname = this.currentChannel.name;
      }
      this.channelDeleted = true;
      this.currentChannel = null;
      this.chatService.unsubscribeFromChannel();
      setTimeout(()=>{
        this.channelDeleted=false;
      },4000)
  }
  showEmojis(){
    this.emojisOpen = !this.emojisOpen;
  }
  addEmoji(event: any) {
    this.newMessage.message += event.emoji.native;
    console.log(this.newMessage.message)
  }
}
