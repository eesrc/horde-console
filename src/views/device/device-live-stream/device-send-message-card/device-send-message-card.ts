import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, bindable, containerless } from "aurelia-framework";
import { Device, DownstreamMessage } from "Models/Device";
import { BadRequestError, ConflictError, DeviceService } from "Services/DeviceService";

import { LogBuilder } from "Helpers/LogBuilder";
const Log = LogBuilder.create("Device stream card");

const DEFAULT_PORT: number = 1234;

@containerless
@autoinject
export class DeviceSendMessageCard {
  @bindable device: Device;

  @bindable deviceMessage: string = "";
  @bindable deviceMessagePort: number = DEFAULT_PORT;
  @bindable deviceMessageEncodeBase64: boolean = false;
  @bindable deviceCoapPath: string = "/";

  @bindable messageType: "UDP" | "COAP" = "UDP";

  loading: boolean = false;

  constructor(private eventAggregator: EventAggregator, private deviceService: DeviceService) {}

  sendMessage() {
    this.loading = true;
    this.deviceService
      .sendMessageToDevice(this.prepareMessage(), this.device)
      .then(() => {
        this.eventAggregator.publish("global:message", {
          body: `Message successfully sent`,
        });
        this.eventAggregator.publish(
          "device-live-stream:downstream-message",
          this.prepareMessage(),
        );
        this.deviceMessage = "";

        this.loading = false;
      })
      .catch((err) => {
        if (err instanceof BadRequestError) {
          this.eventAggregator.publish("global:message", {
            body: `Bad request: ${err.content.message}`,
          });
        } else if (err instanceof ConflictError) {
          this.eventAggregator.publish("global:message", {
            body: `Conflict error: ${err.content.message}`,
          });
        } else {
          Log.error("Error when sending message", err);
        }
        this.loading = false;
      });
  }

  private prepareMessage(): DownstreamMessage {
    const payload = this.deviceMessageEncodeBase64
      ? window.btoa(this.deviceMessage)
      : this.deviceMessage;

    return this.messageType === "UDP"
      ? {
          payload: payload,
          transport: "udp",
          port: this.deviceMessagePort,
        }
      : {
          payload: payload,
          transport: "coap-push",
          port: this.deviceMessagePort,
          coapPath: this.deviceCoapPath,
        };
  }
}
