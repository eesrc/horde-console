import { bindable, bindingMode } from "aurelia-framework";
import { TnCustomComponent } from "Components/TnCustomComponent";

export class TnExpansionPanel extends TnCustomComponent {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) active: boolean;
  @bindable open: boolean | string = false;

  toggle(event: MouseEvent) {
    event.stopPropagation();
    this.active = !this.active;
  }

  bind() {
    if (this.hasProp("open")) {
      this.active = true;
    }
  }
}
