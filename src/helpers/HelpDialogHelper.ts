import { DialogService } from "aurelia-dialog";
import { autoinject, PLATFORM } from "aurelia-framework";
import * as Cookie from "js-cookie";

const availableHelpDialogs = {
  collectionsOverview: PLATFORM.moduleName("dialogs/help/collectionHelpDialog"),
  apiTokenOverview: PLATFORM.moduleName("dialogs/help/apiTokenHelpDialog"),
  teamOverview: PLATFORM.moduleName("dialogs/help/teamHelpDialog"),
};

type AvailableHelpDialogs = "collectionsOverview" | "apiTokenOverview" | "teamOverview";

import { LogBuilder } from "Helpers/LogBuilder";
const Log = LogBuilder.create("Help dialog helper");

@autoinject
export class HelpDialogHelper {
  constructor(private dialogService: DialogService) {}

  showHelpDialog(dialog: AvailableHelpDialogs) {
    Log.debug(`Showing dialog ${dialog}`);
    if (!availableHelpDialogs[dialog]) {
      Log.warn("Tried to show dialog which doesn't exist.", dialog);
      return;
    }
    if (!Cookie.get("skipTutorial") && !Cookie.get(`skip${dialog}`)) {
      this.dialogService
        .open({
          viewModel: availableHelpDialogs[dialog],
        })
        .whenClosed(async (result) => {
          if (!result.wasCancelled) {
            Log.debug("Customer 'got it', adding cookie");
            await Cookie.set(`skip${dialog}`, "skip", {
              expires: 365 * 10,
              secure: true,
            });
          }
        });
    }
  }
}
