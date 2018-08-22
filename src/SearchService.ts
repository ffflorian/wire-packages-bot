import * as request from 'request';
import { Url } from 'url';

interface TypeSearchResult {
  'd': number;
  'g': string[];
  'l': string;
  'm': string[];
  'p': string;
  't': string;
}

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
  moreResults: number;
  result: string;
  resultsPerPage: number;
}

class SearchService {
  private readonly resultsPerPage: number;
  private readonly typeSearchIndexUrl =
    'https://typespublisher.blob.core.windows.net/typespublisher/data/search-index-min.json';

  constructor(private readonly LIBRARIES_IO_API_KEY: string) {
    this.resultsPerPage = 10;
  }

  private static makeRequest(options: request.OptionsWithUrl): Promise<request.Response> {
    return new Promise((resolve, reject) =>
      request.get(options, (error: Error, response) => {
        if (error) {
          return reject(error);
        }
        if (response) {
          if (response.statusCode === 404) {
            return reject('Sorry, I could not find this.');
          }

          if (response.statusCode !== 200) {
            return reject(`Sorry, something went wrong (status code ${response.statusCode}).`);
          }

          return resolve(response);
        }

        reject('No result and no error.');
      })
    );
  }

  private static async apiRequest(options: request.OptionsWithUrl): Promise<SearchResult> {
    const response = await SearchService.makeRequest(options)

    const {headers, body} = response;
    const totalResults = Number(headers['total']) || 1;
    const moreResults = Math.max(Math.ceil(totalResults - options.qs.page * options.qs.per_page), 0);

    return {
      result: body,
      resultsPerPage: options.qs.per_page,
      moreResults,
    };
  }

  private buildOptions(platform: string, query: string, page = 1): request.OptionsWithUrl {
    return {
      strictSSL: true,
      url: 'https://libraries.io/api/search/',
      qs: {
        api_key: this.LIBRARIES_IO_API_KEY,
        page,
        per_page: this.resultsPerPage,
        platforms: platform,
        q: query,
      },
    };
  }

  private formatResult(results: LibrariesResult[]): string {
    return results.reduce((prev, res) => {
      const {description, homepage, name, language, stars} = res;
      const localeStarsCount = Number(stars.toLocaleString());
      const hasStars =
        localeStarsCount && localeStarsCount > 0
          ? `, ${localeStarsCount} star${localeStarsCount === 1 ? '' : 's'}`
          : '';
      const hasBrackets = language && hasStars ? ` (${language}${hasStars})` : '';
      const hasHomepage = homepage ? ` (${homepage})` : '';
      return prev + `\n- **${name}**${hasBrackets}: ${description || ''}${hasHomepage}`;
    }, '');
  }

  async searchBower(query: string, page: number): Promise<SearchResult> {
    const options = this.buildOptions('bower', query, page);
    const {result: rawResult, moreResults} = await SearchService.apiRequest(options);
    try {
      const parsedJSON: LibrariesResult[] = JSON.parse(rawResult);
      const result = this.formatResult(parsedJSON);
      return {
        moreResults,
        result,
        resultsPerPage: this.resultsPerPage,
      };
    } catch (error) {
      throw new Error('Could not parse JSON.');
    }
  }

  async searchNpm(query: string, page: number): Promise<SearchResult> {
    const options = this.buildOptions('npm', query, page);
    const {result: rawResult, moreResults} = await SearchService.apiRequest(options);
    try {
      const parsedJSON: LibrariesResult[] = JSON.parse(rawResult);
      const result = this.formatResult(parsedJSON);
      return {
        moreResults,
        result,
        resultsPerPage: this.resultsPerPage,
      };
    } catch (error) {
      throw new Error('Could not parse JSON.');
    }
  }

  async searchCrates(query: string, page: number): Promise<SearchResult> {
    const options = this.buildOptions('cargo', query, page);
    const {result: rawResult, moreResults} = await SearchService.apiRequest(options);
    try {
      const parsedJSON: LibrariesResult[] = JSON.parse(rawResult);
      const result = this.formatResult(parsedJSON);
      return {
        moreResults,
        result,
        resultsPerPage: this.resultsPerPage,
      };
    } catch (error) {
      throw new Error('Could not parse JSON.');
    }
  }

  async searchTypes(query: string): Promise<SearchResult> {
    const response = await SearchService.makeRequest({
      url: this.typeSearchIndexUrl,
    })

    let typeSearchResults: TypeSearchResult;

    try {
      typeSearchResults = JSON.parse(response.body);
    } catch(error) {
      throw new Error('Could not parse JSON.');
    }

  }
}

export {SearchService};
