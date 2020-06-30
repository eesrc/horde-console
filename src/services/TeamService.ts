import { autoinject } from "aurelia-framework";
import { ApiClient } from "Helpers/ApiClient";
import { Team, TeamInvite, TeamMember } from "Models/Team";

export { BadRequestError, NotFoundError, ConflictError } from "Helpers/ResponseHandler";
export * from "Models/Team";

@autoinject
export class TeamService {
  constructor(private apiClient: ApiClient) {}

  fetchAllTeams(): Promise<Team[]> {
    return this.apiClient.http
      .get("/teams")
      .then((data) => data.content.teams)
      .then((teams) => teams.map(Team.newFromDto));
  }

  fetchTeamDetailsById(id: string): Promise<Team> {
    return this.apiClient.http
      .get(`/teams/${id}`)
      .then((data) => data.content)
      .then((team) => Team.newFromDto(team));
  }

  createNewTeam(team: Team): Promise<Team> {
    return this.apiClient.http
      .post("/teams", Team.toDto(team))
      .then((data) => data.content)
      .then((teamDto) => Team.newFromDto(teamDto));
  }

  updateTeam(team: Team): Promise<Team> {
    return this.apiClient.http
      .patch(`/teams/${team.id}`, Team.toDto(team))
      .then((data) => data.content)
      .then((teamDto) => Team.newFromDto(teamDto));
  }

  deleteTeam(team: Team): Promise<any> {
    return this.apiClient.http.delete(`/teams/${team.id}`);
  }

  fetchTeamInvites(team: Team): Promise<TeamInvite[]> {
    return this.apiClient.http
      .get(`/teams/${team.id}/invites`)
      .then((data) => data.content.invites);
  }

  createNewInvite(team: Team): Promise<TeamInvite> {
    return this.apiClient.http.post(`/teams/${team.id}/invites`, {}).then((data) => data.content);
  }

  deleteInvite(team: Team, invite: TeamInvite): Promise<any> {
    return this.apiClient.http.delete(`/teams/${team.id}/invites/${invite.code}`);
  }

  redeemInvite(code: string): Promise<any> {
    return this.apiClient.http.post(`/teams/accept`, {
      code: code,
    });
  }

  updateTeamMember(team: Team, teamMember: TeamMember): Promise<TeamMember> {
    return this.apiClient.http
      .patch(`/teams/${team.id}/members/${teamMember.id}`, teamMember)
      .then((data) => data.content)
      .then((teamMemberDto) => Team.newTeamMemberFromDto(teamMemberDto));
  }

  removeTeamMember(team: Team, teamMember: TeamMember): Promise<any> {
    return this.apiClient.http.delete(`/teams/${team.id}/members/${teamMember.id}`);
  }
}
