import { DialogController } from "aurelia-dialog";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, PLATFORM, useView } from "aurelia-framework";
import { LogBuilder } from "Helpers/LogBuilder";
import { Team } from "Models/Team";
import { BadRequestError } from "Services/CollectionService";
import { TeamService } from "Services/TeamService";

const Log = LogBuilder.create("Edit team dialog");

interface IEditTeamDialogParams {
  team: Team;
}

@autoinject
@useView(PLATFORM.moduleName("dialogs/team/teamDialog.html"))
export class EditTeamDialog {
  headerText: string = "Edit team";
  confirmButtonText: string = "Update team";

  team: Team = new Team();

  availableTeams = [];

  constructor(
    private teamService: TeamService,
    private dialogController: DialogController,
    private eventAggregator: EventAggregator,
  ) {}

  submitTeam() {
    Log.debug("Collection to be submitted", this.team);
    this.teamService
      .updateTeam(this.team)
      .then(() => {
        this.dialogController.ok(this.team);
      })
      .catch((err) => {
        if (err instanceof BadRequestError) {
          this.eventAggregator.publish("global:message", {
            body: `Bad request: ${err.content.message}`,
          });
        } else {
          Log.error("Error when trying to edit team", err);
        }
      });
  }

  activate(args: IEditTeamDialogParams) {
    Log.debug("Activate args", args);
    this.team = args.team;
  }
}
