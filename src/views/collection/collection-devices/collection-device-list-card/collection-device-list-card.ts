import { bindable, containerless } from "aurelia-framework";
import { Collection } from "Models/Collection";
import { Device } from "Models/Device";

@containerless
export class CollectionDeviceListCard {
  @bindable devices: Device[] = [];
  @bindable collection: Collection;
  @bindable deleteCallback;
  @bindable createCallback;

  filteredDevices: Device[] = [];

  createDevice() {
    this.createCallback();
  }

  deleteDevice(device: Device) {
    this.deleteCallback({
      device: device,
    });
  }

  filteredDevicesCallback(filteredDevices: Device[]) {
    this.filteredDevices = filteredDevices;
  }
}
