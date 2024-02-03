export class CredentialsService {
  static key = "cw-privateKey"

  public getPrivateKey(): string | null {
    return localStorage.getItem(CredentialsService.key)
  }
  public setPrivateKey(privateKey: string) {
    localStorage.setItem(CredentialsService.key, privateKey)
  }
}
