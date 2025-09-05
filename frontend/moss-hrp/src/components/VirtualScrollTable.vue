<template>
  <div class="table-wrapper">
    <table class="virtual-table-header">
      <thead>
        <tr>
          <th v-for="header in headers" :key="header.key" :style="{ width: header.width || 'auto' }">
            {{ header.title }}
          </th>
        </tr>
      </thead>
    </table>
    <div class="virtual-scroll-container" :ref="containerRef">
      <div class="virtual-scroll-sizer" :style="sizerStyle"></div>
      <div class="virtual-scroll-content" :style="contentStyle">
        <table class="virtual-table-body">
          <tbody>
            <tr v-for="{ data: item, index } in visibleItems" :key="index" :style="{ height: `${itemHeight}px` }">
              <td v-for="header in headers" :key="header.key" :style="{ width: header.width || 'auto' }">
                <slot :name="`item.${header.key}`" :item="item">
                  {{ item[header.key] }}
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue';
import { useVirtualScroll } from '@/composables/useVirtualScroll.js';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  itemHeight: {
    type: Number,
    required: true,
  },
  headers: {
    type: Array,
    required: true,
  },
});

const { items: allItems, itemHeight } = toRefs(props);

const {
  containerRef,
  sizerStyle,
  contentStyle,
  visibleItems,
} = useVirtualScroll(allItems, {
  itemHeight: itemHeight.value,
  buffer: 10, // Render 10 extra items above/below for smoother scrolling
});
</script>

<style scoped>
.table-wrapper {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.virtual-scroll-container {
  height: 600px; /* Default height, can be overridden by parent */
  width: 100%;
  overflow-y: auto;
  position: relative;
  background-color: #fff;
}

.virtual-scroll-sizer {
  position: relative;
  width: 100%;
}

.virtual-scroll-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.virtual-table-header,
.virtual-table-body {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* Important for consistent column widths */
}

.virtual-table-header th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.virtual-table-body td {
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.virtual-table-body tr:last-child td {
  border-bottom: none;
}
</style>
