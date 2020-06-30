import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { autoinject, bindable } from "aurelia-framework";
import { TnCustomComponent } from "Components/TnCustomComponent";

import { create, DataMapperChain } from "@exploratoryengineering/data-mapper-chain";
import { Device, DeviceDataMessage } from "Models/Device";

import { format, parse } from "date-fns";
import "./map-visualization.scss";

interface Marker {
  longitude: string;
  latitude: string;
  altitude: string;
  title?: string;
}

@autoinject
export class MapVisualization extends TnCustomComponent {
  @bindable devices: Device[] = [];
  @bindable messageData: DeviceDataMessage[] = [];
  @bindable dataMapperChain: DataMapperChain;

  @bindable bleed: string | boolean = false;

  toFloatMapper: DataMapperChain = create().hexToFloat();
  subscriptions: Subscription[] = [];

  mapMarkers: Marker[] = [];

  constructor(private eventAggregator: EventAggregator) {
    super();
  }

  bind() {
    this.generateMapMarkers();
    this.subscriptions.push(
      this.eventAggregator.subscribe("deviceMessage", () => {
        this.generateMapMarkers();
      }),
    );
  }

  messageDataChanged() {
    this.generateMapMarkers();
  }

  private generateMapMarkers() {
    this.mapMarkers = [];

    this.mapMarkers = this.messageData.reduce((acc, deviceData) => {
      const decodedData = this.dataMapperChain.mapData(deviceData.payload).toString();
      if (decodedData.length === 24) {
        const longitude =
          (this.toFloatMapper.mapData(decodedData.substr(0, 8)) as number) * (180 / Math.PI);
        const latitude =
          (this.toFloatMapper.mapData(decodedData.substr(8, 8)) as number) * (180 / Math.PI);
        const altitude = this.toFloatMapper.mapData(decodedData.substr(16, 8));

        if (longitude > 0.000001 && latitude > 0.000001) {
          acc.push({
            longitude,
            latitude,
            altitude,
            title: this.getTitle(deviceData),
          });
        }
      } else {
        const splitData = decodedData.split(" ");

        if (splitData.length >= 2) {
          const longitude = parseFloat(splitData[1]);
          const latitude = parseFloat(splitData[0]);

          if (longitude > 0.000001 && latitude > 0.000001) {
            acc.push({
              longitude,
              latitude,
              altitude: 0,
              title: this.getTitle(deviceData),
            });
          }
        }
      }
      return acc;
    }, []);
  }

  private getTitle(deviceData: DeviceDataMessage): string {
    const foundDevice = this.devices.find((device) => {
      return device.id === deviceData.device.deviceId;
    });

    const received = format(
      parse(deviceData.received.toString(), "T", new Date()),
      "MMM d, yyyy, kk:mm:ss",
    );

    if (foundDevice) {
      return `${foundDevice.tags.name ? foundDevice.tags.name : foundDevice.id}: ${received}`;
    } else {
      return `${deviceData.device.deviceId}: ${received}`;
    }
  }
}
