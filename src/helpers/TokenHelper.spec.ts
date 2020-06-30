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

import { TokenHelper } from "Helpers/TokenHelper";
import { Collection } from "Models/Collection";
import { Token } from "Models/Token";

const tokenHelper = new TokenHelper();

describe("TokenHelper", () => {
  describe("description", () => {
    const CORRECT_DESCRIPTIONS = {
      FULL_ACCESS_ALL_RESOURCES: "The API token has full access to all resources",
      READ_ACCESS_ALL_RESOURCES: "The API token has read access to all resources",

      FULL_ACCESS_COLLECTIONS: "The API token has full access to all collections",
      READ_ACCESS_COLLECTIONS: "The API token has read access to all collections",

      FULL_ACCESS_SPECIFIC_COLLECTION:
        "The API token has full access to collections with id testid",
      READ_ACCESS_SPECIFIC_COLLECTION:
        "The API token has read access to collections with id testid",
    };

    it("should give correct description upon having full access to all resources", () => {
      const token = new Token({
        resource: "/",
        write: true,
      });

      expect(tokenHelper.getDescription(token)).toBe(
        CORRECT_DESCRIPTIONS.FULL_ACCESS_ALL_RESOURCES,
      );
    });

    it("should give correct description upon having read access to all resources", () => {
      const token = new Token({
        resource: "/",
        write: false,
      });

      expect(tokenHelper.getDescription(token)).toBe(
        CORRECT_DESCRIPTIONS.READ_ACCESS_ALL_RESOURCES,
      );
    });

    it("should give correct description upon having full access to all collections", () => {
      const token = new Token({
        resource: "/collections",
        write: true,
      });

      expect(tokenHelper.getDescription(token)).toBe(CORRECT_DESCRIPTIONS.FULL_ACCESS_COLLECTIONS);
    });

    it("should give correct description upon having read access to all collections", () => {
      const token = new Token({
        resource: "/collections",
        write: false,
      });

      expect(tokenHelper.getDescription(token)).toBe(CORRECT_DESCRIPTIONS.READ_ACCESS_COLLECTIONS);
    });

    it("should give correct description upon having full access to a specific collection", () => {
      const token = new Token({
        resource: "/collections/testid",
        write: true,
      });

      expect(tokenHelper.getDescription(token)).toBe(
        CORRECT_DESCRIPTIONS.FULL_ACCESS_SPECIFIC_COLLECTION,
      );
    });

    it("should give correct description upon having read access to a specific collection", () => {
      const token = new Token({
        resource: "/collections/testid",
        write: false,
      });

      expect(tokenHelper.getDescription(token)).toBe(
        CORRECT_DESCRIPTIONS.READ_ACCESS_SPECIFIC_COLLECTION,
      );
    });
  });

  describe("token rights", () => {
    it("should give correct token rights upon having access to all resources", () => {
      const token = new Token({
        resource: "/",
      });

      expect(tokenHelper.getTokenRights(token)).toEqual({
        resource: "all",
        resourceId: "all",
      });
    });

    it("should give correct token rights upon having access to all collections", () => {
      const token = new Token({
        resource: "/collections",
      });

      expect(tokenHelper.getTokenRights(token)).toEqual({
        resource: "collections",
        resourceId: "all",
      });
    });

    it("should give correct token rights upon having access to all gateways", () => {
      const token = new Token({
        resource: "/gateways",
      });

      expect(tokenHelper.getTokenRights(token)).toEqual({
        resource: "gateways",
        resourceId: "all",
      });
    });

    it("should give correct token rights upon having access to a specific collection", () => {
      const token = new Token({
        resource: "/collections/testid",
      });

      expect(tokenHelper.getTokenRights(token)).toEqual({
        resource: "collections",
        resourceId: "testid",
      });
    });
  });

  describe("dangling tokens", () => {
    const collections: Collection[] = [
      new Collection({
        id: "testId1",
      }),
      new Collection({
        id: "testId2",
      }),
      new Collection({
        id: "testId3",
      }),
    ];

    it("should return true when token is dangling from an collection", () => {
      const token = new Token({
        resource: "/collections/nonExistingId",
      });

      expect(
        tokenHelper.isTokenDangling(token, {
          collections: collections,
        }),
      ).toBe(true);
    });

    it("should return false if token has access to all collections", () => {
      const token = new Token({
        resource: "/collections",
      });

      expect(
        tokenHelper.isTokenDangling(token, {
          collections: collections,
        }),
      ).toBe(false);
    });

    it("should return false if token has access to all resources", () => {
      const token = new Token({
        resource: "/",
      });

      expect(
        tokenHelper.isTokenDangling(token, {
          collections: collections,
        }),
      ).toBe(false);
    });

    it("should return false if collection id exists", () => {
      const token = new Token({
        resource: "/collections/testId2",
      });

      expect(
        tokenHelper.isTokenDangling(token, {
          collections: collections,
        }),
      ).toBe(false);
    });
  });
});
