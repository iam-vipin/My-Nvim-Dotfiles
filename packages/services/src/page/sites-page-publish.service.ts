// plane imports
import { API_BASE_URL } from "@plane/constants";
import type {
  TEditorEmbedsResponse,
  TEditorEmbedType,
  TEditorMentionsResponse,
  TEditorMentionType,
  TPublicPageResponse,
} from "@plane/types";
// local imports
import { APIService } from "../api.service";

/**
 * Service class for managing page publish operations within plane sites application.
 * Extends APIService to handle HTTP requests to the page publish-related endpoints.
 * @extends {APIService}
 * @remarks This service is only available for plane sites enterprise edition
 */
export class SitesPagePublishService extends APIService {
  constructor(BASE_URL?: string) {
    super(BASE_URL || API_BASE_URL);
  }

  /**
   * Retrieves page details for a specific anchor.
   * @param {string} anchor - The anchor identifier
   * @returns {Promise<TPublicPageResponse>} The page details
   * @throws {Error} If the API request fails
   */
  async retrieve(anchor: string): Promise<TPublicPageResponse> {
    return this.get(`/api/public/anchor/${anchor}/pages/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  /**
   * Retrieves subpages for a specific page.
   * @param {string} anchor - The anchor identifier
   * @param {string} pageId - The parent page identifier
   * @returns {Promise<TPublicPageResponse[]>} The subpages list
   * @throws {Error} If the API request fails
   */
  async fetchSubPages(anchor: string): Promise<TPublicPageResponse[]> {
    return this.get(`/api/public/anchor/${anchor}/sub-pages/`)
      .then((response) => response?.data || [])
      .catch((error) => {
        throw error?.response;
      });
  }

  /**
   * Retrieves page embeds for a specific anchor.
   * @param {string} anchor - The anchor identifier
   * @param {TEditorEmbedType} embedType - The embed type
   * @returns {Promise<TEditorEmbedsResponse>} The page embeds
   * @throws {Error} If the API request fails
   */
  async listEmbeds(anchor: string, embedType: TEditorEmbedType): Promise<TEditorEmbedsResponse> {
    return this.get(`/api/public/anchor/${anchor}/page-embeds/`, {
      params: {
        embed_type: embedType,
      },
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  /**
   * Retrieves page mentions for a specific anchor.
   * @param {string} anchor - The anchor identifier
   * @param {TEditorMentionType} mentionType - The mention type
   * @returns {Promise<TEditorMentionsResponse>} The page mentions
   * @throws {Error} If the API request fails
   */
  async listMentions(anchor: string, mentionType: TEditorMentionType): Promise<TEditorMentionsResponse> {
    return this.get(`/api/public/anchor/${anchor}/page-mentions/`, {
      params: {
        mention_type: mentionType,
      },
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }
}
