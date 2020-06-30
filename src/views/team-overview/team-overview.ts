import { DialogService } from "aurelia-dialog";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { autoinject, PLATFORM } from "aurelia-framework";
import { HelpDialogHelper } from "Helpers/HelpDialogHelper";
import { LogBuilder } from "Helpers/LogBuilder";
import { ConflictError, Team, TeamService } from "Services/TeamService";

const Log = LogBuilder.create("Team overview");

interface ITeamOverviewParams {
  teamId?: string;
}

@autoinject
export class TeamOverview {
  teams: Team[] = [];
  selectedTeam: string = "";

  subscriptions: Subscription[] = [];

  constructor(
    private teamService: TeamService,
    private dialogService: DialogService,
    private eventAggregator: EventAggregator,
    private helpDialogHelper: HelpDialogHelper,
  ) {}

  activate(args: ITeamOverviewParams) {
    this.helpDialogHelper.showHelpDialog("teamOverview");

    this.selectedTeam = args.teamId;
    this.subscriptions.push(
      this.eventAggregator.subscribe("team:edit", (team: Team) => {
        this.editTeam(team);
      }),
    );
    this.subscriptions.push(
      this.eventAggregator.subscribe("team:delete", (team: Team) => {
        this.deleteTeam(team);
      }),
    );

    return this.fetchAllTeams();
  }

  deactivate() {
    this.subscriptions.forEach((subscription) => subscription.dispose());
    this.subscriptions = [];
  }

  createNewTeam() {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/team/createTeamDialog"),
      })
      .whenClosed((response) => {
        Log.debug("Response from returned dialog", response);
        if (!response.wasCancelled) {
          this.eventAggregator.publish("global:message", {
            body: "Team created",
          });
          this.teams.push(response.output);
        }
      });
  }

  editTeam(team: Team) {
    this.selectedTeam = team.id;

    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/team/editTeamDialog"),
        model: {
          team: { ...team },
        },
      })
      .whenClosed((response) => {
        Log.debug("Response from returned dialog", response);
        if (!response.wasCancelled) {
          this.eventAggregator.publish("global:message", {
            body: "Team updated",
          });
          this.fetchAllTeams();
        }
      });
  }

  deleteTeam(teamToDelete: Team) {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/message/messageDialog"),
        model: {
          messageHeader: `Delete team?`,
          message: `Note: You need to remove all collections, invites and team members before deleting a team.`,
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
        },
      })
      .whenClosed((response) => {
        Log.debug("Response from returned dialog", response);
        if (!response.wasCancelled) {
          this.teamService
            .deleteTeam(teamToDelete)
            .then(() => {
              this.teams = this.teams.filter((team) => teamToDelete.id !== team.id);
              this.eventAggregator.publish("global:message", {
                body: "Team deleted",
              });
            })
            .catch((err) => {
              if (err instanceof ConflictError) {
                this.eventAggregator.publish("global:message", {
                  body:
                    "Could not delete team. Make sure collections, invites and members have been removed",
                  timeout: 10000,
                });
              } else {
                Log.error("Error when trying to delete team", err);
              }
            });
        }
      });
  }

  redeemTeamInviteCode() {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/team/redeemTeamInviteDialog"),
      })
      .whenClosed((response) => {
        Log.debug("Response from returned dialog", response);
        if (!response.wasCancelled) {
          this.fetchAllTeams();
        }
      });
  }

  private fetchAllTeams(): Promise<any> {
    return this.teamService.fetchAllTeams().then((teams) => {
      this.teams = teams;
    });
  }
}
