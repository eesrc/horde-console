import { bindable } from "aurelia-framework";
import { Output } from "Models/Output";

export class MqttConfig {
  @bindable output: Output;
}
