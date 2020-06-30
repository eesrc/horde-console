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

import { LogBuilder } from "Helpers/LogBuilder";
const Log = LogBuilder.create("Time ago");

const INVALID_DATE = "Invalid date";

import { formatDistance, isValid, parse } from "date-fns";

export class TimeAgoValueConverter {
  toView(value: any) {
    value = value.toString();
    value = value.length === 19 ? value.slice(0, 13) : value;

    let date = new Date(value);

    if (isValid(date)) {
      return formatDistance(date, Date.now(), {
        includeSeconds: true,
        addSuffix: true,
      });
    }

    date = parse(value, "T", new Date());
    if (isValid(date)) {
      return formatDistance(date, Date.now(), {
        includeSeconds: true,
        addSuffix: true,
      });
    }

    Log.warn("Invalid date", value);
    return INVALID_DATE;
  }
}
