import map = require("lodash/map");
import { IFact, makeIdentifier, placeholder as _, Rete } from "../index";
declare const fetch: (path: string) => Promise<any>;

const { assert, retract, query } = Rete.create();

const hasData = (v: boolean): IFact => [
  "articleModerators",
  "loader/hasData",
  v
];
const isFetching = (v: boolean): IFact => [
  "articleModerators",
  "loader/isFetching",
  v
];
const articleIdent = (id: string) => makeIdentifier("article/id", id);

const articleModeratorsScope = (id: string) => (v: string): IFact => [
  articleIdent(id),
  "article/moderators",
  v
];

// Action.
export async function load() {
  assert(isFetching(true));

  const json: { [articleId: string]: string[] } = await fetch(
    "/api/articleModerators"
  );

  assert(isFetching(false));

  const insertions = Object.keys(json).reduce(
    (sum, articleId) => {
      const userIds = json[articleId];
      return sum.concat(map(userIds, articleModeratorsScope(articleId)));
    },
    [] as IFact[]
  );

  assert(...insertions);
  assert(hasData(true));
}

export function updateArticleModerators(articleId: string, userIds: string[]) {
  // Find all moderators for this article (`_` is the wildcard character)
  const currentModerators = query(articleModeratorsScope(articleId)(_)).facts;

  // Remove them.
  retract(...currentModerators);

  // Add the new values.
  assert(...map(userIds, articleModeratorsScope(articleId)));
}
