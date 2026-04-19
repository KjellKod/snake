export const TOOL_NAME = "play_snake";
export const TOOL_DESCRIPTION = "Launch the snake game inline";
export const RESOURCE_URI = "ui://snake/game.html";
export const RESOURCE_NAME = "snake-game";
export const RESOURCE_DESCRIPTION = "Snake game widget";

export const TOOL_REGISTRATIONS = [
  {
    name: TOOL_NAME,
    description: TOOL_DESCRIPTION,
    _meta: {
      ui: {
        resourceUri: RESOURCE_URI,
      },
    },
  },
] as const;

export const RESOURCE_REGISTRATIONS = [
  {
    name: RESOURCE_NAME,
    uri: RESOURCE_URI,
    description: RESOURCE_DESCRIPTION,
    _meta: {
      ui: {
        csp: {
          resourceDomains: ["'self'", "data:"],
        },
        permissions: {},
      },
    },
  },
] as const;
