/*
Copyright 2018 Telenor Digital AS

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { autoinject, bindable, containerless } from "aurelia-framework";
import { LINE_GRAPH_CONFIG } from "Helpers/GraphConfigs";
import { GraphController, GraphData } from "Helpers/GraphController";
import { LogBuilder } from "Helpers/LogBuilder";
import { Device, DeviceDataMessage } from "Models/Device";

const Log = LogBuilder.create("Device graph card");

@autoinject
@containerless
export class DeviceGraphCard {
  chartData: GraphData;
  chartOptions = LINE_GRAPH_CONFIG;
  chartType = "line";

  @bindable device: Device;
  @bindable deviceMessages: DeviceDataMessage[] = [];
  internalDeviceMessages: DeviceDataMessage[] = [];
  subscriptions: Subscription[] = [];

  constructor(private graphController: GraphController, private eventAggregator: EventAggregator) {}

  initiateChartData() {
    this.chartData = this.getChartData(this.internalDeviceMessages);
  }

  getChartData(messageData: DeviceDataMessage[]) {
    return this.graphController.getGraph(messageData, { graphType: ["count"] });
  }

  addChartData(wsMessage: DeviceDataMessage) {
    if (wsMessage) {
      Log.debug("Adding chart data", this.chartData);
      if (this.chartData.datasets.length !== 0) {
        this.graphController.addToGraph(wsMessage, this.chartData);
        this.eventAggregator.publish("global:graphUpdated");
      } else {
        this.chartData = this.getChartData([wsMessage]);
      }
    }
  }

  deviceMessagesChanged() {
    this.internalDeviceMessages = [...this.deviceMessages];
    this.initiateChartData();
  }

  bind() {
    this.internalDeviceMessages = [...this.deviceMessages];
    this.subscriptions.push(
      this.eventAggregator.subscribe("deviceMessage", (deviceData: DeviceDataMessage) => {
        if (deviceData.device.deviceId === this.device.id) {
          this.addChartData(deviceData);
        }
      }),
    );
    this.initiateChartData();
  }

  unbind() {
    this.subscriptions.forEach((subscription) => subscription.dispose());
    this.subscriptions = [];
  }
}
