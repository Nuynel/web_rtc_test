import type {} from 'vike/types'; // Импортируйте типы, чтобы избежать ошибок при использовании Vike.PageContext.

declare global {
  namespace Vike {
    interface PageContext {
      data?: {
        description: string | undefined;
        title: string | undefined;
      };
      urlOriginal: string | undefined;
    }
  }
}

export {};
