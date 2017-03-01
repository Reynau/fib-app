import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';
import {DataProvider} from "../../providers/data-provider/data-provider";

@Component({
  selector: 'page-page1',
  templateUrl: 'page1.html'
})
export class Page1 {
  public data = null;

  constructor(public navCtrl: NavController,
              public navParams: NavParams ) {
  }

}
