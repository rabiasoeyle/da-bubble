import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { AuthService} from '../../auth.service';
import { Router } from '@angular/router';
import { UserData } from '../../../modules/user';
import { UserService } from '../../user.service';
import { FormControl, FormsModule} from '@angular/forms';
import { debounceTime, distinctUntilChanged} from 'rxjs/operators';
import { Chat } from '../../../modules/chat';
import { ChatService } from '../../chat.service';
import { MemberDetailsComponent } from './member-details/member-details.component';
import { Channel } from '../../../modules/channel';
import { NgClass } from '@angular/common';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass,FormsModule, MemberDetailsComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  router = inject(Router);
  userData: UserData | null = null;
  toggleMenuIsOpen:boolean = false;
  suggestions: string[] = [];
  input = new FormControl('');
  searchResultsValue: any[]=[]; 
  searchResults:string[]=[];
  search:string="";
  profileDetails:boolean=false;
  editUserData:boolean=false;
  searchSubject = new Subject<string>();
  adress: string = '';
  savedAdress:string="";
  savedUid:string="";
  @Input() userChats:Chat[] = [];
  @Input() startNewChatBoolean:boolean = false;
  @Input()currentChat:Chat|null= null;
  @Input()currentChannel:Channel|null =null;
  @Output() openChat = new EventEmitter<number>();
  @Output() oChannel = new EventEmitter<string>();
  @Output() goBackToDevspace = new EventEmitter<void>();
  
  constructor(private authService: AuthService, private userService: UserService,private chatService: ChatService) {
  }

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.handleSearch(value);
    });
    this.userService.getUserLiveUpdates();
    this.updateUserData();
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
    this.openChatOrChannel(item);
    this.adress = this.savedAdress;
    this.searchResults = [];
  }

  placeholder(){
    return this.savedAdress !== '' ? this.savedAdress : 'Devspace durchsuchen'
  }

  onInputChange(value: string) {
    this.searchSubject.next(value);
  }

  isChatActive(): boolean {
    return this.currentChannel !== null || this.currentChat !== null || this.startNewChatBoolean;
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

  selectChat(user: string) {
    this.input.setValue(user);
    this.searchResults = [];
  }

  async goToPersonalMessages(uid:string){
    if(this.userData && this.userChats.length<=0){
      const messagesWMembers = await this.chatService.createChat(this.userData?.uid, uid )
    } await this.loadUserChats();
        for (let i = 0; i < this.userChats.length; i++) {
          if (this.userChats[i].chatPartner.uid == uid) {
            this.openChat.emit(i);
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
    }
  }

  updateUserData(){
    this.authService.userData$.subscribe((data) => {
      this.userData = data;
      if(this.userData == null){
          this.router.navigateByUrl('');
      }
    })
  }

  toggleMenu(){
    this.toggleMenuIsOpen = !this.toggleMenuIsOpen;
  }

  logout(){
    this.authService.logout();
  }

  detailsOfProfile(){
    this.profileDetails = !this.profileDetails;
  }

  openMyProfile(){
    this.toggleMenu();
    this.detailsOfProfile();
  }

  editProfile(){
    this.editUserData =!this.editUserData;
    this.detailsOfProfile();
  }

  goBackToSidenav(){
    this.currentChannel=null;
    this.currentChat = null;
    this.startNewChatBoolean=false;
    this.goBackToDevspace.emit();
  }
}
