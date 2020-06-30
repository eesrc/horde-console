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

import { Base64Action, Base64DecodeAs, create } from "@exploratoryengineering/data-mapper-chain";
import { LogBuilder } from "Helpers/LogBuilder";

enum BASE_64_ACTION {
  ENCODE = "encode",
  DECODE = "decode",
}

enum BASE_64_DECODE_ACTION {
  DECODE_AS_STRING = "string",
  DECODE_AS_HEX = "hex",
}

const Log = LogBuilder.create("Base64");

export class Base64ValueConverter {
  toView(
    value: string,
    action = BASE_64_ACTION.DECODE,
    decodeAs = BASE_64_DECODE_ACTION.DECODE_AS_STRING,
  ) {
    if (action === BASE_64_ACTION.DECODE) {
      try {
        if (decodeAs === BASE_64_DECODE_ACTION.DECODE_AS_STRING) {
          return create()
            .base64({
              action: Base64Action.DECODE,
              decodeAs: Base64DecodeAs.STRING,
            })
            .mapData(value);
        } else if (decodeAs === BASE_64_DECODE_ACTION.DECODE_AS_HEX) {
          return create()
            .base64({
              action: Base64Action.DECODE,
              decodeAs: Base64DecodeAs.HEXSTRING,
            })
            .mapData(value);
        }
      } catch (e) {
        Log.warn("Could not decode value, returning initial value", value);
        return value;
      }
    }
    if (action === BASE_64_ACTION.ENCODE) {
      try {
        return create()
          .base64({
            action: Base64Action.ENCODE,
          })
          .mapData(value);
      } catch (e) {
        Log.warn("Could not encode value, returning initial value", value);
        return value;
      }
    }

    Log.warn("Invalid action, returning initial value", action, value);
  }
}
