import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Chat } from '../../../modules/chat';
import { UserData } from '../../../modules/user';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChatService } from '../../chat.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth.service';
import { Member } from '../../../modules/member';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, OnDestroy, OnChanges{
  router = inject(Router);
  fb = inject(FormBuilder);
  messageIdx:number = 0;
  @Input() userChats:Chat[]=[];
  @Input() currentChat:Chat|null = null;
  @Input() currentChatId:number = 0;
  private chatSubscription!: Subscription;
  @Input() userData:UserData|null = null;
  @Output() newChatPartner = new EventEmitter<number>();
  sendMessageForm = this.fb.nonNullable.group({
      message:['', Validators.required],
    })
  editMessageForm= this.fb.nonNullable.group({
      message:['', Validators.required],
    })
  previousChatData: any = null;
  constructor(private chatService:ChatService,private cdr: ChangeDetectorRef, private authService:AuthService) {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentChatId']) {
      this.openChat(this.currentChatId);
    }
  }
  ngOnInit() {
    this.loadLiveUserData();
    this.openChat(this.currentChatId);
  }
  ngOnDestroy() {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe(); // Memory Leak verhindern
    }
  }
  openUserDetails(idx:number){
  this.newChatPartner.emit(idx)
  }
  startEditMessage(id:number){
    this.messageIdx= id;
    if(this.currentChat){
      const msg = this.currentChat.chatData.messages[id];
      msg.editing = true;
    }
  }
  closeEditMessage(id:number){
    if(this.currentChat){
      const msg = this.currentChat.chatData.messages[id];
      msg.editing = false;
    }
  }
  editMessage(id:number){
    const rawForm = this.editMessageForm.getRawValue();
    if(this.currentChat && rawForm.message !=""){
      this.chatService.editPrivateMessage(this.currentChat.chatId, rawForm.message, id);
    }
  }
  sendPrivateMessage(){
      const rawForm = this.sendMessageForm.getRawValue();
      if(this.currentChat){
        this.chatService.sendPrivateMessage(rawForm.message, this.currentChat.chatId);
      }
  }
  loadLiveUserData(){
    this.authService.userData$.subscribe((data) => {
      this.userData = data;
      if(this.userData == null){
        this.router.navigateByUrl('');
      }
    });
  }
  async openChat(idx:number){
      this.currentChat = null;
      await this.chatService.getChatLiveUpdates(this.userChats[idx].chatId);
      this.chatService.currentChat$.subscribe(async (data) => {
      if (!data) {this.currentChat = null ; return;}
      const messagesWithUserData = data.messages ? await this.chatService.loadMessages(data.messages): [];
      const membersWithUserData = data.members ? await this.chatService.loadMembers(data.members):[];
      const chatpartner = await this.showChatPartner(membersWithUserData);
      if(chatpartner!=null){
      this.currentChat={
            chatId:this.userChats[idx].chatId,
            chatData:{
              createdAt:data.createdAt,
              members: membersWithUserData,
              messages: messagesWithUserData,
            },
            chatPartner:{
              uid:chatpartner.uid,
              name:chatpartner.name,
              email:chatpartner.email,
              fotolink:chatpartner.fotolink,
            } 
          };
        }
      })
  }
  async showChatPartner(members:Member[]){
    for(let i = 0; i < members.length; i++){
      if(members[i].uid !== this.userData?.uid){
        console.log(members[i])
        return members[i];
      }
    }return ;
  }

}
