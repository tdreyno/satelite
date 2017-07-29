const path = require("path");
const fs = require("fs");
const { omit } = require("lodash");
const { normalize, schema } = require("normalizr");

const data = fs.readFileSync(path.join(__dirname, "info.json")).toString();
const json = JSON.parse(data);

function cleanJoinTables(keys, entity) {
  keys.forEach(k => {
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

function omitEmptyFields(entity) {
  return Object.keys(entity).reduce((sum, key) => {
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
  }, {});
}

function cleanUnnecessaryPrefixes(entity, prefix) {
  return Object.keys(entity).reduce((sum, key) => {
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
  }, {});
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
    campaign: campaign,
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

      entity["projectStartDate"] = entity["projectStartDate"].date;
      entity["projectEndDate"] = entity["projectEndDate"].date;
      entity["budget"] = parseFloat(entity["budget"]);

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

const facts = [];
const ids = new Set(normalizedData.result);

Object.keys(normalizedData.entities).forEach(modelName => {
  Object.keys(normalizedData.entities[modelName]).forEach(modelId => {
    Object.keys(
      normalizedData.entities[modelName][modelId],
    ).forEach(modelAttribute => {
      facts.push([
        modelId,
        `${modelName}/${modelAttribute}`,
        normalizedData.entities[modelName][modelId][modelAttribute],
      ]);
    });
  });
});

fs.writeFileSync(path.join(__dirname, "facts.json"), JSON.stringify(facts));

console.log(`Wrote ${facts.length} facts`);