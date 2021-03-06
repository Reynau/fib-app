import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { HTTP } from 'ionic-native';
import { Storage } from '@ionic/storage';

import {Page1} from "../page1/page1";

declare let window: any;

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  private fibAuthUrl = 'https://api.fib.upc.edu/v2/o/authorize/';
  private fibTokenUrl = 'https://api.fib.upc.edu/v2/o/token/';

  private client_id = 'ggsolLClS4uVnQYYNKNJAsMgwNM2jZFDFVe7dUhx';
  private client_secret = 'AeLfrt9bUkCEtAahONM6QA2IZJSBCFXsTZJyGPi2m2BlHMl0g5PVA5oAbcXBMCLPLp6VvVcpanj9256MlyPimVVEtgz4H9pJrcHFWbEny5M4Keims1HlWwsbR6tPemWy';

  private auth_code = null;
  private auth_token = null;
  private auth_refresh_token = null;

  constructor(public navCtrl: NavController,
              private platform: Platform,
              private storage: Storage) {
    let _self = this;
    storage.ready().then(() => {
      storage.get('token').then((token) => this.auth_token = token);
      storage.get('refresh').then((refresh) => this.auth_refresh_token = refresh);
      Promise.all([storage.get('token'), storage.get('refresh')]).then(function () {
        if (_self.auth_token != null && _self.auth_refresh_token != null)
          navCtrl.setRoot(Page1);
      });
    });
  }

  public login () {
    let _self = this;
    this.platform.ready().then(() => {
      this.fibLogin().then(
        authCode => _self.authenticate(authCode),
        error => _self.handleAuthError(error)
      );
    });
  }
  private authenticate(authCode: string) {
    let _self = this;
    this.auth_code = authCode;
    this.fibAuthenticate().then(
      data => {
        let json = JSON.parse(data.data);
        this.storage.set('token', json.access_token);
        this.storage.set('refresh', json.refresh_token);
        this.navCtrl.setRoot(Page1);
      },
      error => _self.handleAuthError(error)
    );
  }

  public fibLogin(): Promise<any> {
    const oauthUrl = this.fibAuthUrl + "?client_id=" + this.client_id + "&response_type=code&state=random_state_string";

    return new Promise(function(resolve, reject) {
      let browserRef = window.cordova.InAppBrowser.open(oauthUrl, '_blank', 'location=yes');
      browserRef.addEventListener("loadstart", (event) => {
        if ((event.url).indexOf("http://localhost/callback") === 0) {
          browserRef.close();
          let responseParameters = ((event.url).split("?")[1]);
          let code = LoginPage.getAuthCode(responseParameters);
          if (code == null)
            reject("Problem authenticating with FIB");
          else
            resolve(code);
        }
      });
      browserRef.addEventListener("loaderror", (error) => {
        reject("The FIB sign in flow was canceled. Error: " + error.message);
        browserRef.close();
      });
    });
  }
  private fibAuthenticate(): Promise<any> {
    let header = {
      "Content-type": "application/x-www-form-urlencoded"
    };
    let body = {
      'grant_type': 'authorization_code',
      'redirect_uri': 'http://localhost/callback',
      'client_id': this.client_id,
      'client_secret': this.client_secret,
      'code': this.auth_code
    };
    return HTTP.post(this.fibTokenUrl, body, header);
  }
  private fibRefreshToken(): Promise<any> {
    let header = {
      "Content-type": "application/x-www-form-urlencoded"
    };
    let body = {
      'client_id': this.client_id,
      'client_secret': this.client_secret,
      'refresh_token': this.auth_refresh_token
    };
    return HTTP.post(this.fibTokenUrl, body, header);
  }

  private handleAuthToken(data: string) {
    alert('Data: ' + data);
  }
  private handleAuthError(error) {
    alert('Error: ' + error);
  }

  private static getAuthCode(params: string): string {
    let responseParameters = params.split("&");
    for (let i = 0; i < responseParameters.length; i++) {
      let urlElem = responseParameters[i].split("=");
      if (urlElem[0] === 'code') return urlElem[1];
    }
    return null;
  }
}
