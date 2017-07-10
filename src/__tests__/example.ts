import { IFact, makeIdentifier, placeholder as _, Rete } from "../index";
declare const fetch: (path: string) => Promise<any>;

const {
  addFacts: assert,
  removeFacts: retract,
  addQuery: query,
} = Rete.create();

const articleModeratorLoader = makeIdentifier("loader/id", "articleModerators");
const hasData = (v: boolean): IFact => [
  articleModeratorLoader,
  "loader/hasData",
  v,
];
const isFetching = (v: boolean): IFact => [
  articleModeratorLoader,
  "loader/isFetching",
  v,
];
const articleIdent = (id: string) => makeIdentifier("article/id", id);

// Action.
export async function load() {
  assert(isFetching(true));

  const json: { [articleId: string]: string[] } = await fetch(
    "/api/articleModerators",
  );

  assert(isFetching(false));

  Object.keys(json).forEach(articleId => {
    const userIds = json[articleId];

    const articleModeratorsScope = (v: string): IFact => [
      articleIdent(articleId),
      "article/moderators",
      v,
    ];

    assert(userIds.map(articleModeratorsScope));
  });

  assert(hasData(true));
}

export function updateArticleModerators(articleId: string, userIds: string[]) {
  const articleModeratorsScope = (v: string | typeof _): IFact => [
    articleIdent(articleId),
    "article/moderators",
    v,
  ];

  // Find all moderators for this article (`_` is the wildcard character)
  const currentModerators = query(articleModeratorsScope(_)).getFacts();

  // Remove them.
  retract(currentModerators);

  // Add the new values.
  assert(userIds.map(articleModeratorsScope));
}
