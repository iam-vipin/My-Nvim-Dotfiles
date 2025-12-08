import { set, unset } from "lodash";
import { makeObservable, observable, runInAction, action, computed } from "mobx";
import { computedFn } from "mobx-utils";
import { CallbackHandlerStrings } from "@/constants/callback-handler-strings";
import { callNative } from "@/helpers";
import { BasePageStore, IBasePageStore } from "@/store/base-page.store";
import type { TPage } from "@/types/page";

type TBasePage = IBasePageStore;
export interface IPageStore {
  subPages: Record<string, TBasePage>; // pageId => Page
  //actions
  fetchPages: (pageId: string) => void;
  fetchPageDetails: ({
    workspaceSlug,
    pageId,
    projectId,
  }: {
    workspaceSlug: string;
    pageId: string;
    projectId?: string;
  }) => void;
  // computed
  subPageIds: string[];

  getSubPageById: (pageId: string) => TBasePage | undefined;
  removeSubPageById: (pageId: string) => void;
}

export class PageStore implements IPageStore {
  // observables
  currentUserId: string | undefined;
  subPages: Record<string, IBasePageStore> = {};

  constructor() {
    makeObservable(this, {
      //observables
      subPages: observable,
      //computed
      subPageIds: computed,
      //actions
      fetchPages: action,
      fetchPageDetails: action,
    });
  }

  /**
   * @description Returns the ids of the stored sub pages
   */
  get subPageIds() {
    if (!this.subPages) return [];
    return Object.keys(this.subPages);
  }

  /**
   * @description Returns the sub page by id
   */
  getSubPageById = computedFn((id: string) => this.subPages?.[id] || undefined);

  /**
   * @description Removes the sub page by id
   */
  removeSubPageById = (pageId: string) => {
    runInAction(() => unset(this.subPages, [pageId]));
  };

  /**
   * @description Fetches the sub pages for the given page id
   */
  fetchPages = async (pageId: string) => {
    const response = await callNative(CallbackHandlerStrings.getPages, pageId);
    const pages = this._parsePages(response);
    runInAction(() => {
      this.subPages = pages;
    });
  };

  /**
   * @description Fetches the page details for the given page id
   */
  fetchPageDetails = async ({
    workspaceSlug,
    pageId,
    projectId,
  }: {
    workspaceSlug: string;
    pageId: string;
    projectId?: string;
  }) => {
    try {
      if (this.getSubPageById(pageId)) return;
      const response = await callNative(
        CallbackHandlerStrings.getPageDetails,
        JSON.stringify({
          workspaceSlug: workspaceSlug,
          projectId: projectId,
          pageId: pageId,
        })
      );
      const pageDetails = JSON.parse(response);
      runInAction(() => {
        set(this.subPages, [pageId], new BasePageStore(pageDetails as unknown as TPage));
      });
    } catch (error) {
      console.error("Error fetching page details", error);
    }
  };

  /**
   * @description Parses the sub pages
   * @param subPagesResponse - The encoded sub pages response as a string
   * @returns @type {Record<string, IBasePageStore>}
   */
  _parsePages = (pagesResponse: string) => {
    const parsedPages = JSON.parse(pagesResponse);
    const pages: Record<string, IBasePageStore> = {};
    Object.values(parsedPages).forEach((page) => {
      const pageInstance = new BasePageStore(page as unknown as TPage);
      if (pageInstance.id) set(pages, [pageInstance.id], pageInstance);
    });
    return pages;
  };
}
