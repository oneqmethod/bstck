const originalConsoleError = console.error
console.error = (...args: any[]) => {
  if (typeof args[0] === "string" && args[0].includes("was not wrapped in act(")) return
  originalConsoleError(...args)
}
