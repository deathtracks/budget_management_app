import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import Base64 from 'crypto-js/enc-base64';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServeurResponse } from 'src/app/class/ServeurResponse/serveur-response';
import { User } from 'src/app/class/user/user';
import { environment } from 'src/environments/environment';
import { ExpenseService } from '../expense/expense.service';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedUser : User;
  public userAsSubject : Subject<User> = new Subject<User>();

  constructor(private http : HttpClient,
    private UserService : UserService,
    private ExpenseService : ExpenseService) { }


  public login(email : string, password : string) : Observable<User | Error> {
    return this.http.post<ServeurResponse>(
      environment.baseUrl.base+environment.baseUrl.auth+`/login`,
      {'email':email,'password' : this.getCryptedPass(password)}
    ).pipe(
      map(value =>{
        if(value.status==='success'){
          this.loggedUser = this.UserService.jsonToObjectConvert(value.result.user);
          this.updateUser();
          localStorage.setItem('access_token',value.result.token);
          this.ExpenseService.fetchForDependance(this.loggedUser.getId());
          return this.loggedUser;
        } else {
          return new Error(value.result);
        }
      })
    )
  }

  public logout(id : number) : Observable<boolean | Error>{
    return this.http.post<ServeurResponse>(
      environment.baseUrl.base+environment.baseUrl.auth+`/logout`,
      {'idUser':id}
    ).pipe(
      map(value =>{
        if(value.status==='success'){
          localStorage.removeItem('access_token');
          this.loggedUser = null;
          this.updateUser();
          return true;
        } else {
          return new Error(value.result);
        }
      })
    )
  }

  public signin(user : User,pass : string) : Observable<User | Error>{
    let body = this.UserService.objectToJsonConvert(user);
    body.password = this.getCryptedPass(pass);
    console.log(body);
    return this.http.post<ServeurResponse>(
      environment.baseUrl.base+environment.baseUrl.auth+`/signin`,
      body
    ).pipe(
      map(value =>{
        if(value.status==='success'){
          user.setId(value.result);
          return user;
        } else {
          return new Error(value.result);
        }
      })
    )
  }

  public getUser() : void {
    this.updateUser();
  }

  public getId() : number {
    if(this.loggedUser){
      return this.loggedUser.getId();
    } else {
      return null
    }
  }

  public isLogged() : boolean {
    return this.loggedUser!=undefined;
  }


  private updateUser(){
    this.userAsSubject.next(this.loggedUser);
  }

  private getCryptedPass(pass : string) : string {
    let hash = CryptoJS.SHA256(pass);
    let cryptedPassword = Base64.stringify(hash)
    return cryptedPassword;
  }
}