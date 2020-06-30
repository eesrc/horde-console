import { DataMapperChain } from "@exploratoryengineering/data-mapper-chain";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { autoinject, bindable } from "aurelia-framework";
import { ChartOptions, ChartType } from "chart.js";
import { LINE_GRAPH_CONFIG } from "Helpers/GraphConfigs";
import { GraphController, GraphData } from "Helpers/GraphController";
import { WebsocketDeviceDataMessage } from "Helpers/Websocket";
import { Device, DeviceDataMessage } from "Models/Device";

import "./line-visualization.scss";

@autoinject
export class LineVisualization {
  @bindable devices: Device[] = [];
  @bindable messageData: DeviceDataMessage[] = [];
  @bindable dataMapperChain: DataMapperChain;

  @bindable chartData: GraphData;
  chartOptions: ChartOptions = LINE_GRAPH_CONFIG;
  chartType: ChartType = "line";

  subscriptions: Subscription[] = [];

  constructor(private graphController: GraphController, private eventAggregator: EventAggregator) {}

  initiateChartData() {
    this.chartData = this.getChartData(this.messageData);
  }

  getChartData(messageData: DeviceDataMessage[]) {
    const labelSet = this.graphController.generateLabelSetFromDevices(this.devices);
    return this.graphController.getGraph(messageData, {
      graphType: [this.dataMapperChain],
      labels: labelSet,
    });
  }

  addChartData(wsMessage: DeviceDataMessage) {
    if (wsMessage) {
      if (this.chartData.datasets.length !== 0) {
        this.graphController.addToGraph(wsMessage, this.chartData);
        this.eventAggregator.publish("global:graphUpdated");
      } else {
        this.chartData = this.getChartData([wsMessage]);
      }
    }
  }

  mapperChainChanged() {
    this.initiateChartData();
  }

  messageDataChanged() {
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
