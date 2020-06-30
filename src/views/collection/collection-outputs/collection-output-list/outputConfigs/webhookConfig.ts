import { bindable } from "aurelia-framework";
import { Output } from "Models/Output";

export class WebhookConfig {
  @bindable output: Output;
}
