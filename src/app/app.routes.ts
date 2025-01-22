import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { LoginComponent } from './login/login.component';
import { ImprintComponent } from './imprint/imprint.component';
import { DsgvoComponent } from './dsgvo/dsgvo.component';
import { DialogSendEmailPwComponent } from './login/dialog-send-email-pw/dialog-send-email-pw.component';
import { DialogChangePasswordComponent } from './login/dialog-change-password/dialog-change-password.component';

export const routes: Routes = [
    {path:'', component: LoginComponent},
    {path:'main', component: MainComponent},
    {path:'changePassword', component: DialogChangePasswordComponent},
    {path:'datasafety', component: DsgvoComponent},
    {path:'imprint', component: ImprintComponent}
];
