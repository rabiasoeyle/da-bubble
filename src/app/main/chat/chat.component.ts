import { AfterViewChecked, Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { Chat } from '../../../modules/chat';
import { UserData } from '../../../modules/user';
import { Router } from '@angular/router';
import { FormsModule} from '@angular/forms';
import { ChatService } from '../../chat.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth.service';
import { Member } from '../../../modules/member';
import { PickerModule } from '@ctrl/ngx-emoji-mart';


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [PickerModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy, OnChanges {
  router = inject(Router);
  messageIdx:number = 0;
  private chatSubscription!: Subscription;
  newMessage={
    message:"",
  }
  editMessageData={
    message:""
  }
  emojisOpenInEditM:boolean=false;
  emojisOpenForReaction:boolean=false;
  currentMessageId:number|null=null;
  markCorrespond:boolean=false;
  previousChatData: any = null;
  emojisOpen:boolean = false;
  scrolledDown:boolean=false;
  previousMessageCount = 0;
  @Input() userChats:Chat[]=[];
  @Input() currentChat:Chat|null = null;
  @Input() currentChatId:number = 999;
  @Input() userData:UserData|null = null;
  @Output() newChatPartner = new EventEmitter<number>();
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;
  

  constructor(private chatService:ChatService, private authService:AuthService) {
  }
  
  
  ngAfterViewChecked(): void {
    const currentCount = this.currentChat?.chatData.messages.length|| 0;
    if (currentCount > this.previousMessageCount) {
      this.scrollToBottom();
      this.previousMessageCount = currentCount;
    }
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { 
      console.warn('Scroll failed', err);
    }
  }
  

  toggleEmojisForReaction(idx:number){
    this.emojisOpenForReaction=!this.emojisOpenForReaction;
    this.currentMessageId=idx;
  }

  removeReaction(reactionIdx:number, messageIdx:number){
    if(this.currentChat && this.userData){
      this.chatService.removeEmojiReactionChat(this.currentChat?.chatId, messageIdx, reactionIdx, this.userData?.uid)
    } 
  }
  
  addEmojiReaction(event:any, idx:number){
    if(this.currentChat && this.userData){
      this.chatService.addEmojiReactionChat(this.currentChat?.chatId, event.emoji.native, idx, this.userData?.uid);
      this.emojisOpenForReaction=false;
    }
  }

  addEmojiOnEditMessage(event:any){
    this.editMessageData.message += event.emoji.native;
  }
  
  toggleEmojisOnEditM(){
    this.emojisOpenInEditM=!this.emojisOpenInEditM;
    this.emojisOpen=false;
    this.markCorrespond=false;
  }
  
  isSameDay(timestamp1: number, timestamp2: number): boolean {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  formatDate(timestamp: number): string {
      return new Date(timestamp).toLocaleDateString("de-DE", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentChatId']) {
      this.openChat(this.currentChatId);
      console.log("chat-c",this.currentChatId)
      setTimeout(() => {
        this.messageInput?.nativeElement.focus();
      }, 500);
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
      this.editMessageData.message=msg.message;
      msg.editing = true;
      this.emojisOpen=false;
      this.markCorrespond=false;
    }
  }

  closeEditMessage(id:number){
    if(this.currentChat){
      const msg = this.currentChat.chatData.messages[id];
      msg.editing = false;
      this.emojisOpenInEditM=false;
      this.emojisOpen=false;
      this.markCorrespond=false;
    }
  }

  editMessage(id:number){
    if(this.currentChat && this.editMessageData.message !=""){
      this.chatService.editPrivateMessage(this.currentChat.chatId, this.editMessageData.message, id);
    }
  }

  sendPrivateMessage(){
      if(this.currentChat && this.newMessage.message !=""){
        this.chatService.sendPrivateMessage(this.newMessage.message, this.currentChat.chatId);
        this.newMessage.message ="";
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
              presenceStatus:chatpartner.presenceStatus,
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
    }return
  }

  showEmojis(){
    this.emojisOpen = !this.emojisOpen;
    this.markCorrespond = false;
  }

  addEmoji(event: any) {
    this.newMessage.message += event.emoji.native;
  }

  showMarkableCorrespond(){
    this.markCorrespond=!this.markCorrespond;
    this.emojisOpen = false;
  }

  markPerson(){
    if(this.currentChat){
      this.newMessage.message += "@" + this.currentChat.chatPartner.name;
      this.markCorrespond=false;
    }
  }

}
