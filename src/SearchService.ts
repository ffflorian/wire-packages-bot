import * as request from 'request-promise-native';

interface LibrariesResult {
  description: string,
  homepage: string,
  language: string,
  latest_release_number: string,
  latest_release_published_at: string,
  name: string,
  stars: number,
}

class SearchService {
  constructor(private readonly LIBRARIES_API_KEY: string) {}

  private static async apiRequest(options: request.OptionsWithUrl): Promise<string> {
    return request.get(options) as request.RequestPromise<string>;
  }

  private buildOptions(platform: string, query: string): request.OptionsWithUrl {
    return {
      strictSSL: true,
      url: 'https://libraries.io/api/search/',
      qs: {
        api_key: this.LIBRARIES_API_KEY,
        page: 1,
        per_page: 10,
        platforms: platform,
        q: query,
      },
    };
  }

  async searchBower(query: string): Promise<string> {
    const options = this.buildOptions('bower', query);
    const result = await SearchService.apiRequest(options);
    try {
      const parsedJSON: LibrariesResult[] = JSON.parse(result);
      return parsedJSON.reduce((prev, res) => prev + `\n- **${res.name}** (${res.language}, ${res.stars.toLocaleString()} stars): ${res.description} (${res.homepage})`, '');
    } catch(error) {
      return 'Error: could not parse JSON.';
    }
  }

  async searchNpm(query: string): Promise<string> {
    const options = this.buildOptions('npm', query);
    const result = await SearchService.apiRequest(options);
    try {
      const parsedJSON: LibrariesResult[] = JSON.parse(result);
      return parsedJSON.reduce((prev, res) => prev + `\n- **${res.name}** (${res.language}, ${res.stars.toLocaleString()} stars): ${res.description} (${res.homepage})`, '');
    } catch(error) {
      return 'Error: could not parse JSON.';
    }
  }

  async searchCrates(query: string): Promise<string> {
    const options = this.buildOptions('cargo', query);
    const result = await SearchService.apiRequest(options);
    try {
      const parsedJSON: LibrariesResult[] = JSON.parse(result);
      return parsedJSON.reduce((prev, res) => prev + `\n- **${res.name}** (${res.language}, ${res.stars.toLocaleString()} stars): ${res.description} (${res.homepage})`, '');
    } catch(error) {
      return 'Error: could not parse JSON.';
    }
  }

  async searchTypes(query: string): Promise<string> {
    return '';
  }
}

export {SearchService};
