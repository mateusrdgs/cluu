export default interface Socket {
  createNamespace: (maxPlayers: number) => Promise<string>
}
