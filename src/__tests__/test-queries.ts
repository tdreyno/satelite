import { collect, IFact, not, placeholder as _, Rete } from "../index";
import DATA_SET from "./facts";

const { query, assert } = new Rete();

for (let i = 0; i < DATA_SET.length; i++) {
  assert(DATA_SET[i] as IFact);
}

// function campaigns() {
//   const projectCampaigns = [];
//   const campaignIDs = [];
//   this.projects.map((item) => {
//     if (item.campaign && item.campaign.id) {
//       if (!campaignIDs.includes(item.campaign.id)) {
//         campaignIDs.push(item.campaign.id);
//         projectCampaigns.push({
//           id: item.campaign.id,
//           name: item.campaign.name,
//         });
//       }
//     }
//   });

//   return projectCampaigns;
// }

query(collect("?campaigns", ["?id", "campaign/slug", _]));

// function projectsWithoutCampaigns()[]; {
//   const projectsNoCampaign = [];
//   this.projects.map((item) => {
//     if (!item.campaign || !item.campaign.id) {
//       projectsNoCampaign.push(item);
//     }
//   });

//   return projectsNoCampaign;
// }

query(
  collect(
    "?projects",
    ["?id", "project/slug", _],
    not(["?id", "project/campaign", _])
  )
);

// function projectsAndCampaigns() {
//   const projectsAndCampaignsArray = [];
//   this.campaigns.map((itemCampaign) => {
//     const campaignRegions = this.getCampaignData(item.id).regions;
//     const campaignProjects = this.getProjectsOfCampaign(item.id);
//     projectsAndCampaignsArray.push({
//       isCampaign: true,
//       id: item.id,
//       title: item.name,
//       projectCount: campaignProjects.length,
//       regionCount: campaignRegions.length,
//       hasError: false,
//     });
//   });
//   this.projects.map((item) => {
//     if (!item.campaign || !item.campaign.id) {
//       projectsAndCampaignsArray.push(item);
//     }
//   });
//   sortObjectsByStringColumns(projectsAndCampaignsArray, ["title"]);

//   return projectsAndCampaignsArray;
// }

query(
  collect(
    "?projectsAndCampaigns",
    collect("?projects", [_, "project/slug", _]),
    collect("?campaigns", [_, "campaign/slug", _])
  )
);

// function allProjects() {
//   const projectsAndCampaignsArray = this.campaigns
//     .map((itemCampaign) => {
//       const campaignRegions = this.getCampaignData(item.id).regions;
//       const campaignProjects = this.getProjectsOfCampaign(item.id);

//       return {
//         isCampaign: true,
//         id: item.id,
//         title: item.name,
//         projectCount: campaignProjects.length,
//         regionCount: campaignRegions.length,
//       } as IProject;
//     })
//     // Slice is used in order to return a usable array https://github.com/mobxjs/mobx/issues/460
//     .concat(this.projects.slice());
//   sortObjectsByStringColumns(projectsAndCampaignsArray, ["title"]);

//   return projectsAndCampaignsArray;
// }

query(collect("?projects", ["?id", "project/slug", _]));

// function getOutcomeLink(outcomeKey) {
//   let link = "";
//   let i = 0;
//   while (link === "" && i < this.projects.length) {
//     if (this.projects[i].outcome.name === outcomeKey) {
//       link = this.projects[i].outcome.link;
//     }
//     i++;
//   }

//   return link;
// }

const outcomeKey = "somekey";
query(
  ["?outcome", "projectOutcome/name", outcomeKey],
  ["?outcome", "projectOutcome/link", "?link"]
);

// function projectOutcomes() {
//   const outcomeKeys = this.uniqueValue("outcome.name");
//   const outcomesOutcomes  = outcomeKeys.map(outcomeName => {
//     const outcomeOutcomes = {
//       name: outcomeName,
//       nameLabel: this.label(`outcome.name.${outcomeName}`),
//       regionsList: [],
//       regions: 0,
//       budget: 0,
//       owner: null,
//       link: this.getOutcomeLink(outcomeName),
//       projects: [],
//     };

//     return outcome;
//   });
//   this.projects.map((item) => {
//     outcomeKeys.map((outcomeName, key) => {
//       if (outcomeName === item.outcome.name) {
//         outcomes[key].owner = outcomes[key].owner
//           ? outcomes[key].owner
//           : { id: item.outcome.owner.id, name: item.outcome.owner.name };
//         outcomes[key].budget += item.budget;
//         if (outcomes[key].projects.indexOf(item) === -1) {
//           outcomes[key].projects.push(item);
//         }

//         if (outcomes[key].regionsList.indexOf(item.region) === -1) {
//           outcomes[key].regionsList.push(item.region);
//           outcomes[key].regions = outcomes[key].regionsList.length;
//         }
//       }
//     });
//   });
//   // sort alpha by nameLabel
//   sortObjectsByStringColumns(outcomes, ["nameLabel"]);

//   return outcomes;
// }

query(["?id", "projectOutcome/slug", _]);

// function projectRegions() {
//   const regionKeys = this.uniqueValue("region");
//   const regionsRegions = regionKeys.map(regionName => {
//     const regionRegions = {
//       name: regionName,
//       nameLabel: this.label(`region.${regionName}`),
//       budget: 0,
//       projects: [],
//       markets: 0,
//     };

//     return region;
//   });
//   this.projects.map((item) => {
//     regionKeys.map((regionName, key) => {
//       if (regionName === item.region) {
//         regions[key].budget += item.budget;
//         if (regions[key].projects.indexOf(item) === -1) {
//           regions[key].projects.push(item);
//         }
//       }
//     });
//   });
//   regions.forEach((objRegions) => {
//     const marketCount = this.uniqueValue("market", obj.projects);
//     obj.markets = toJS(marketCount).length;
//   });

//   return regions;
// }

query(["?id", "projectRegion/slug", _]);

// function projectPhases() {
//   const phaseKeys = this.uniqueValue("status");
//   const phasesPhases = phaseKeys.map(phaseName => {
//     const regionPhases = {
//       name: phaseName,
//       nameLabel: projectPhases[phaseName].label,
//       regionsList: [],
//       regions: 0,
//       budget: 0,
//       projects: [],
//     };

//     return region;
//   });
//   this.projects.map((item) => {
//     phaseKeys.map((phaseName, key) => {
//       if (phaseName === item.status) {
//         phases[key].budget += item.budget;
//         if (phases[key].regionsList.indexOf(item.region) === -1) {
//           phases[key].regionsList.push(item.region);
//           phases[key].regions = phases[key].regionsList.length;
//         }
//         if (phases[key].projects.indexOf(item) === -1) {
//           phases[key].projects.push(item);
//         }
//       }
//     });
//   });

//   return phases;
// }

query(["?id", "projectPhase/slug", _]);

// function projectCategories() {
//   const uniqueOwners = this.uniqueValue("owner.id", this.projects);
//   const uniqueMembers = this.uniqueValue("teamMembers.id", this.projects);
//   const uniqueOutcomeOwners = this.uniqueValue(
//     "outcome.owner.id",
//     this.projects,
//   );
//   const allPeople = uniqueOwners.concat(uniqueMembers, uniqueOutcomeOwners);
//   const allPeopleUnique = Array.from(new Set(allPeople));
//   const allPeopleUniqueSum = allPeopleUnique.length;

//   const categoriesCategories = {
//     outcomes: {
//       name: this.label("outcome"),
//       value: this.uniqueValue("outcome.name").length,
//     },
//     regions: {
//       name: this.label("region"),
//       value: this.uniqueValue("region").length,
//     },
//     people: { name: this.label("people"), value: allPeopleUniqueSum },
//     phases: {
//       name: this.label("projectPhases"),
//       value: this.uniqueValue("status").length,
//     },
//     all: { name: this.label("allProjects"), value: this.projects.length },
//   };

//   return categories;
// }

query(
  collect("?outcomes", [_, "projectOutcome/slug", _]),
  collect("?regions", [_, "projectRegion/slug", _]),
  collect("?people", [_, "person/slug", _]),
  collect("?phases", [_, "projectPhase/slug", _]),
  collect("?all", [_, "project/slug", _])
);

// function getCampaignData(campaignID) {
//   let campaignName = "";
//   this.campaigns.map((itemCampaign) => {
//     if (item.id === campaignID) {
//       campaignName = item.name;
//     }
//   });

//   const regionArray = [];
//   const campaignProjects = this.getProjectsOfCampaign(campaignID);
//   campaignProjects.forEach((obj) => {
//     if (!regionArray.includes(obj.region)) {
//       regionArray.push(obj.region);
//     }
//   });

//   return { name: campaignName, regions: regionArray };
// }

const campaignID = "some_id";
query(
  [campaignID, "campaign/name", "?name"],
  collect(
    "?regions",
    "?regionId",
    ["?projectId", "project/campaign", campaignID],
    ["?projectId", "project/region", "?regionId"]
  )
);

// function getProjectsOfCampaign(campaignID) {
//   const projectsOfCampaign = [];
//   this.projects.map((item) => {
//     if (item.campaign && item.campaign.id === campaignID) {
//       projectsOfCampaign.push(item);
//     }
//   });

//   return projectsOfCampaign;
// }

query(
  collect("?regions", "?projectId", [
    "?projectId",
    "project/campaign",
    campaignID
  ])
);

// function getProjectRegionMarkets(regionID) {
//   const regionMarketsRegionMarkets  = [];
//   this.projectRegions.map(item => {
//     if (item.name === regionID) {
//       const marketKeys = this.uniqueValue("market", item.projects);
//       regionMarkets = marketKeys.map(name => {
//         const regionMarketRegionMarkets = {
//           name,
//           budget: 0,
//           projects: [],
//         };

//         return regionMarket;
//       });
//       item.projects.map((project) => {
//         regionMarkets.map((market, key) => {
//           if (project.market === market.name) {
//             regionMarkets[key].budget += project.budget;
//             regionMarkets[key].projects.push(project);
//           }
//         });
//       });
//     }
//   });

//   return regionMarkets;
// }

const regionId = "some_id";
query(
  collect(
    "?markets",
    "?marketId",
    ["?regionId", "projectRegions/slug", regionId],
    ["?projectId", "project/region", "?regionId"],
    ["?projectId", "projectRegion/market", "?marketId"]
  )
);

// function projectPeople() {
//   const peopleKeys = [];
//   const uniqueOwners = this.uniqueValue("owner.id", this.projects);
//   const uniqueMembers = this.uniqueValue("teamMembers.id", this.projects);
//   const uniqueOutcomeOwners = this.uniqueValue(
//     "outcome.owner.id",
//     this.projects,
//   );

//   uniqueOwners.forEach((id) => {
//     if (peopleKeys.indexOf(id) === -1) {
//       peopleKeys.push(id);
//     }
//   });
//   uniqueMembers.forEach((id) => {
//     if (peopleKeys.indexOf(id) === -1) {
//       peopleKeys.push(id);
//     }
//   });
//   uniqueOutcomeOwners.forEach((id) => {
//     if (peopleKeys.indexOf(id) === -1) {
//       peopleKeys.push(id);
//     }
//   });

//   const peoplePersons  = peopleKeys.map(personID => {
//     const personPersons = {
//       id: personID,
//       name: "",
//       projects: [],
//       regionsList: [],
//       regions: 0,
//       budget: 0,
//       projectTeam: "",
//       jobTitle: "",
//       teamid: "",
//       teamSlug: personID,
//     };
//     this.projects.map(project => {
//       let personOnProject: boolean = false;
//       // check for owner
//       if (project.owner.id === personID && !personOnProject) {
//         personOnProject = true;
//         person.name = project.owner.name;
//         person.budget += project.budget;
//         if (person.regionsList.indexOf(project.region) === -1) {
//           person.regionsList.push(project.region);
//         }
//         if (person.projects.indexOf(project) === -1) {
//           person.projects.push(project);
//         }
//       }

//       // check for outcome owner
//       if (!personOnProject && project.outcome.owner.id === personID) {
//         personOnProject = true;
//         person.name = project.outcome.owner.name;
//         person.budget += project.budget;
//         if (person.regionsList.indexOf(project.region) === -1) {
//           person.regionsList.push(project.region);
//         }
//         if (person.projects.indexOf(project) === -1) {
//           person.projects.push(project);
//         }
//       }

//       // if not owner check for teamMember
//       if (!personOnProject) {
//         project.teamMembers.map(member => {
//           if (member.id === personID && !personOnProject) {
//             personOnProject = true;
//             person.name = member.name;
//             person.title = member.title;
//             person.budget += project.budget;
//             person.projectTeam = member.projectTeam;
//             person.jobTitle = member.jobTitle;
//             person.teamSlug = member.teamSlug;
//             if (person.regionsList.indexOf(project.region) === -1) {
//               person.regionsList.push(project.region);
//             }
//             if (person.projects.indexOf(project) === -1) {
//               person.projects.push(project);
//             }
//           }
//         });
//       }

//       person.regions = person.regionsList.length;
//     });

//     return person;
//   });
//   // sort alpha by name
//   sortObjectsByStringColumns(people, ["name"]);

//   return people;
// }

query(collect("?people", ["?", "people/slug", _]));

// function projectTeams() {
//   const teamKeys = this.uniqueValue("teamMembers.teamSlug");
//   const teamsTeams  = teamKeys.map(teamSLUG => {
//     const teamTeams = {
//       id: teamSLUG,
//       name: "",
//       jobTitle: "",
//       projectTeam: "",
//       projects: [],
//       teamid: teamSLUG,
//       teamSlug: teamSLUG,
//       regions: 0,
//       budget: 0,
//       regionsList: [],
//     };

//     this.projects.map((project) => {
//       teamKeys.map((teamSLUGs, key) => {
//         project.teamMembers.map(member => {
//           if (member.teamSlug === teamSLUG) {
//             team.name = member.name;
//             team.title = member.title;
//             team.budget += project.budget;
//             team.projectTeam = member.projectTeam;
//             team.jobTitle = member.jobTitle;
//             team.teamid = member.teamid;
//             team.teamSlug = member.teamSlug;
//             if (team.regionsList.indexOf(project.region) === -1) {
//               team.regionsList.push(project.region);
//             }
//             if (team.projects.indexOf(project) === -1) {
//               team.projects.push(project);
//             }
//           }
//         });
//       });
//     });

//     return team;
//   });
//   // sort alpha by nameLabel
//   sortObjectsByStringColumns(teams, ["projectTeam"]);

//   return teams;
// }

query(collect("?teams", "?id", ["?id", "team/slug", _]));

// function getTeamProjects(teamID) {
//   const returnTeamProjectsTeams  = [];
//   this.projectTeams.map((objTeams) => {
//     if (obj.teamSlug === teamID) {
//       returnTeamProjects.push(obj);
//     }
//   });

//   return returnTeamProjects;
// }

const teamId = "some_id";
query([teamId, "team/slug", _]);
