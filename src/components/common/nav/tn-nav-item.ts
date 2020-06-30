import { bindable } from "aurelia-framework";

export class TnNavItem {
  @bindable title: string = "Unnamed";
  @bindable route: string = "";
  @bindable params: object = {};
  @bindable active: boolean = false;
}
