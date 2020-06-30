import { bindable } from "aurelia-framework";
import { TnCustomComponent } from "Components/TnCustomComponent";

export class TnFormError extends TnCustomComponent {
  @bindable formError: string = "";
}
