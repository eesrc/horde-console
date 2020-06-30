import { autoinject } from "aurelia-framework";
import { ApiClient } from "Helpers/ApiClient";
import { Token } from "Models/Token";

export * from "Models/Token";

import { LogBuilder } from "Helpers/LogBuilder";
const Log = LogBuilder.create("Token service");

@autoinject
export class TokenService {
  constructor(private apiClient: ApiClient) {}

  fetchAllTokens(): Promise<Token[]> {
    return this.apiClient.http
      .get("/tokens")
      .then((data) => data.content.tokens)
      .then((tokens) => tokens.map(Token.newFromDto));
  }

  createToken(token: Token): Promise<Token> {
    return this.apiClient.http
      .post("/tokens", Token.toDto(token))
      .then((data) => data.content)
      .then((newToken) => {
        return Token.newFromDto(newToken);
      });
  }

  updateToken(token: Token): Promise<Token> {
    const tokenDto = Token.toDto(token);
    delete tokenDto.token;

    return this.apiClient.http
      .patch(`/tokens/${token.token}`, tokenDto)
      .then((data) => data.content)
      .then((newToken) => {
        return Token.newFromDto(newToken);
      });
  }

  deleteToken(token: Token): Promise<any> {
    return this.apiClient.http.delete(`/tokens/${token.token}`).then(() => {
      Log.debug("Delete successful");
    });
  }
}
