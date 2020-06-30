import { DialogController } from "aurelia-dialog";
import { autoinject } from "aurelia-framework";
import { NotFoundError, TeamService } from "Services/TeamService";

import { LogBuilder } from "Helpers/LogBuilder";
const Log = LogBuilder.create("Redeem team invite dialog");

@autoinject
export class RedeemTeamInviteDialog {
  redeemCode: string = "";
  redeemCodeError: string = "";

  loading: boolean = false;

  constructor(private dialogController: DialogController, private teamService: TeamService) {}

  cancel() {
    this.dialogController.cancel();
  }

  redeemTeamCode() {
    this.loading = true;

    this.teamService
      .redeemInvite(this.redeemCode)
      .then(() => {
        this.dialogController.ok();
      })
      .catch((error) => {
        this.loading = false;
        Log.debug("Got error", error);
        if (error instanceof NotFoundError) {
          this.redeemCodeError = "Could not find given redeem code";
        }
      });
  }
}
