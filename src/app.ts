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

import { autoinject } from "aurelia-framework";
import { NavigationInstruction } from "aurelia-router";
import { Redirect, Router, RouterConfiguration } from "aurelia-router";
import { BindingSignaler } from "aurelia-templating-resources";

import { routes } from "appRoutes";
import { UserInformation } from "Helpers/UserInformation";

import { LogBuilder } from "Helpers/LogBuilder";

const Log = LogBuilder.create();

@autoinject
export class App {
  router: Router;

  UPDATE_TIME_INTERVAL_MS: number = 10000;

  constructor(
    private userInformation: UserInformation,
    private signaler: BindingSignaler,
    router: Router,
  ) {
    this.router = router;
    setInterval(() => {
      this.signaler.signal("updateTime");
    }, this.UPDATE_TIME_INTERVAL_MS);
  }

  configureRouter(config: RouterConfiguration) {
    config.title = "Telenor NB-IoT";
    config.options.pushState = true;
    config.map(routes);
    config.fallbackRoute("not-found");
    config.mapUnknownRoutes("not-found");
    config.addAuthorizeStep(new AuthorizeStep(this.userInformation));
  }
}

class AuthorizeStep {
  constructor(private userInformation: UserInformation) {}

  run(navigationInstruction: NavigationInstruction, next) {
    if (navigationInstruction.getAllInstructions().some((i) => i.config.settings.auth)) {
      Log.debug(
        "Auth protected route",
        navigationInstruction,
        "Profile",
        this.userInformation.userProfile,
      );

      return this.userInformation
        .fetchUserProfile()
        .then(() => {
          return next();
        })
        .catch((err) => {
          return next.cancel(new Redirect("login"));
        });
    } else {
      return next();
    }
  }
}
