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

declare global {
  interface Window {
    particlesJS: any;
  }
}

export class Login {
  loginConnect() {
    document.location.href = this.getConnectLoginUrl();
  }

  loginGithub() {
    document.location.href = this.getGithubLoginUrl();
  }

  logout() {
    document.location.href = this.getLogoutUrl();
  }

  goToDocs() {
    window.open("https://docs.nbiot.engineering", "_blank");
  }

  goToShop() {
    window.open("https://shop.exploratory.engineering", "_blank");
  }

  goToTutorials() {
    window.open("https://docs.nbiot.engineering", "_blank");
  }

  getConnectLoginUrl(): string {
    return `${HORDE_ENDPOINT}/connect/login`;
  }

  getGithubLoginUrl(): string {
    return `${HORDE_ENDPOINT}/github/login`;
  }

  getLogoutUrl(): string {
    return `${HORDE_ENDPOINT}/connect/logout`;
  }

  attached() {
    if (window.particlesJS) {
      window.particlesJS("particles-js", {
        particles: {
          number: {
            value: 120,
            density: {
              enable: true,
              value_area: 800,
            },
          },
          color: {
            value: "#ffffff",
          },
          shape: {
            type: "circle",
            stroke: {
              width: 0,
              color: "#000000",
            },
            polygon: {
              nb_sides: 5,
            },
          },
          opacity: {
            value: 0.5,
            random: false,
            anim: {
              enable: false,
              speed: 1,
              opacity_min: 0.1,
              sync: false,
            },
          },
          size: {
            value: 3,
            random: true,
            anim: {
              enable: false,
              speed: 40,
              size_min: 0.1,
              sync: false,
            },
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: "#ffffff",
            opacity: 0.4,
            width: 1,
          },
        },
        retina_detect: true,
      });
    }
  }
}
