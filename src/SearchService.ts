import * as request from 'request';

interface LibrariesResult {
  description: string;
  homepage: string;
  language: string;
  latest_release_number: string;
  latest_release_published_at: string;
  name: string;
  stars: number;
}

interface SearchResult {
  result: string;
  moreResults: number;
}

class SearchService {
  constructor(private readonly LIBRARIES_API_KEY: string) {}

  private static apiRequest(options: request.OptionsWithUrl): Promise<SearchResult> {
    return new Promise((resolve, reject) =>
      request.get(options, (err: Error, result) => {
        const {headers, body} = result;
        console.log({total: headers['total']});
        const totalResults = Number(headers['total']) || 1;
        const moreResults = Math.max(Math.ceil(totalResults - (options.qs.page * options.qs.per_page)), 0);
        resolve({
          result: body,
          moreResults,
        });
      })
    );

  }

  private buildOptions(platform: string, query: string, page = 1): request.OptionsWithUrl {
    return {
      strictSSL: true,
      url: 'https://libraries.io/api/search/',
      qs: {
        api_key: this.LIBRARIES_API_KEY,
        page,
        per_page: 10,
        platforms: platform,
        q: query,
      },
    };
  }

  async searchBower(query: string, page: number): Promise<SearchResult> {
    const options = this.buildOptions('bower', query, page);
    const {result: rawResult, moreResults} = await SearchService.apiRequest(options);
    try {
      const parsedJSON: LibrariesResult[] = JSON.parse(rawResult);
      const result = parsedJSON.reduce(
        (prev, res) =>
          prev +
          `\n- **${res.name}** (${res.language}, ${res.stars.toLocaleString()} stars): ${res.description} (${
            res.homepage
          })`,
        ''
      );
      return {
        result: result,
        moreResults,
      }
    } catch (error) {
      throw new Error('Could not parse JSON.');
    }
  }

  async searchNpm(query: string, page: number): Promise<SearchResult> {
    const options = this.buildOptions('npm', query, page);
    const {result: rawResult, moreResults} = await SearchService.apiRequest(options);
    try {
      const parsedJSON: LibrariesResult[] = JSON.parse(rawResult);
      const result = parsedJSON.reduce(
        (prev, res) =>
          prev +
          `\n- **${res.name}** (${res.language}, ${res.stars.toLocaleString()} stars): ${res.description} (${
            res.homepage
          })`,
        ''
      );
      return {
        result: result,
        moreResults,
      }
    } catch (error) {
      throw new Error('Could not parse JSON.');
    }
  }

  async searchCrates(query: string, page: number): Promise<SearchResult> {
    const options = this.buildOptions('cargo', query, page);
    const {result: rawResult, moreResults} = await SearchService.apiRequest(options);
    try {
      const parsedJSON: LibrariesResult[] = JSON.parse(rawResult);
      const result = parsedJSON.reduce(
        (prev, res) =>
          prev +
          `\n- **${res.name}** (${res.language}, ${res.stars.toLocaleString()} stars): ${res.description} (${
            res.homepage
          })`,
        ''
      );
      return {
        result: result,
        moreResults,
      }
    } catch (error) {
      throw new Error('Could not parse JSON.');
    }
  }

  async searchTypes(query: string): Promise<string> {
    return '';
  }
}

export {SearchService};
