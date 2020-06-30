import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { autoinject, bindable, containerless } from "aurelia-framework";
import {
  Device,
  DeviceCOAPMessage,
  DeviceDataMessage,
  DeviceUDPMessage,
  DownstreamMessage,
} from "Models/Device";

interface DeviceUDPStreamData extends DeviceUDPMessage {
  direction: "downstream" | "upstream";
}

interface DeviceCOAPStreamData extends DeviceCOAPMessage {
  direction: "downstream" | "upstream";
}

@containerless
@autoinject
export class DeviceStreamCard {
  @bindable device: Device;

  websocketData: Array<DeviceCOAPStreamData | DeviceUDPStreamData> = [];
  filteredWebsocketData: any[] = [];

  subscriptions: Subscription[] = [];

  constructor(private eventAggregator: EventAggregator) {}

  filteredWebsocketDataCallback(filteredWebsocketData) {
    this.filteredWebsocketData = filteredWebsocketData;
  }

  bind() {
    this.eventAggregator.subscribe("deviceMessage", (deviceMessage: DeviceDataMessage) => {
      if (this.device.id === deviceMessage.device.deviceId) {
        this.websocketData.unshift({ ...deviceMessage, direction: "upstream" });
      }
    });

    this.eventAggregator.subscribe(
      "device-live-stream:downstream-message",
      (deviceMessage: DownstreamMessage) => {
        this.websocketData.unshift(
          deviceMessage.transport === "udp"
            ? {
                direction: "downstream",
                type: "data",
                device: Device.toDto(this.device),
                payload: deviceMessage.payload,
                received: new Date().getTime(),
                transport: deviceMessage.transport,
                udpMetaData: {
                  localPort: 0,
                  remotePort: deviceMessage.port,
                },
              }
            : {
                direction: "downstream",
                type: "data",
                device: Device.toDto(this.device),
                payload: deviceMessage.payload,
                received: new Date().getTime(),
                transport: deviceMessage.transport,
                coapMetaData: {
                  code: "POST",
                  path: deviceMessage.coapPath,
                },
              },
        );
      },
    );
  }

  unbind() {
    this.subscriptions.forEach((sub) => {
      sub.dispose();
    });
    this.subscriptions = [];
  }
}
