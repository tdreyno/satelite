import * as fs from "fs";
import each = require("lodash/each");
import omit = require("lodash/omit");
import { normalize, schema } from "normalizr";
import * as path from "path";
import { IFact } from "../Fact";

const data = fs.readFileSync(path.join(__dirname, "info.json")).toString();
const json = JSON.parse(data);

function cleanJoinTables<T extends any>(keys: string[], entity: T): T {
  each(keys, k => {
    if (
      entity[k] &&
      Object.keys(entity[k]).length === 1 &&
      entity[k].type === "Entries"
    ) {
      entity = omit(entity, k);
    } else if (entity[k] && entity[k].data) {
      entity[k] = Object.assign(
        { slug: entity[k].data[0].slug },
        entity[k].data[0].data,
      );
    }
  });

  return entity;
}

function omitEmptyFields<T extends any>(entity: T): T {
  return Object.keys(entity).reduce((sum: any, key) => {
    const value = entity[key];

    if (Array.isArray(value) && value.length === 0) {
      return sum;
    }

    if (typeof value === "string" && value.length === 0) {
      return sum;
    }

    if (value === null) {
      return sum;
    }

    sum[key] = value;
    return sum;
  }, {}) as T;
}

function cleanUnnecessaryPrefixes<T extends any>(entity: T, prefix: string): T {
  return Object.keys(entity).reduce((sum: any, key) => {
    const value = entity[key];

    if (key.startsWith(prefix)) {
      const newKey =
        key.slice(prefix.length, prefix.length + 1).toLowerCase() +
        key.slice(prefix.length + 1, key.length);

      sum[newKey] = value;
    } else {
      sum[key] = value;
    }

    return sum;
  }, {}) as T;
}

const campaign = new schema.Entity("campaign", undefined, {
  idAttribute: "slug",
  processStrategy: entity => {
    entity = omit(entity, "type");
    entity = omitEmptyFields(entity);
    entity = cleanUnnecessaryPrefixes(entity, "campaign");
    return entity;
  },
});

const projectRegion = new schema.Entity("projectRegion", undefined, {
  idAttribute: "slug",
  processStrategy: entity => {
    entity = omit(entity, "type");
    entity = omitEmptyFields(entity);
    entity = cleanUnnecessaryPrefixes(entity, "region");
    return entity;
  },
});

const team = new schema.Entity("team", undefined, {
  idAttribute: "slug",
  processStrategy: entity => {
    entity = omit(entity, "type");
    entity = omitEmptyFields(entity);
    return entity;
  },
});

const person = new schema.Entity(
  "person",
  {
    projectTeam: team,
  },
  {
    idAttribute: "slug",
    processStrategy: entity => {
      entity = omit(entity, "type");
      entity = omitEmptyFields(entity);
      return cleanJoinTables(["projectTeam"], entity);
    },
  },
);

const projectOutcome = new schema.Entity(
  "projectOutcome",
  {
    owner: person,
  },
  {
    idAttribute: "slug",
    processStrategy: entity => {
      entity = omit(entity, "type");
      entity = omitEmptyFields(entity);
      entity = cleanJoinTables(["outcomeOwner"], entity);
      entity = cleanUnnecessaryPrefixes(entity, "outcome");
      return entity;
    },
  },
);

const project = new schema.Entity(
  "project",
  {
    campaign,
    outcome: projectOutcome,
    region: projectRegion,
    owner: person,
  },
  {
    idAttribute: "slug",
    processStrategy: entity => {
      entity = omit(entity, "type");
      entity = omit(entity, "teamMembers");
      entity = omit(entity, "projectDocument");

      entity.projectStartDate = entity.projectStartDate.date;
      entity.projectEndDate = entity.projectEndDate.date;
      entity.budget = parseFloat(entity.budget);

      entity = omitEmptyFields(entity);

      entity = cleanJoinTables(
        ["campaign", "projectOutcome", "projectRegion", "projectOwner"],
        entity,
      );

      entity = cleanUnnecessaryPrefixes(entity, "project");

      return entity;
    },
  },
);

const normalizedData = normalize(json.data, [project]);

fs.writeFileSync(
  path.join(__dirname, "normalized.json"),
  JSON.stringify(normalizedData),
);

const facts: IFact[] = [];

each(Object.keys(normalizedData.entities), modelName => {
  const models = normalizedData.entities[modelName];

  each(Object.keys(models), modelId => {
    const model = models[modelId];

    each(Object.keys(model), modelAttribute => {
      facts.push([
        modelId,
        `${modelName}/${modelAttribute}`,
        model[modelAttribute],
      ]);
    });
  });
});

fs.writeFileSync(
  path.join(__dirname, "facts.ts"),
  "export default " + JSON.stringify(facts),
);

// tslint:disable-next-line:no-console
console.log(`Wrote ${facts.length} facts`);
