import { autoinject, bindable } from "aurelia-framework";
import { Device } from "Models/Device";

@autoinject
export class CollectionDeviceList {
  @bindable devices: Device[] = [];
  @bindable deleteCallback;

  deleteDevice(device: Device) {
    this.deleteCallback({
      device: device,
    });
  }
}
