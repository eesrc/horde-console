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

import { computedFrom } from "aurelia-binding";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, bindable, containerless } from "aurelia-framework";

import { LogBuilder } from "Helpers/LogBuilder";

import { TokenHelper } from "Helpers/TokenHelper";
import { Collection } from "Models/Collection";
import { Token } from "Models/Token";

const Log = LogBuilder.create("Token expansion panel");
const tokenHelper = new TokenHelper();

@autoinject
@containerless
export class TokenExpansionPanel {
  @bindable
  token: Token = new Token();
  @bindable
  active: boolean = false;
  @bindable
  collections: Collection[] = [];

  constructor(private eventAggregator: EventAggregator) {}

  toggle() {
    this.active = !this.active;
  }

  @computedFrom("token", "collections")
  get description() {
    if (tokenHelper.isTokenDangling(this.token, { collections: this.collections })) {
      return "The API key is not connected to any resource. It can safely be deleted.";
    }
    return tokenHelper.getDescription(this.token);
  }

  @computedFrom("token")
  get hasFullAccessToAllResources(): boolean {
    return tokenHelper.getTokenRights(this.token).resource === "all";
  }
  @computedFrom("token")
  get hasAccessAllCollections(): boolean {
    const tokenRights = tokenHelper.getTokenRights(this.token);
    return (
      tokenRights.resource === "all" ||
      (tokenRights.resource === "collections" && tokenRights.resourceId === "all")
    );
  }

  @computedFrom("token")
  get hasAccessToSpecificCollection(): boolean {
    const tokenRights = tokenHelper.getTokenRights(this.token);
    return tokenRights.resource === "collections" && tokenRights.resourceId !== "all";
  }

  curlGetRoot() {
    return `curl \\
    -XGET ${HORDE_ENDPOINT}/ \\
    -HX-API-Token:${this.token.token}`;
  }

  curlGetTokens() {
    return `curl \\
    -XGET ${HORDE_ENDPOINT}/tokens \\
    -HX-API-Token:${this.token.token}`;
  }

  curlGetCollections() {
    return `curl \\
    -XGET ${HORDE_ENDPOINT}/collections \\
    -HX-API-Token:${this.token.token}`;
  }

  curlGetCollectionInformation() {
    return `curl \\
    -XGET ${HORDE_ENDPOINT}${this.token.resource} \\
    -HX-API-Token:${this.token.token}`;
  }

  curlGetCollectionDevices() {
    return `curl \\
    -XGET ${HORDE_ENDPOINT}${this.token.resource}/devices \\
    -HX-API-Token:${this.token.token}`;
  }

  curlGetCollectionWebsocket() {
    return `curl -i -N --http1.1 \\
    -H "Sec-WebSocket-Version: 13" \\
    -H "Sec-WebSocket-Key: ${window.btoa(this.token.resource)}" \\
    -H "X-API-Token: ${this.token.token}" \\
    -H "Connection: Upgrade" \\
    -H "Upgrade: websocket" \\
    -H "Origin: ${HORDE_ENDPOINT}" \\
    ${HORDE_ENDPOINT}${this.token.resource}/from`;
  }

  editToken() {
    Log.debug("User wants to edit token", this.token);
    this.eventAggregator.publish("token:edit", this.token);
  }

  deleteToken() {
    Log.debug("User wants to delete token", this.token);
    this.eventAggregator.publish("token:delete", this.token);
  }
}
