import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UserService } from '../../user.service';
import { UserData } from '../../../modules/user';
import { ChatService } from '../../chat.service';
import { Chat } from '../../../modules/chat';

@Component({
  selector: 'app-start-new-chat',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './start-new-chat.component.html',
  styleUrl: './start-new-chat.component.scss'
})
export class StartNewChatComponent {
  fb = inject(FormBuilder);
  sendMessageForm = this.fb.nonNullable.group({
        message:['', Validators.required],
    })
    input = new FormControl('');
    searchResultsValue: any; 
    searchResults:string[]=[];
    searchType:string = "";
    @Input() userData:UserData|null ={
        uid: "",
        name: "",
        email: "",
        fotolink:"",
        channels:[],
        chats:[],
      } 
    userChats:any=[]  
    @Output() openChat = new EventEmitter<number>();
    @Output() openChannel = new EventEmitter<number>();

    constructor(private userService: UserService, private chatService: ChatService){
      this.setupSearchListener();
      // this.loadUserChats();
    }
    async goToPersonalMessages(uid:string){
        if(this.userData){
          console.log("uid: ",uid)
          const messagesWMembers = await this.chatService.createChat(this.userData?.uid, uid )
        } await this.loadUserChats().then(() => {
            for (let i = 0; i < this.userChats.length; i++) {
              if (this.userChats[i].chatPartner.uid == uid) {
                this.openChat.emit(i);
              }
            }
        });
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
    private setupSearchListener() {
      this.input.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        if (!value || value.length < 2) {
          this.searchResultsValue = [];
          this.searchResults=[];
          return;
        }
        const firstChar = value.charAt(0); // Erstes Zeichen ermitteln
        //suche über name
        if (firstChar === "@") {
          this.searchResults = this.userService.searchUsers(value.substring(1)); // Suche nach Usernamen
          this.searchType = "chat";
          // Suche nach Channels
        } else if (firstChar === "#") {
          if(this.userData){
            this.searchResults = (this.userData.channels || [])
          .filter((channel: string) => 
            channel.toLowerCase().includes(value.substring(1).toLowerCase()));
          console.log("result:", this.searchResults)
          this.searchType="channel"
          }
          //suche mit Mail
        } else if (/[a-zA-Z]/.test(firstChar)) {
          this.searchResultsValue = this.userService.searchUsersWithMail(value); 
          this.searchResults=[];
          for(let i=0; i<this.searchResultsValue.length; i++){
            this.searchResults.push(this.searchResultsValue[i].email);
            this.searchType="chat";
          }
          
        } else {
          this.searchResultsValue = []; 
          this.searchResults=[] 
        }
      });
    }

    openChatOrChannel(item:string){
      if(this.searchType=="chat"){
        console.log("chat")
        this.goToPersonalMessages(item);
        // finde heraus, ob bereits ein chat mit diesem namen oder der email besteht und sonst erstelle eine neue
      }else if(this.searchType=="channel"){
        console.log("channel")
        // finde heraus an welchen idx der channelname bei this.userData.Channels ist
      }
    }
    sendMessage(){

    }
}
