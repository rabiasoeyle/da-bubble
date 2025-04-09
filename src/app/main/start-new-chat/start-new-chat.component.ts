import { Component, EventEmitter, inject, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { UserService } from '../../user.service';
import { UserData } from '../../../modules/user';
import { ChatService } from '../../chat.service';
import { Chat } from '../../../modules/chat';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-start-new-chat',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule , PickerModule],
  templateUrl: './start-new-chat.component.html',
  styleUrl: './start-new-chat.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class StartNewChatComponent {
    fb = inject(FormBuilder);
    markCorrespond:boolean=false;
    emojisOpen:boolean=false;
    newMessage={message:"",}
    adress: string = '';
    searchResults: string[] = [];
    search: string = '';
    savedAdress:string="";
    searchResultsValue: any[]=[]; 
    savedUid:string = "";
    @Input() userData:UserData|null ={
        uid: "",
        name: "",
        email: "",
        fotolink:"",
        channels:[],
        chats:[],
        presenceStatus:false,
      } 
    userChats:any=[]  
    private searchSubject = new Subject<string>();
    @Output() sendMessageEmitter = new EventEmitter<string>();
    @Output() openChat = new EventEmitter<number>();
    @Output() sendChannelMessageEmitter = new EventEmitter<string>();
    @Output() oChannel = new EventEmitter<string>();
    constructor(private userService: UserService, private chatService: ChatService){
    }
    
    placeholder(){
      return this.savedAdress !== '' ? this.savedAdress : '#Channel, @Name oder die E-Mail Adresse'
    }

    ngOnInit() {
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(value => {
        this.handleSearch(value);
      });
    }
  
    onInputChange(value: string) {
      this.searchSubject.next(value);
    }

    searchAfterName(value:string){
      this.searchResultsValue = this.userService.searchUsers(value.substring(1));
        this.searchResults = this.searchResultsValue.map(u => u.name);
        this.search = "name";
    }

    searchAfterChannel(value:string){
      this.search = "channel";
        if (this.userData) {
          this.searchResults = (this.userData.channels || []).filter((channel: string) =>
            channel.toLowerCase().includes(value.substring(1).toLowerCase())
          );
        }
    }

    searchAfterEmail(value:string){
      this.searchResultsValue = this.userService.searchUsersWithMail(value);
      this.searchResults = this.searchResultsValue.map(u => u.email);
      this.search = "email";
    }

    handleSearch(value: string) {
      if (!value || value.length < 2) {
        this.searchResults = [];
        this.searchResultsValue =[];
        return;}
      const firstChar = value.charAt(0);
      if (firstChar === "@") {
        this.searchAfterName(value);
      } else if (firstChar === "#") {
        this.searchAfterChannel(value)
      } else if (/[a-zA-Z]/.test(firstChar)) {
        this.searchAfterEmail(value);
      } else{
        this.searchResults = [];
        this.searchResultsValue =[];
      }
    }
    
    async saveName(item: string, idx:number) {
      if (this.search === "name" || this.search === "email") {
            this.savedAdress = this.searchResultsValue[idx].name;
            this.savedUid = item;
            this.adress = this.savedAdress;
            this.searchResults = [];
            this.searchResultsValue = [];
        }else {
        this.savedAdress = item;
        this.savedUid=item
          }
      this.adress = this.savedAdress;
      this.searchResults = [];
    }

    async goToPersonalMessages(uid:string){
        if(this.userData && this.userChats<=0){
          const messagesWMembers = await this.chatService.createChat(this.userData?.uid, uid )
        } await this.loadUserChats();
            for (let i = 0; i < this.userChats.length; i++) {
              if (this.userChats[i].chatPartner.uid == uid) {
                this.openChat.emit(i);
                this.sendMessageEmitter.emit(this.newMessage.message)
                this.newMessage.message ="";
              }
            }
    }

    async loadUserChats(){
        this.userChats=[];
        if(this.userData){
          const userChat: Chat[] = await this.chatService.getUserChats(this.userData?.uid);
          if (userChat) {
            this.userChats.push(...userChat);
          }
        }
    }

    openChatOrChannel(item:string){
      if(this.search=="name" || this.search=="email"){
        this.goToPersonalMessages(item);
      }else{
        this.oChannel.emit(item);
        this.sendChannelMessageEmitter.emit(this.newMessage.message);
        this.newMessage.message="";
      }
    }

    sendMessage(){
      this.openChatOrChannel(this.savedUid);
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
      // if(this.currentChat){
      //   this.newMessage.message += "@" + this.currentChat.chatPartner.name;
      //   this.markCorrespond=false;
      // }
    }
}
