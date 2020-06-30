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

import { TimeAgoValueConverter } from "./timeAgo";

Date.now = jest.fn(() => 1490997600000);

const timeAgo = new TimeAgoValueConverter();

describe("TimeAgo value converter", () => {
  const iso8601FirstOfApril = "2017-04-01T00:00:00.000Z";
  const dateStringFirstOfApril = "Sun, 01 Apr 2017 00:00:00 UTC";
  const timestampFirstOfApril = "1490997600000";
  const nanoTimestampFirstOfApril = "1490997600000000000";
  const illegalDate = "abc";

  describe("time formats", () => {
    it("should parse iso8601 dates", () => {
      expect(timeAgo.toView(iso8601FirstOfApril)).not.toBe("Invalid date");
    });

    it("should parse date string dates", () => {
      expect(timeAgo.toView(dateStringFirstOfApril)).not.toBe("Invalid date");
    });

    it("should parse timestamp dates", () => {
      expect(timeAgo.toView(timestampFirstOfApril)).not.toBe("Invalid date");
    });

    it("should parse nano timestamp dates", () => {
      expect(timeAgo.toView(nanoTimestampFirstOfApril)).not.toBe("Invalid date");
    });
  });

  it("should return the default format if given correct date but no format", () => {
    expect(timeAgo.toView(timestampFirstOfApril)).toBe("less than 5 seconds ago");
  });

  it("should show a error message if the given value is illegal", () => {
    expect(timeAgo.toView(illegalDate)).toBe("Invalid date");
  });
});
