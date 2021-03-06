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

export class CopyHelper {
  copyToClipBoard(copyText): Promise<any> {
    return new Promise((res, rej) => {
      const textArea = document.createElement("textarea");

      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";

      document.body.appendChild(textArea);

      textArea.value = copyText;
      textArea.select();

      let error;

      try {
        document.execCommand("copy");
      } catch (copyError) {
        error = copyError;
      }

      document.body.removeChild(textArea);

      if (error) {
        rej(error);
      } else {
        res();
      }
    });
  }
}
