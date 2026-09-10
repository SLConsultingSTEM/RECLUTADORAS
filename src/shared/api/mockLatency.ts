/** Latencia artificial del mock para que el skeleton alcance a pintarse. */
export function mockLatency(ms = 90): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
