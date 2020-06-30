import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { autoinject, bindable, containerless } from "aurelia-framework";
import { Device, DeviceCOAPMessage, DeviceDataMessage, DeviceUDPMessage } from "Models/Device";

@autoinject
@containerless
export class DeviceDataCard {
  @bindable device: Device;
  @bindable decodeBase64: boolean = false;
  @bindable deviceMessages: DeviceDataMessage[] = [];

  filteredDeviceMessages: DeviceDataMessage[] = [];
  subscriptions: Subscription[] = [];
  selectedDecodeAction: string = "none";

  constructor(private eventAggregator: EventAggregator) {}

  filteredDeviceMessagesCallback(filteredDevices: any[]) {
    this.filteredDeviceMessages = filteredDevices;
  }

  bind() {
    this.subscriptions.push(
      this.eventAggregator.subscribe("deviceMessage", (deviceData: DeviceDataMessage) => {
        if (deviceData.device.deviceId === this.device.id) {
          this.addDeviceMessage(deviceData);
        }
      }),
    );
  }

  unbind() {
    this.subscriptions.forEach((sub) => sub.dispose());
    this.subscriptions = [];
  }

  getTransportMeta(deviceMessage: DeviceUDPMessage | DeviceCOAPMessage): string {
    if (deviceMessage.transport === "udp") {
      return `${deviceMessage.udpMetaData?.remotePort}`;
    } else if (deviceMessage.transport === "coap-push") {
      return `${deviceMessage.coapMetaData?.code}(${deviceMessage.coapMetaData?.path})`;
    } else {
      return "";
    }
  }

  private addDeviceMessage(deviceData: DeviceDataMessage) {
    this.deviceMessages.unshift(deviceData);
  }
}
