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

import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject } from "aurelia-framework";
import { LogBuilder } from "Helpers/LogBuilder";
import {
  Websocket,
  WebsocketDeviceDataMessage,
  WebsocketKeepAliveMessage,
} from "Helpers/Websocket";

const Log = LogBuilder.create("Collection stream");
const MAX_BACKDOWN_TIMEOUT_IN_S = 30;

/**
 * Simple class to abstract the websocket functionality from view models when
 * wanting a data stream based on a collection.
 */
@autoinject
export class CollectionStream {
  private opening: boolean = false;
  private websocket: Websocket | null;
  private reconnectTimeoutId: number;
  private backdownTimeoutInS: number = 1;

  constructor(private eventAggregator: EventAggregator) {}

  openCollectionDataStream(collectionId: string) {
    if (this.opening) {
      return;
    }

    this.opening = true;

    if (!this.websocket) {
      this.websocket = new Websocket({
        url: this.websocketUrl(collectionId),
        onerror: (err) => {
          this.onWebsocketError(err);
        },
        onopen: (msg) => {
          this.onWebsocketOpen(msg);
        },
        onclose: (msg) => {
          this.onWebsocketClose(msg);
        },
        onmessage: (msg: MessageEvent) => {
          Log.debug("Got websocket message", msg);
          this.onWebsocketStreamMessage(JSON.parse(msg.data));
        },
      });
    } else {
      this.reconnectWebsocket();
    }
  }

  closeCollectionStream() {
    Log.debug("Closing WS by programmatical init");
    clearTimeout(this.reconnectTimeoutId);
    this.backdownTimeoutInS = 1;
    this.opening = false;
    this.websocket.close();
  }

  private reconnectWebsocket() {
    Log.debug(`Reconnecting websocket. Timeout in ${this.backdownTimeoutInS}s`);
    this.reconnectTimeoutId = window.setTimeout(() => {
      this.websocket.reconnect();
    }, this.backdownTimeoutInS * 1000);
    if (this.backdownTimeoutInS < MAX_BACKDOWN_TIMEOUT_IN_S) {
      this.backdownTimeoutInS = this.backdownTimeoutInS * 2;
    }
  }

  private onWebsocketOpen(msg) {
    Log.debug("Websocket open", msg);
    this.backdownTimeoutInS = 1;
    this.opening = false;
  }

  private onWebsocketStreamMessage(wsMessage: WebsocketDeviceDataMessage) {
    if (this.isKeepAlive(wsMessage)) {
      // Just a keep-alive, no need to do anything yet
    } else if (this.isDeviceData(wsMessage)) {
      wsMessage.received = parseInt(wsMessage.received.toString().slice(0, 13), 10);
      this.eventAggregator.publish("deviceMessage", wsMessage);
    }
  }

  private onWebsocketClose(closeMessage) {
    Log.debug("WS Close: ", closeMessage);
  }

  private onWebsocketError(err) {
    Log.error("Websocket error", err);
  }

  private isKeepAlive(
    websocketData: WebsocketKeepAliveMessage | WebsocketDeviceDataMessage,
  ): websocketData is WebsocketKeepAliveMessage {
    return websocketData.type === "keepAlive";
  }

  private isDeviceData(
    websocketData: WebsocketKeepAliveMessage | WebsocketDeviceDataMessage,
  ): websocketData is WebsocketDeviceDataMessage {
    return websocketData.type === "data";
  }

  private websocketUrl(collectionId: string): string {
    let websocketHost = HORDE_WS_ENDPOINT;
    if (!websocketHost) {
      if (window.location.protocol === "https:") {
        websocketHost = "wss://";
      } else {
        websocketHost = "ws://";
      }

      websocketHost += window.location.host;
    }

    return `${websocketHost}/collections/${collectionId}/from`;
  }
}
