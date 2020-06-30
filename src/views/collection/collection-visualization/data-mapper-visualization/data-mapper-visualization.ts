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
import { autoinject, bindable, bindingMode, containerless } from "aurelia-framework";

import { DataMapperChain } from "@exploratoryengineering/data-mapper-chain";
import { Range } from "Helpers/Range";
import { Device, DeviceDataMessage } from "Models/Device";

type VisualizationType = "graph" | "gps";

@autoinject
@containerless
export class DataMapperVisualization {
  cardElement: Element;

  visualizationType: VisualizationType = "graph";
  hasFullscreenCapability: boolean = false;
  isFullscreen: boolean = false;

  @bindable devices: Device[] = [];
  @bindable messageData: DeviceDataMessage[] = [];
  @bindable dataMapperChain: DataMapperChain;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) selectedRange: Range = Range.ONE_HOUR_AGO;

  @bindable editVisualizationCallback: (visualization: { mapperChain: DataMapperChain }) => void;
  @bindable deleteVisualizationCallback: (visualization: { mapperChain: DataMapperChain }) => void;

  subscriptions: Subscription[] = [];

  constructor(private eventAggregator: EventAggregator) {}

  editVisualization() {
    this.editVisualizationCallback({
      mapperChain: this.dataMapperChain,
    });
  }

  deleteVisualization() {
    this.deleteVisualizationCallback({
      mapperChain: this.dataMapperChain,
    });
  }

  toggleFullscreen() {
    if (!this.isFullscreen) {
      this.cardElement.requestFullscreen().catch(() => {
        this.eventAggregator.publish("global:message", { body: "Couldn't go fullscreen" });
      });
    } else {
      document.exitFullscreen();
    }
  }

  bind() {
    this.hasFullscreenCapability = !!this.cardElement.requestFullscreen;
    this.visualizationType = this.dataMapperChain.meta
      ? this.dataMapperChain.meta["visualization-type"] || "graph"
      : "graph";

    this.cardElement.addEventListener("fullscreenchange", () => {
      this.isFullscreen = !this.isFullscreen;
    });
  }

  unbind() {
    this.subscriptions.forEach((subscription) => subscription.dispose());
    this.subscriptions = [];
  }
}
