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

import { RouterMock } from "Test/mock/mocks";
import { NotFound } from "./not-found";

describe("Not found view", () => {
  let routerStub;
  let notFoundView: NotFound;

  beforeEach(() => {
    routerStub = new RouterMock();

    notFoundView = new NotFound(routerStub);
  });

  it("should call navigateBack to router when triggering navigateBack", () => {
    const callToNavigateBack = spyOn(routerStub, "navigateBack");

    notFoundView.navigateBack();

    expect(callToNavigateBack).toHaveBeenCalled();
  });
});
