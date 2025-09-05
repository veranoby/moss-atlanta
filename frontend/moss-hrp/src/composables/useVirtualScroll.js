import { ref, computed, onMounted, onUnmounted } from 'vue';

/**
 * A Vue composable for implementing virtual scrolling on a list of items.
 * Assumes all items have a fixed, known height.
 *
 * @param {import('vue').Ref<Array<any>>} allItems - A ref to the full list of data items.
 * @param {object} options - Configuration options.
 * @param {number} options.itemHeight - The fixed height of a single item in pixels.
 * @param {number} [options.buffer=5] - The number of extra items to render above and below the viewport.
 * @returns {object} - Reactive properties and handlers to be used in a component.
 */
export function useVirtualScroll(allItems, options) {
  const { itemHeight, buffer = 10 } = options;

  // A ref to the scrollable container element. The component using this composable must set it.
  const containerRef = ref(null);
  const scrollTop = ref(0);

  // The total height of the scrollable area, as if all items were rendered.
  const totalHeight = computed(() => allItems.value.length * itemHeight);

  // The index of the first item to be rendered in the DOM.
  // Includes a buffer to avoid blank spaces during fast scrolling.
  const startIndex = computed(() => {
    return Math.max(0, Math.floor(scrollTop.value / itemHeight) - buffer);
  });

  // The number of items that should be rendered to fill the viewport + buffers.
  const visibleItemCount = computed(() => {
    if (!containerRef.value) return 0;
    const count = Math.ceil(containerRef.value.clientHeight / itemHeight);
    return count + 2 * buffer;
  });

  // The index of the last item to be rendered.
  const endIndex = computed(() => {
    return Math.min(allItems.value.length, startIndex.value + visibleItemCount.value);
  });

  // The slice of items that are currently visible in the DOM.
  // Each item is wrapped with its original index and top position for rendering.
  const visibleItems = computed(() => {
    return allItems.value.slice(startIndex.value, endIndex.value).map((item, index) => ({
      data: item,
      index: startIndex.value + index,
    }));
  });

  // The CSS 'translateY' offset to position the visible items correctly.
  const contentStyle = computed(() => ({
    transform: `translateY(${startIndex.value * itemHeight}px)`,
  }));

  // The style for the sizer element that creates the correctly-sized scrollbar.
  const sizerStyle = computed(() => ({
    height: `${totalHeight.value}px`,
  }));

  /**
   * Event handler for the container's scroll event.
   */
  function handleScroll() {
    if (containerRef.value) {
      scrollTop.value = containerRef.value.scrollTop;
    }
  }

  // Attach and clean up the scroll event listener.
  onMounted(() => {
    if (containerRef.value) {
      containerRef.value.addEventListener('scroll', handleScroll);
    }
  });

  onUnmounted(() => {
    if (containerRef.value) {
      containerRef.value.removeEventListener('scroll', handleScroll);
    }
  });

  return {
    containerRef, // The component must bind this to its scrollable element.
    sizerStyle,
    contentStyle,
    visibleItems,
  };
}
