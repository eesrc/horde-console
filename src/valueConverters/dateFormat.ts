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

import { format, isValid, parse } from "date-fns";

const INVALID_DATE = "Invalid date";

export class DateFormatValueConverter {
  toView(dateString: string, dateFormat = "dd/MM/yyyy HH:mm:ss") {
    dateString = dateString.toString();
    dateString = dateString.length === 19 ? dateString.slice(0, 13) : dateString;

    // Correctly formatted date string (ISO 8601)
    let date = new Date(dateString);
    if (isValid(date)) {
      return format(date, dateFormat, { awareOfUnicodeTokens: true });
    }

    // Timestamp
    date = parse(dateString, "T", new Date());
    if (isValid(date)) {
      return format(date, dateFormat, { awareOfUnicodeTokens: true });
    }

    return INVALID_DATE;
  }
}
