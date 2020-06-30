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

interface UserProfileDto {
  connectId: string;
  email: string;
  verifiedEmail: boolean;
  verifiedPhone: boolean;
  phone: string;
  avatarUrl: string;
  profileUrl: string;
  githubLogin: string;
  name: string;
  provider: "github" | "connect";
  logoutUrl: string;
}

export class UserProfile {
  /**
   * Returns a new UserProfile from a dto
   */
  static newFromDto(dto: UserProfileDto): UserProfile {
    return new UserProfile({
      connectdId: dto.connectId,
      email: dto.email,
      verifiedEmail: dto.verifiedEmail,
      verifiedPhone: dto.verifiedPhone,
      phone: dto.phone,
      avatarUrl: dto.avatarUrl,
      profileUrl: dto.profileUrl,
      githubLogin: dto.githubLogin,
      name: dto.name,
      provider: dto.provider,
      logoutUrl: dto.logoutUrl,
    });
  }

  connectId: string;
  email: string;
  verifiedEmail: boolean;
  verifiedPhone: boolean;
  avatarUrl: string;
  profileUrl: string;
  githubLogin: string;
  phone: string;
  name: string;
  provider: string;
  logoutUrl: string;

  constructor({
    connectdId = "",
    email = "",
    verifiedEmail = false,
    verifiedPhone = false,
    avatarUrl = "",
    profileUrl = "",
    githubLogin = "",
    phone = "",
    name = "",
    provider = "connect",
    logoutUrl = "",
  } = {}) {
    this.connectId = connectdId;
    this.email = email;
    this.verifiedEmail = verifiedEmail;
    this.verifiedPhone = verifiedPhone;
    this.avatarUrl = avatarUrl;
    this.profileUrl = profileUrl;
    this.githubLogin = githubLogin;
    this.phone = phone;
    this.name = name;
    this.provider = provider;
    this.logoutUrl = logoutUrl;
  }
}
