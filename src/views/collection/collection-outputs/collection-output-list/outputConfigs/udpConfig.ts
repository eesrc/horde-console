import { bindable } from "aurelia-framework";
import { Output } from "Models/Output";

export class UdpConfig {
  @bindable output: Output;
}
