import { DialogController } from "aurelia-dialog";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, PLATFORM, useView } from "aurelia-framework";
import { LogBuilder } from "Helpers/LogBuilder";
import { BadRequestError, Team, TeamService } from "Services/TeamService";

const Log = LogBuilder.create("Create team dialog");

@autoinject
@useView(PLATFORM.moduleName("dialogs/team/teamDialog.html"))
export class CreateTeamDialog {
  headerText: string = "Create new team";
  confirmButtonText: string = "Create team";

  team: Team = new Team();

  constructor(
    private teamService: TeamService,
    private dialogController: DialogController,
    private eventAggregator: EventAggregator,
  ) {}

  submitTeam() {
    Log.debug("Collection to be submitted", this.team);
    this.teamService
      .createNewTeam(this.team)
      .then((team) => {
        this.dialogController.ok(team);
      })
      .catch((err) => {
        if (err instanceof BadRequestError) {
          this.eventAggregator.publish("global:message", {
            body: `Bad request: ${err.content.message}`,
          });
        } else {
          Log.error("Error when trying to create team", err);
        }
      });
  }
}
