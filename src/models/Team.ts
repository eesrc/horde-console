type MemberRole = "Admin" | "Member";

export interface TeamMember {
  connectId: string;
  email: string;
  name: string;
  phone: string;
  id: string;
  role: MemberRole;
  verifiedEmail: boolean;
  verifiedPhone: boolean;
}

interface TeamMemberDto {
  connectId: string;
  email: string;
  name: string;
  phone: string;
  userId: string;
  role: MemberRole;
  verifiedEmail: boolean;
  verifiedPhone: boolean;
}

interface TeamDto {
  teamId: string;
  members?: TeamMemberDto[];
  private?: boolean;
  tags: { [tagName: string]: string };
}

export interface TeamInvite {
  code: string;
  createdAt: number;
}

export class Team implements TagEntity {
  static newFromDto(team: TeamDto): Team {
    return new Team({
      id: team.teamId,
      members: (team.members || []).map(Team.newTeamMemberFromDto),
      isPrivate: team.private || false,
      tags: team.tags,
    });
  }

  static toDto(team: Team): TeamDto {
    return {
      teamId: team.id,
      members: team.members.map(Team.toDtoTeamMember),
      private: team.isPrivate,
      tags: team.tags,
    };
  }

  static newTeamMemberFromDto(teamMemberDto: TeamMemberDto): TeamMember {
    return {
      id: teamMemberDto.userId,
      role: teamMemberDto.role,
      connectId: teamMemberDto.connectId,
      email: teamMemberDto.email,
      name: teamMemberDto.name,
      phone: teamMemberDto.phone,
      verifiedEmail: teamMemberDto.verifiedEmail,
      verifiedPhone: teamMemberDto.verifiedPhone,
    };
  }

  static toDtoTeamMember(teamMember: TeamMember): TeamMemberDto {
    return {
      userId: teamMember.id,
      role: teamMember.role,
      connectId: teamMember.connectId,
      email: teamMember.email,
      name: teamMember.name,
      phone: teamMember.phone,
      verifiedEmail: teamMember.verifiedEmail,
      verifiedPhone: teamMember.verifiedPhone,
    };
  }

  id: string;
  members: TeamMember[];
  isPrivate: boolean;
  tags: { [tagName: string]: string };

  constructor({ id = "", members = [], isPrivate = false, tags = {} } = {}) {
    this.id = id;
    this.members = members;
    this.isPrivate = isPrivate;
    this.tags = tags;
  }
}
