import * as request from 'request-promise-native';

class SearchService {
  constructor(private readonly LIBRARIES_API_KEY: string) {}

  private static async apiRequest(options: request.OptionsWithUrl): Promise<string> {
    const req = await request.get(options);
    return req;
  }

  private buildOptions(platform: string, query: string): request.OptionsWithUrl {
    return {
      strictSSL: true,
      url: 'https://libraries.io/api/search/',
      qs: {
        api_key: this.LIBRARIES_API_KEY,
        page: 1,
        per_page: 10,
        platform,
        query
      }
    };
  }

  async searchBower(query: string): Promise<string> {
    const options = this.buildOptions('bower', query);
    console.log({options})
    const result = await SearchService.apiRequest(options);
    return result;
  }

  async searchNpm(query: string): Promise<string> {
    const options = this.buildOptions('npm', query);
    const result = await SearchService.apiRequest(options);
    return result;
  }

  async searchCrates(query: string): Promise<string> {
    const options = this.buildOptions('crates', query);
    const result = await SearchService.apiRequest(options);
    return result;
  }

  async searchTypes(query: string): Promise<string> {
    return ''
  }
}

export { SearchService };
