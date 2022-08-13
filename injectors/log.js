const AnsiEscapes = Object.freeze({
    RESET: '\x1b[0m',
    BOLD: '\x1b[1m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    RED: '\x1b[31m'
  });
  
  const BasicMessages = Object.freeze({
    INJECT_FAILED: `${AnsiEscapes.BOLD}${AnsiEscapes.RED}Failed to inject HFD :(${AnsiEscapes.RESET}`,
    INJECT_SUCCESS: `${AnsiEscapes.BOLD}${AnsiEscapes.GREEN}HFD has been successfully injected :D${AnsiEscapes.RESET}`,
    UNINJECT_FAILED: `${AnsiEscapes.BOLD}${AnsiEscapes.RED}Failed to uninject HFD :(${AnsiEscapes.RESET}`,
    UNINJECT_SUCCESS: `${AnsiEscapes.BOLD}${AnsiEscapes.GREEN}HFD has been successfully uninject${AnsiEscapes.RESET}`
  });
  
  const PlatformNames = Object.freeze({
    stable: 'Discord',
    ptb: 'Discord PTB',
    canary: 'Discord Canary',
    dev: 'Discord Development'
  });
  
  module.exports = {
    AnsiEscapes,
    BasicMessages,
    PlatformNames
  };