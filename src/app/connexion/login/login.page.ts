import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/service/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public email : string;
  public password :string;
  public error = false;

  constructor(private auth : AuthService,
    private router : NavController) { }

  ngOnInit() {
  }

  onLogin(){
    this.auth.login(this.email,this.password)
    .subscribe(value =>{
      if(value instanceof Error){
        this.error = true;
        this.email = "";
        this.password = "";
      } else {
        this.error = false;
        this.router.navigateRoot('/home');
      }
    })
  }

}
