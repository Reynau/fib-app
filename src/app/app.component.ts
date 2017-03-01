import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import {StatusBar, Splashscreen, SQLite} from 'ionic-native';

import { Page1 } from '../pages/page1/page1';
import { Page2 } from '../pages/page2/page2';
import {LoginPage} from "../pages/login/login";


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LoginPage;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Page One', component: Page1 },
      { title: 'Page Two', component: Page2 }
    ];

  }

  initializeApp() {
    let _self = this;
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      _self.createTables();
      Splashscreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  private createTables() {
    let db = new SQLite();
    db.openDatabase({
      name: "fib_data.db",
      location: "default"
    }).then(() => {
      db.executeSql("CREATE TABLE IF NOT EXISTS tokens (id INTEGER PRIMARY KEY AUTOINCREMENT, token TEXT, refresh TEXT)", {})
        .then((data) => {
          console.log("TABLE CREATED: ", data);
        }, (error) => {
          console.error("Unable to execute sql", error);
        })
    }, (error) => {
      console.error("Unable to open database", error);
    });
  }
}
