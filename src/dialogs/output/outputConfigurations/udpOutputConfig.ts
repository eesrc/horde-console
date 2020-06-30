import { bindable, bindingMode } from "aurelia-framework";
import { Output } from "Models/Output";

export class UdpOutputConfig {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) output: Output;
}
