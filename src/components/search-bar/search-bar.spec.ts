import {
  CollectionServiceMock,
  DeviceServiceMock,
  EventAggregatorMock,
  RouterMock,
  TeamServiceMock,
} from "Test/mock/mocks";

import { EventAggregator } from "aurelia-event-aggregator";
import { Router } from "aurelia-router";
import { Collection, CollectionService } from "Services/CollectionService";
import { DeviceService } from "Services/DeviceService";
import { Team, TeamService } from "Services/TeamService";
import { SearchBar } from "./search-bar";

describe("Search bar", () => {
  let searchbar: SearchBar;

  let deviceServiceMock: DeviceServiceMock;
  let collectionServiceMock: CollectionServiceMock;
  let teamServiceMock: TeamServiceMock;

  let eventAggregatorMock: EventAggregatorMock;
  let routerMock: RouterMock;

  beforeEach(() => {
    deviceServiceMock = new DeviceServiceMock();
    collectionServiceMock = new CollectionServiceMock();
    teamServiceMock = new TeamServiceMock();

    eventAggregatorMock = new EventAggregatorMock();
    routerMock = new RouterMock();

    searchbar = new SearchBar(
      (deviceServiceMock as unknown) as DeviceService,
      (teamServiceMock as unknown) as TeamService,
      (collectionServiceMock as unknown) as CollectionService,
      (routerMock as unknown) as Router,
      (eventAggregatorMock as unknown) as EventAggregator,
    );
  });

  it("should subscribe to router navigation on bind", () => {
    const spy = spyOn(eventAggregatorMock, "subscribe");
    searchbar.bind();

    expect(spy).toHaveBeenCalledWith("router:navigation:success", jasmine.anything());
  });

  it("should fetch teams and collections on searchTerm changed", () => {
    const teamSpy = spyOn(teamServiceMock, "fetchAllTeams").and.callThrough();
    const collectionSpy = spyOn(collectionServiceMock, "fetchAllCollections").and.callThrough();
    const deviceSpy = spyOn(deviceServiceMock, "fetchCollectionDevices").and.callThrough();

    searchbar.searchTermChanged("testSearch");

    expect(teamSpy).toHaveBeenCalled();
    expect(collectionSpy).toHaveBeenCalled();
    expect(deviceSpy).not.toHaveBeenCalled();
  });

  it("should not fetch resrouces if searchTerm changed to empty string", () => {
    const teamSpy = spyOn(teamServiceMock, "fetchAllTeams").and.callThrough();
    const collectionSpy = spyOn(collectionServiceMock, "fetchAllCollections").and.callThrough();
    const deviceSpy = spyOn(deviceServiceMock, "fetchCollectionDevices").and.callThrough();

    searchbar.searchTermChanged("");

    expect(teamSpy).not.toHaveBeenCalled();
    expect(collectionSpy).not.toHaveBeenCalled();
    expect(deviceSpy).not.toHaveBeenCalled();
  });

  it("should fetch devices, teams and collections on searchTerm changed and params includes collection id", () => {
    const teamSpy = spyOn(teamServiceMock, "fetchAllTeams").and.callThrough();
    const collectionSpy = spyOn(collectionServiceMock, "fetchAllCollections").and.callThrough();
    const deviceSpy = spyOn(deviceServiceMock, "fetchCollectionDevices").and.callThrough();

    searchbar.currentNavigationParams = { collectionId: "1234" };
    searchbar.searchTermChanged("testSearch");

    expect(teamSpy).toHaveBeenCalled();
    expect(collectionSpy).toHaveBeenCalled();
    expect(deviceSpy).toHaveBeenCalled();
  });

  it("should normalize search term upon change", () => {
    searchbar.searchTermChanged("TeSt");
    expect(searchbar.normalizedSearchParam).toBe("test");

    searchbar.searchTermChanged("  spaces around  ");
    expect(searchbar.normalizedSearchParam).toBe("spaces around");

    searchbar.searchTermChanged('Test normal search "with quotes"');
    expect(searchbar.normalizedSearchParam).toBe('test normal search "with quotes"');
  });

  it("should toggle loading upon searching the backend", async (done) => {
    expect(searchbar.loading).toBe(false);
    const searchRes = searchbar.searchTermChanged("Something");
    expect(searchbar.loading).toBe(true);
    await searchRes;
    expect(searchbar.loading).toBe(false);
    done();
  });

  describe("searching", () => {
    describe("teams", () => {
      it("should return matches on tag value", async (done) => {
        spyOn(teamServiceMock, "fetchAllTeams").and.returnValue(
          Promise.resolve([
            new Team({ tags: { name: "Test 1" } }),
            new Team({ tags: { name: "Test 2" } }),
            new Team({ tags: { name: "Test 3" } }),
          ]),
        );

        await searchbar.searchTermChanged("Test 2");

        expect(searchbar.teamResults.length).toBe(1);
        done();
      });

      it("should return matches on id", async (done) => {
        spyOn(teamServiceMock, "fetchAllTeams").and.returnValue(
          Promise.resolve([
            new Team({ id: "12345" }),
            new Team({ id: "abcdef" }),
            new Team({ id: "67890+" }),
          ]),
        );

        await searchbar.searchTermChanged("67890+");

        expect(searchbar.teamResults.length).toBe(1);
        done();
      });

      it("should allow for partial match", async (done) => {
        spyOn(teamServiceMock, "fetchAllTeams").and.returnValue(
          Promise.resolve([
            new Team({ tags: { name: "Test 1" } }),
            new Team({ tags: { name: "Test 2" } }),
            new Team({ tags: { name: "Something else" } }),
          ]),
        );

        await searchbar.searchTermChanged("Test");

        expect(searchbar.teamResults.length).toBe(2);
        done();
      });
    });

    describe("collections", () => {
      it("should return matches on tag value", async (done) => {
        spyOn(collectionServiceMock, "fetchAllCollections").and.returnValue(
          Promise.resolve([
            new Collection({ tags: { name: "Test 1" } }),
            new Collection({ tags: { name: "Test 2" } }),
            new Collection({ tags: { name: "Test 3" } }),
          ]),
        );

        await searchbar.searchTermChanged("Test 2");

        expect(searchbar.collectionResults.length).toBe(1);
        done();
      });

      it("should return matches on id", async (done) => {
        spyOn(collectionServiceMock, "fetchAllCollections").and.returnValue(
          Promise.resolve([
            new Collection({ id: "12345" }),
            new Collection({ id: "abcdef" }),
            new Collection({ id: "67890+" }),
          ]),
        );

        await searchbar.searchTermChanged("67890+");

        expect(searchbar.collectionResults.length).toBe(1);
        done();
      });

      it("should allow for partial match", async (done) => {
        spyOn(collectionServiceMock, "fetchAllCollections").and.returnValue(
          Promise.resolve([
            new Collection({ tags: { name: "Test 1" } }),
            new Collection({ tags: { name: "Test 2" } }),
            new Collection({ tags: { name: "Something else" } }),
          ]),
        );

        await searchbar.searchTermChanged("Test");

        expect(searchbar.collectionResults.length).toBe(2);
        done();
      });
    });

    describe("devices", () => {
      beforeEach(() => {
        searchbar.currentNavigationParams = {
          collectionId: "someId",
        };
      });

      it("should return matches on tag value", async (done) => {
        spyOn(deviceServiceMock, "fetchCollectionDevices").and.returnValue(
          Promise.resolve([
            new Collection({ tags: { name: "Test 1" } }),
            new Collection({ tags: { name: "Test 2" } }),
            new Collection({ tags: { name: "Test 3" } }),
          ]),
        );

        await searchbar.searchTermChanged("Test 2");

        expect(searchbar.deviceResults.length).toBe(1);
        done();
      });

      it("should return matches on id", async (done) => {
        spyOn(deviceServiceMock, "fetchCollectionDevices").and.returnValue(
          Promise.resolve([
            new Collection({ id: "12345" }),
            new Collection({ id: "abcdef" }),
            new Collection({ id: "67890+" }),
          ]),
        );

        await searchbar.searchTermChanged("67890+");

        expect(searchbar.deviceResults.length).toBe(1);
        done();
      });

      it("should allow for partial match", async (done) => {
        spyOn(deviceServiceMock, "fetchCollectionDevices").and.returnValue(
          Promise.resolve([
            new Collection({ tags: { name: "Test 1" } }),
            new Collection({ tags: { name: "Test 2" } }),
            new Collection({ tags: { name: "Something else" } }),
          ]),
        );

        await searchbar.searchTermChanged("Test");

        expect(searchbar.deviceResults.length).toBe(2);
        done();
      });
    });
  });

  describe("error handling", () => {
    it("should have error set to true upon error in search", async (done) => {
      spyOn(teamServiceMock, "fetchAllTeams").and.returnValue(Promise.reject());

      expect(searchbar.error).toBe(false);
      await searchbar.searchTermChanged("Test");
      expect(searchbar.error).toBe(true);
      done();
    });

    it("should have error set to false upon initiating new search", async (done) => {
      searchbar.error = true;
      await searchbar.searchTermChanged("Test");
      expect(searchbar.error).toBe(false);
      done();
    });
  });
});
