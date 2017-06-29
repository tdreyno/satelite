import {
  defineState,
  ident,
  placeholder as _,
  schema,
  scope,
  t,
} from "../Store5";

declare const fetch: (path: string) => Promise<any>;

const { assert, retract, find } = defineState(
  schema("loader/hasData", { type: t.Boolean }),
  schema("loader/isFetching", { type: t.Boolean }),
  schema("article/moderators", { type: t.String, isMultiple: true }),
);

const articleModeratorLoader = ident("loader/id")("articleModerators");
const hasData = scope(articleModeratorLoader, "loader/hasData");
const isFetching = scope(articleModeratorLoader, "loader/isFetching");
const articleIdent = ident("article/id");

// Action.
export async function load() {
  assert(isFetching(true));

  const json: { [articleId: string]: string[] } = await fetch(
    "/api/articleModerators",
  );

  assert(isFetching(true));

  Object.keys(json).forEach(articleId => {
    const userIds = json[articleId];

    const articleModeratorsScope = scope(
      articleIdent(articleId),
      "article/moderators",
    );

    assert(userIds.map(articleModeratorsScope));
  });

  assert(hasData(true));
}

export function updateArticleModerators(articleId: string, userIds: string[]) {
  const articleModeratorsScope = scope(
    articleIdent(articleId),
    "article/moderators",
  );

  // Find all moderators for this article (`_` is the wildcard character)
  const currentModerators = find(articleModeratorsScope(_));

  // Remove them.
  retract(currentModerators);

  // Add the new values.
  assert(userIds.map(articleModeratorsScope));
}
