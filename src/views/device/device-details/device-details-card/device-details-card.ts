import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { autoinject, bindable, containerless } from "aurelia-framework";
import { Device, DeviceDataMessage } from "Models/Device";

type deviceCallback = ({ device: Device }) => void;

@containerless
@autoinject
export class DeviceDetailsCard {
  @bindable device: Device;

  @bindable deleteCallback: deviceCallback;
  @bindable editCallback: deviceCallback;

  subscriptions: Subscription[] = [];

  constructor(private eventAggregator: EventAggregator) {}

  editDevice() {
    this.editCallback({
      device: this.device,
    });
  }

  deleteDevice() {
    this.deleteCallback({
      device: this.device,
    });
  }

  bind() {
    this.subscriptions.push(
      this.eventAggregator.subscribe("deviceMessage", (deviceData: DeviceDataMessage) => {
        if (deviceData.device.deviceId === this.device.id) {
          this.device.tags["radius-allocated-at"] = deviceData.device.tags["radius-allocated-at"];
          this.device.tags["radius-ip-address"] = deviceData.device.tags["radius-ip-address"];
        }
      }),
    );
  }

  unbind() {
    this.subscriptions.map((sub) => sub.dispose());
    this.subscriptions = [];
  }
}
