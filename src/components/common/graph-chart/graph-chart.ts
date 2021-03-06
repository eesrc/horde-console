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
import { autoinject } from "aurelia-framework";
import { bindable, bindingMode, containerless } from "aurelia-framework";
import * as Chart from "chart.js";
import { TnCustomComponent } from "Components/TnCustomComponent";
import { LogBuilder } from "Helpers/LogBuilder";

const Log = LogBuilder.create("Graph chart");

@autoinject
@containerless
export class GraphChart extends TnCustomComponent {
  @bindable chartData: any = {};
  @bindable chartOptions = {};
  @bindable chartType = "line";
  @bindable({ defaultBindingMode: bindingMode.twoWay }) chart: Chart;

  @bindable minHeight: string | boolean = false;
  @bindable fixedHeight: string | boolean = false;

  @bindable updateType: "live" | "interval" = "live";
  @bindable updateIntervalTimeout: number = 10000;

  canvas;
  subscriptions: Subscription[] = [];

  updateIntervalID: number = 0;

  constructor(private eventAggregator: EventAggregator) {
    super();
  }

  createChart() {
    this.chart = new Chart(this.canvas, {
      type: this.chartType,
      data: this.chartData,
      options: this.chartOptions,
    });
  }

  resetChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    this.createChart();
  }

  bind() {
    this.createChart();
    if (this.updateType === "live") {
      Log.debug("Graph is live!");
      this.subscriptions.push(
        this.eventAggregator.subscribe("global:graphUpdated", () => {
          this.updateChart();
        }),
      );
    } else {
      Log.debug("Graph is set to update on interval", this.updateIntervalTimeout);
      this.updateIntervalID = window.setInterval(() => {
        this.updateChart();
      }, this.updateIntervalTimeout);
    }
  }

  updateChart() {
    Log.debug("Updating chart");
    this.chart.update();
  }

  unbind() {
    this.chart.destroy();
    this.subscriptions.forEach((sub) => sub.dispose());
    this.subscriptions = [];
    window.clearInterval(this.updateIntervalID);
  }

  chartDataChanged(newData) {
    this.chart.data.datasets = newData.datasets;
    this.chart.data.labels = newData.labels;
    this.chart.update();
  }

  chartOptionsChanged() {
    this.resetChart();
  }

  chartTypeChanged() {
    this.resetChart();
  }
}
