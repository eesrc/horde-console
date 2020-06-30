import { bindable } from "aurelia-framework";
import { Output } from "Models/Output";

export class IftttConfig {
  @bindable output: Output;
}
