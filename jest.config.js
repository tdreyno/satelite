module.exports = {
  moduleFileExtensions: ["ts", "js", "json", "node"],
  transform: {
    "^.+\\.(ts|tsx)$": "<rootDir>/preprocessor.js"
  },
  testMatch: ["**/*.spec.(ts|js)"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"]
};
