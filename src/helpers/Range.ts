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

import { Time } from "Helpers/Time";

export interface Range {
  id: string;
  value: () => Date;
}

export const Range: { [rangeName: string]: Range } = {
  ONE_HOUR_AGO: {
    id: "1h",
    value: Time.ONE_HOUR_AGO,
  },
  LAST_SIX_HOURS: {
    id: "6h",
    value: Time.SIX_HOURS_AGO,
  },
  LAST_TWENTY_FOUR_HOURS: {
    id: "24h",
    value: Time.TWENTY_FOUR_HOURS_AGO,
  },
  ALL: {
    id: "all",
    value: () => {
      return new Date(0);
    },
  },
};
