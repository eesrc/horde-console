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
import { autoinject, useView } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";

import { TokenService } from "Services/TokenService";

import { LogBuilder } from "Helpers/LogBuilder";
import { BadRequestError } from "Helpers/ResponseHandler";
import { Collection } from "Models/Collection";
import { Token } from "Models/Token";

const AccessLevels = {
  readonly: false,
  fullaccess: true,
};

interface IEditCollectionDialogParams {
  collections: Collection[];
  token: Token;
}

const Log = LogBuilder.create("Edit token dialog");

@useView(PLATFORM.moduleName("dialogs/token/tokenDialog.html"))
@autoinject
export class EditTokenDialog {
  token: Token;

  selectedAccessLevel: string = "readonly";
  selectedResourceAccess: string = "all";
  selectedCollection: string;

  collections: Collection[] = [];

  dialogHeader = "Update your API token";
  confirmButtonText = "Update API token";
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
      .updateToken(this.token)
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

  activate(args: IEditCollectionDialogParams) {
    this.collections = args.collections;
    this.token = args.token;

    this.propagateAccessRightsFromToken(this.token);
  }

  private propagateAccessRightsFromToken(token: Token) {
    const url = token.resource;

    this.selectedAccessLevel = token.write ? "fullaccess" : "readonly";

    Log.debug("Token", token);

    if (url === "/") {
      Log.debug("Token is all");
      this.selectedResourceAccess = "all";
    } else {
      if (url === "/collections") {
        Log.debug("Token is collection");
        this.selectedResourceAccess = url.replace("/", "");
        return;
      }

      const accessChunks = url.split("/");

      Log.debug("accessChunks", accessChunks);

      if (accessChunks[1] === "collections") {
        this.selectedResourceAccess = "specific_collection";
        this.selectedCollection = accessChunks[2];
      }
    }
  }

  private getResourceAccessUrl(): string {
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
}
