import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { UserService } from '../../user.service';
import { UserData } from '../../../modules/user';
import { ChatService } from '../../chat.service';
import { Chat } from '../../../modules/chat';

@Component({
  selector: 'app-start-new-chat',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './start-new-chat.component.html',
  styleUrl: './start-new-chat.component.scss'
})
export class StartNewChatComponent {
    fb = inject(FormBuilder);
    newMessage={
      message:"",
    }
    // newAdress={
    //   adress:"",
    // }
    adress: string = '';
    searchResults: string[] = [];
    search: string = '';
    savedAdress:string="";
    // input = new FormControl('');
    searchResultsValue: any[]=[]; 
    savedUid:string = "";
    @Input() userData:UserData|null ={
        uid: "",
        name: "",
        email: "",
        fotolink:"",
        channels:[],
        chats:[],
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
  
    handleSearch(value: string) {
      if (!value || value.length < 2) {
        this.searchResults = [];
        this.searchResultsValue =[];
        return;
      }
      const firstChar = value.charAt(0);
      if (firstChar === "@") {
        this.searchResultsValue = this.userService.searchUsers(value.substring(1));
        this.searchResults = this.searchResultsValue.map(u => u.name);
        this.search = "name";
  
      } else if (firstChar === "#") {
        this.search = "channel";
        if (this.userData) {
          this.searchResults = (this.userData.channels || []).filter((channel: string) =>
            channel.toLowerCase().includes(value.substring(1).toLowerCase())
          );
        }
      } else if (/[a-zA-Z]/.test(firstChar)) {
        this.searchResultsValue = this.userService.searchUsersWithMail(value);
        this.searchResults = this.searchResultsValue.map(u => u.email);
        this.search = "email";
      } else{
        this.searchResults = [];
        this.searchResultsValue =[];
      }
    }
    async saveName(item: string) {
      if (this.search === "name" || this.search === "email") {
        await this.loadUserChats();
        for (let i = 0; i < this.userChats.length; i++) {
          if (this.userChats[i].chatPartner.uid === item) {
            this.savedAdress = this.userChats[i].chatPartner.name;
            this.savedUid = item;
          }
        }
      } else {
        this.savedAdress = item;
        this.savedUid=item
      }
      this.adress = '';
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
    };
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
        console.log(this.newMessage.message+ "an"+item)
        this.newMessage.message="";
      }
    }
    sendMessage(){
      this.openChatOrChannel(this.savedUid);
    }
}
