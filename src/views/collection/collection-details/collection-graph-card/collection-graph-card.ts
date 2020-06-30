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
import { ChartOptions, ChartType } from "chart.js";
import { LINE_GRAPH_CONFIG } from "Helpers/GraphConfigs";
import { GraphController, GraphData } from "Helpers/GraphController";
import { LogBuilder } from "Helpers/LogBuilder";
import { WebsocketDeviceDataMessage } from "Helpers/Websocket";
import { Collection } from "Models/Collection";
import { Device, DeviceDataMessage } from "Models/Device";

const Log = LogBuilder.create("Application graph card");

@autoinject
@containerless
export class CollectionGraphCard {
  @bindable
  chartData: GraphData;
  chartOptions: ChartOptions = LINE_GRAPH_CONFIG;
  chartType: ChartType = "line";

  @bindable collection: Collection;
  @bindable devices: Device[] = [];
  @bindable messageData: DeviceDataMessage[] = [];
  subscriptions: Subscription[] = [];

  constructor(private graphController: GraphController, private eventAggregator: EventAggregator) {}

  initiateChartData() {
    this.chartData = this.getChartData(this.messageData);
  }

  getChartData(messageData: WebsocketDeviceDataMessage[]) {
    const labelSet = this.graphController.generateLabelSetFromDevices(this.devices);
    return this.graphController.getGraph(messageData, { graphType: ["count"], labels: labelSet });
  }

  addChartData(wsMessage: WebsocketDeviceDataMessage) {
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

  selectedRangeChanged() {
    this.initiateChartData();
  }

  mapperChainChanged() {
    this.initiateChartData();
  }

  collectionChanged() {
    this.initiateChartData();
  }

  bind() {
    this.subscriptions.push(
      this.eventAggregator.subscribe("deviceMessage", (deviceData: WebsocketDeviceDataMessage) => {
        this.addChartData(deviceData);
      }),
    );

    this.initiateChartData();
  }

  unbind() {
    this.subscriptions.forEach((subscription) => subscription.dispose());
    this.subscriptions = [];
  }
}
