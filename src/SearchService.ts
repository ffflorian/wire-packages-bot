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
  moreResults: number;
  result: string;
  resultsPerPage: number;
}

class SearchService {
  private readonly resultsPerPage: number;
  constructor(private readonly LIBRARIES_API_KEY: string) {
    this.resultsPerPage = 10;
  }

  private static apiRequest(options: request.OptionsWithUrl): Promise<SearchResult> {
    return new Promise((resolve, reject) =>
      request.get(options, (err: Error, result) => {
        const {headers, body} = result;
        const totalResults = Number(headers['total']) || 1;
        const moreResults = Math.max(Math.ceil(totalResults - options.qs.page * options.qs.per_page), 0);
        resolve({
          result: body,
          resultsPerPage: options.qs.per_page,
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

  async searchTypes(query: string): Promise<string> {
    return '';
  }
}

export {SearchService};
