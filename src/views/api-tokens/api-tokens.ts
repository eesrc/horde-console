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

import { DialogService } from "aurelia-dialog";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, PLATFORM } from "aurelia-framework";

import { Collection, CollectionService } from "Services/CollectionService";
import { TokenService } from "Services/TokenService";

import { Token } from "Models/Token";

import { HelpDialogHelper } from "Helpers/HelpDialogHelper";
import { LogBuilder } from "Helpers/LogBuilder";
const Log = LogBuilder.create("API tokens");

@autoinject
export class ApiTokens {
  collections: Collection[] = [];
  tokens: Token[] = [];
  subscriptions: any[] = [];

  constructor(
    private tokenService: TokenService,
    private collectionService: CollectionService,
    private dialogService: DialogService,
    private eventAggregator: EventAggregator,
    private helpDialogHelper: HelpDialogHelper,
  ) {}

  createNewToken() {
    Log.debug("Creating token");

    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/token/createTokenDialog"),
        model: {
          collections: this.collections,
        },
      })
      .whenClosed((response) => {
        if (!response.wasCancelled) {
          Log.debug("Data from created token", response);
          this.tokens.push(response.output);
          this.eventAggregator.publish("global:message", {
            body: "Token created",
          });
        }
      });
  }

  deleteToken(tokenToBeDeleted: Token) {
    Log.debug("Received delete request for token", tokenToBeDeleted);

    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/message/messageDialog"),
        model: {
          messageHeader: "Delete token?",
          message: `Are you sure you want to delete the API key? (THIS CAN NOT BE REVERTED)`,
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
        },
      })
      .whenClosed((response) => {
        if (!response.wasCancelled) {
          Log.debug("Deleting token");
          this.tokenService.deleteToken(tokenToBeDeleted).then(() => {
            this.tokens = this.tokens.filter((token) => {
              return token.token !== tokenToBeDeleted.token;
            });
            this.eventAggregator.publish("global:message", {
              body: "Token deleted",
            });
          });
        } else {
          Log.debug("Did not delete token");
        }
      });
  }

  editToken(tokenToEdit: Token) {
    Log.debug("Received edit request for token", tokenToEdit);
    const tokenUntouched = { ...tokenToEdit };

    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/token/editTokenDialog"),
        model: {
          collections: this.collections,
          token: tokenUntouched,
        },
      })
      .whenClosed((response) => {
        if (!response.wasCancelled) {
          const updatedToken = response.output;
          const index = this.tokens.findIndex((token) => {
            return token.token === updatedToken.token;
          });
          this.tokens.splice(index, 1, updatedToken);
          this.eventAggregator.publish("global:message", {
            body: "Token updated",
          });
        } else {
          Log.debug("Did not update token");
        }
      });
  }

  activate() {
    this.helpDialogHelper.showHelpDialog("apiTokenOverview");
    this.subscriptions.push(
      this.eventAggregator.subscribe("token:edit", (token) => {
        this.editToken(token);
      }),
    );

    this.subscriptions.push(
      this.eventAggregator.subscribe("token:delete", (token) => {
        this.deleteToken(token);
      }),
    );

    return Promise.all([
      this.tokenService.fetchAllTokens().then((tokens) => {
        this.tokens = tokens;
      }),
      this.collectionService.fetchAllCollections().then((collections) => {
        this.collections = collections;
      }),
    ]);
  }

  deactivate() {
    this.subscriptions.forEach((subscription) => subscription.dispose());
    this.subscriptions = [];
  }
}
