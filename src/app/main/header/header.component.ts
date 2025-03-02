import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { AuthService} from '../../auth.service';
import { Router } from '@angular/router';
import { UserData } from '../../../modules/user';
import { UserService } from '../../user.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Chat } from '../../../modules/chat';
import { ChatService } from '../../chat.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  router = inject(Router);
  userData: UserData | null = null;
  toggleMenuIsOpen:boolean = false;
  suggestions: string[] = [];
  // showSuggestions = false;
  input = new FormControl('');
  searchResultsValue: any[]=[]; 
  searchResults:string[]=[];
  search:string="";
  // userChats:any=[] 
  @Input() userChats:Chat[] = [];
  @Output() openChat = new EventEmitter<number>();
  @Output() oChannel = new EventEmitter<string>();
  constructor(private authService: AuthService, private userService: UserService,private chatService: ChatService) {
    this.setupSearchListener();
  }

  private setupSearchListener() {
    this.input.valueChanges
      .pipe(
        debounceTime(300), // Warte 300ms nach jeder Eingabe (vermeidet zu viele Suchanfragen)
        distinctUntilChanged() // Verhindert doppelte Suchanfragen für dieselbe Eingabe
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
          this.searchResultsValue = this.userService.searchUsers(value.substring(1)); // Suche nach Usernamen
          for(let i=0; i<this.searchResultsValue.length; i++){
            this.searchResults.push(this.searchResultsValue[i].name);
            this.search="name"
          }
          // Suche nach Channels
        } else if (firstChar === "#") {
          this.search="channel"
          if(this.userData){
            this.searchResults = (this.userData.channels || [])
            .filter((channel: string) => 
            channel.toLowerCase().includes(value.substring(1).toLowerCase()));
          // console.log("result:", this.searchResults)
            
          }
          //suche mit Mail
        } else if (/[a-zA-Z]/.test(firstChar)) {
          this.searchResultsValue = this.userService.searchUsersWithMail(value); 
          this.searchResults=[];
          for(let i=0; i<this.searchResultsValue.length; i++){
            this.searchResults.push(this.searchResultsValue[i].email);
            this.search="email"
          }
        } else {
          this.searchResultsValue = []; 
          this.searchResults=[] 
        }
      });
  }
  selectChat(user: string) {
    this.input.setValue(user); // Wähle einen Benutzer aus
    this.searchResults = []; // Leere die Vorschläge
  }
  async goToPersonalMessages(uid:string){
    if(this.userData && this.userChats.length<=0){
      console.log("uid: ",uid)
      const messagesWMembers = await this.chatService.createChat(this.userData?.uid, uid )
    } await this.loadUserChats();
        for (let i = 0; i < this.userChats.length; i++) {
          if (this.userChats[i].chatPartner.uid == uid) {
            this.openChat.emit(i);
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
    }
  }
  ngOnInit(): void {
    this.authService.userData$.subscribe((data) => {
      this.userData = data;
      if(this.userData == null){
          this.router.navigateByUrl('');
      }
    });
  }
  toggleMenu(){
    this.toggleMenuIsOpen = !this.toggleMenuIsOpen;

  }
  logout(){
    this.authService.logout();
    // this.router.navigateByUrl('');
  }
}
