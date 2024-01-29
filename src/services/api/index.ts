export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get(
    fileName: string,
    { timeout = 10000, revalidate = 3600, cache = false } = {
      timeout: 10000,
      revalidate: 3600,
      cache: false,
    }
  ): Promise<any> {
    const url = `${this.baseUrl}/${fileName}`;
    const controller = new AbortController();
    const abortTimeout = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        next: { revalidate },
        mode: "cors",
        cache: cache ? undefined : "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error("Request timed out");
      }
      throw error;
    } finally {
      clearTimeout(abortTimeout);
    }
  }
}
