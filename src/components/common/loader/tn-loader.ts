import { bindable } from "aurelia-framework";
import { TnCustomComponent } from "Components/TnCustomComponent";

import "./tn-loader.scss";

const LOADER_ANIMATION_TIMEOUT = 750;

export class TnLoader extends TnCustomComponent {
  @bindable loading: boolean = false;
  @bindable contain: boolean | string = false;
  @bindable loadingText: string = "";
  @bindable spinner: boolean | string = false;

  showLoader: boolean = false;

  loadingChanged(loading) {
    if (loading) {
      this.showLoader = true;
    } else {
      setTimeout(() => {
        this.showLoader = false;
      }, LOADER_ANIMATION_TIMEOUT);
    }
  }
}
