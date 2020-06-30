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

import { Collection } from "Models/Collection";
import { Token } from "Models/Token";
import { DialogControllerMock, TokenServiceMock } from "Test/mock/mocks";
import { EditTokenDialog } from "./editTokenDialog";

describe("Edit token dialog", () => {
  let editTokenDialog: EditTokenDialog;

  let dialogControllerMock;
  let tokenServiceMock;

  beforeEach(() => {
    dialogControllerMock = new DialogControllerMock();
    tokenServiceMock = new TokenServiceMock();
    editTokenDialog = new EditTokenDialog(dialogControllerMock, tokenServiceMock);
  });

  describe("activate", () => {
    it("should correctly propagate collections", () => {
      const collections = [new Collection(), new Collection()];

      editTokenDialog.activate({
        collections: collections,
        token: new Token(),
      });

      expect(editTokenDialog.collections).toBe(collections);
    });

    it("should correctly set selectedAccessLevel fullaccess from token", () => {
      const token = new Token({
        write: true,
      });

      editTokenDialog.activate({
        collections: [],
        token: token,
      });

      expect(editTokenDialog.selectedAccessLevel).toBe("fullaccess");
    });

    it("should correctly set selectedAccessLevel to readonly from token", () => {
      const token = new Token({
        write: false,
      });

      editTokenDialog.activate({
        collections: [],
        token: token,
      });

      expect(editTokenDialog.selectedAccessLevel).toBe("readonly");
    });

    it("should correctly set resourceAccess to collections from token", () => {
      const token = new Token({
        resource: "/collections",
      });

      editTokenDialog.activate({
        collections: [],
        token: token,
      });

      expect(editTokenDialog.selectedResourceAccess).toBe("collections");
    });

    it("should correctly set resourceAccess to specific_collection from token", () => {
      const token = new Token({
        resource: "/collections/123",
      });

      editTokenDialog.activate({
        collections: [],
        token: token,
      });

      expect(editTokenDialog.selectedResourceAccess).toBe("specific_collection");
      expect(editTokenDialog.selectedCollection).toBe("123");
    });
  });
});
