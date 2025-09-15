import { ref, onUnmounted } from 'vue';

/**
 * A Vue composable for managing a Server-Sent Events (SSE) connection.
 *
 * @param {string} url - The URL of the SSE endpoint.
 * @returns {object} - Reactive state and methods to control the SSE connection.
 */
export function useSSE(url) {
  const status = ref('disconnected'); // disconnected, connecting, open, closed
  const eventSource = ref(null);
  const error = ref(null);

  // A map to hold callbacks for different event types.
  const listeners = new Map();

  /**
   * Closes the existing connection if it exists.
   */
  const close = () => {
    if (eventSource.value) {
      eventSource.value.close();
      eventSource.value = null;
      status.value = 'disconnected';
    }
  };

  /**
   * Establishes the SSE connection.
   */
  const connect = () => {
    if (eventSource.value) {
      close();
    }

    status.value = 'connecting';
    const es = new EventSource(url, { withCredentials: true });
    eventSource.value = es;

    es.onopen = () => {
      status.value = 'open';
      error.value = null;
      console.log(`SSE connection opened to ${url}`);
    };

    es.onerror = (err) => {
      console.warn('SSE connection failed - endpoint may not be configured:', url);
      status.value = 'closed';
      error.value = err;

      // Don't spam console with SSE errors if endpoint doesn't exist
      // This is expected until Pocketbase SSE endpoints are configured
      if (url.includes('/api/sse/')) {
        console.info('SSE endpoints not configured in Pocketbase - real-time updates disabled');
      }
    };

    // Attach all registered listeners to the new EventSource instance.
    listeners.forEach((callbacks, eventName) => {
      es.addEventListener(eventName, (event) => {
        try {
          const data = JSON.parse(event.data);
          callbacks.forEach(cb => cb(data, event));
        } catch (e) {
          console.error('Failed to parse SSE message data:', e);
        }
      });
    });
  };

  /**
   * Registers a callback for a specific event name.
   * @param {string} eventName - The name of the event to listen for.
   * @param {Function} callback - The function to call when the event is received.
   */
  const addEventListener = (eventName, callback) => {
    if (!listeners.has(eventName)) {
      listeners.set(eventName, []);
    }
    listeners.get(eventName).push(callback);

    // If already connected, add the listener to the existing EventSource.
    if (eventSource.value) {
      eventSource.value.addEventListener(eventName, (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data, event);
        } catch (e) {
          console.error('Failed to parse SSE message data:', e);
        }
      });
    }
  };

  // Automatically close the connection when the component is unmounted.
  onUnmounted(close);

  return {
    status,
    error,
    connect,
    close,
    addEventListener,
  };
}
