import { bindable } from "aurelia-framework";
import { TnCustomComponent } from "Components/TnCustomComponent";

export class TnBreadcrumbItem extends TnCustomComponent {
  @bindable route: string = "";
  @bindable params: object = {};
  @bindable title: string = "Unnamed";
}
