import { isSupabasePausedError } from './is-project-paused';
import { redirectToPausedPage } from './paused-redirect';

export const pausedAwareFetch: typeof fetch = async (input, init) => {
  try {
    const response = await fetch(input, init);
    if (!response.ok) {
      if (isSupabasePausedError({ status: response.status })) {
        redirectToPausedPage();
        return response;
      }
      try {
        const bodyText = await response.clone().text();
        if (isSupabasePausedError({ message: bodyText })) {
          redirectToPausedPage();
        }
      } catch {
      }
    }

    return response;
  } catch (err) {
    if (isSupabasePausedError(err)) {
      redirectToPausedPage();
    }
    throw err;
  }
};
