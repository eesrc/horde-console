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

import { DialogController } from "aurelia-dialog";
import { autoinject, PLATFORM, useView } from "aurelia-framework";

import { Token, TokenService } from "Services/TokenService";

import { LogBuilder } from "Helpers/LogBuilder";
import { BadRequestError } from "Helpers/ResponseHandler";
import { Collection } from "Models/Collection";

const AccessLevels = {
  readonly: false,
  fullaccess: true,
};

const Log = LogBuilder.create("Create token dialog");

@useView(PLATFORM.moduleName("dialogs/token/tokenDialog.html"))
@autoinject
export class CreateTokenDialog {
  token: Token;

  selectedAccessLevel: string = "readonly";
  selectedResourceAccess: string = "all";
  selectedCollection: string;

  collections: Collection[] = [];

  dialogHeader = "Create a new API token";
  confirmButtonText = "Create API token";
  formError: string;

  accessValues = [
    {
      id: "all",
      value: "Admin access",
    },
    {
      id: "collections",
      value: "All collections",
    },
    {
      id: "specific_collection",
      value: "One specific collection",
    },
  ];

  constructor(private dialogController: DialogController, private tokenService: TokenService) {
    this.token = new Token({
      write: false,
    });
  }

  submitToken() {
    this.token.write = AccessLevels[this.selectedAccessLevel];
    this.token.resource = this.getResourceAccessUrl();

    this.tokenService
      .createToken(this.token)
      .then((token) => {
        this.dialogController.ok(token);
      })
      .catch((error) => {
        if (error instanceof BadRequestError) {
          Log.warn(`${error.errorCode}`, error);
          this.formError = error.content.message;
        } else {
          Log.error("Create token: Error occured", error);
          this.dialogController.cancel();
        }
      });
  }

  cancel() {
    this.dialogController.cancel();
  }

  getResourceAccessUrl(): string {
    const resourceAccess = this.selectedResourceAccess;

    if (resourceAccess === "all") {
      return "/";
    } else {
      if (resourceAccess === "collections") {
        return `/${resourceAccess}`;
      }

      if (resourceAccess === "specific_collection") {
        return `/collections/${this.selectedCollection}`;
      }
    }
  }

  activate(args) {
    this.collections = args.collections;
  }
}
