import { DialogService } from "aurelia-dialog";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, bindable, containerless, PLATFORM } from "aurelia-framework";
import { UserInformation, UserProfile } from "Helpers/UserInformation";
import { Team, TeamInvite, TeamMember, TeamService } from "Services/TeamService";

import { CopyHelper } from "Helpers/CopyHelper";
import { LogBuilder } from "Helpers/LogBuilder";
const Log = LogBuilder.create("Team expansion panel");

const ch: CopyHelper = new CopyHelper();

@autoinject
@containerless
export class TeamExpansionPanel {
  @bindable team: Team;
  teamDetails: Team = new Team();

  teamInvites: TeamInvite[] = [];

  @bindable deleteCallback;
  @bindable editCallback;

  @bindable open: boolean | string;

  isAdmin: boolean = false;
  userProfile: UserProfile;

  constructor(
    private teamService: TeamService,
    private eventAggregator: EventAggregator,
    private userInformation: UserInformation,
    private dialogService: DialogService,
  ) {}

  bind() {
    this.teamService.fetchTeamDetailsById(this.team.id).then(async (teamDetails) => {
      this.teamDetails = teamDetails;
      await this.checkIfAdmin();
      if (this.isAdmin) {
        this.teamService.fetchTeamInvites(this.team).then((invites) => {
          this.teamInvites = invites;
          Log.debug("Invites for team", invites);
        });
      }
    });
    return this.userInformation.fetchUserProfile().then((userProfile) => {
      this.userProfile = userProfile;
    });
  }

  createNewInvite() {
    this.teamService.createNewInvite(this.team).then((invite) => {
      Log.debug("New invite", invite);
      this.teamInvites.push(invite);
      this.eventAggregator.publish("global:message", {
        body: "Invite created",
      });
    });
  }

  deleteInvite(inviteToDelete: TeamInvite) {
    this.teamService.deleteInvite(this.team, inviteToDelete).then(() => {
      this.teamInvites = this.teamInvites.filter((invite) => {
        return invite.code !== inviteToDelete.code;
      });
      this.eventAggregator.publish("global:message", {
        body: "Invite deleted",
      });
    });
  }

  updateMember(memberToBeUpdated: TeamMember) {
    this.teamService.updateTeamMember(this.team, memberToBeUpdated).then(() => {
      this.teamService.fetchTeamDetailsById(this.team.id).then((teamDetails) => {
        this.teamDetails = teamDetails;
        this.eventAggregator.publish("global:message", {
          body: "Team member updated",
        });
      });
    });
  }

  removeMember(memberToBeRemoved: TeamMember) {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/message/messageDialog"),
        model: {
          messageHeader: `Remove member?`,
          message: `Are you sure you want to remove the member? The member will lose all access and privileges.`,
          confirmButtonText: "Remove",
          cancelButtonText: "Cancel",
        },
      })
      .whenClosed((response) => {
        Log.debug("Response from returned dialog", response);
        if (!response.wasCancelled) {
          this.teamService.removeTeamMember(this.team, memberToBeRemoved).then(() => {
            this.eventAggregator.publish("global:message", {
              body: "Member removed",
            });
          });
          this.team.members = this.team.members.filter(
            (member) => member.connectId !== memberToBeRemoved.connectId,
          );
        }
      });
  }

  copyCode(invite: TeamInvite) {
    ch.copyToClipBoard(invite.code).then(() => {
      this.eventAggregator.publish("global:message", {
        body: "Code copied to clipboard",
      });
    });
  }

  editTeam() {
    this.editCallback({
      team: this.team,
    });
  }

  deleteTeam() {
    this.deleteCallback({
      team: this.team,
    });
  }

  isSelf(member: TeamMember) {
    return member.connectId === this.userProfile.connectId;
  }

  private async checkIfAdmin() {
    const userProfile = await this.userInformation.fetchUserProfile();
    this.isAdmin =
      this.teamDetails.members.find(
        (member) => member.role === "Admin" && member.connectId === userProfile.connectId,
      ) !== undefined;
  }
}
