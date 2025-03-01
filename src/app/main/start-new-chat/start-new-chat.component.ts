import { Component, inject, Input } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UserService } from '../../user.service';
import { UserData } from '../../../modules/user';

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
    searchResults: string[] = []; 
    searchType:string = "";
    @Input() userData:UserData|null ={
        uid: "",
        name: "",
        email: "",
        fotolink:"",
        channels:[],
        chats:[],
      } 
    constructor(private userService: UserService){
      this.setupSearchListener();
    }
    private setupSearchListener() {
      this.input.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        if (!value || value.length < 2) {
          this.searchResults = [];
          return;
        }
        const firstChar = value.charAt(0); // Erstes Zeichen ermitteln
        if (firstChar === "@") {
          this.searchResults = this.userService.searchUsers(value.substring(1)); // Suche nach Usernamen
          this.searchType = "chat";
        } else if (firstChar === "#") {
          if(this.userData){
            this.searchResults = (this.userData.channels || [])
          .filter((channel: string) => 
            channel.toLowerCase().includes(value.substring(1).toLowerCase()));
          console.log("result:", this.searchResults)
          this.searchType="channel"
          }
          // Suche nach Channels
        } else if (/[a-zA-Z]/.test(firstChar)) {
          this.searchResults = this.userService.searchUsersWithMail(value); // Suche nach E-Mail
          this.searchType="chat";
        } else {
          this.searchResults = []; // Keine passenden Ergebnisse
        }
      });
    }

    openChatOrChannel(item:string){
      if(this.searchType=="chat"){
        console.log("chat")
        // finde heraus, ob bereits ein chat mit diesem namen oder der email besteht und sonst erstelle eine neue
      }else if(this.searchType=="channel"){
        console.log("channel")
        // finde heraus an welchen idx der channelname bei this.userData.Channels ist
      }
    }
    sendMessage(){

    }
}
