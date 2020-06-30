import { autoinject, bindable, BindingEngine, Disposable } from "aurelia-framework";
import { TeamMember } from "Models/Team";

@autoinject
export class TeamExpansionPanelMemberRow {
  @bindable member: TeamMember;
  @bindable isSelf: boolean = false;
  @bindable isAdmin: boolean = false;

  @bindable removeMemberCallback;
  @bindable updateMemberCallback;
  subscription: Disposable;

  availableRoles = [
    {
      id: "Member",
      value: "Member",
    },
    {
      id: "Admin",
      value: "Admin",
    },
  ];

  constructor(private bindingEngine: BindingEngine) {}

  bind() {
    this.subscription = this.bindingEngine.propertyObserver(this.member, "role").subscribe(() => {
      this.updateMember();
    });
  }

  unbind() {
    this.subscription.dispose();
  }

  removeMember() {
    this.removeMemberCallback({
      member: this.member,
    });
  }

  updateMember() {
    this.updateMemberCallback({
      member: this.member,
    });
  }
}
