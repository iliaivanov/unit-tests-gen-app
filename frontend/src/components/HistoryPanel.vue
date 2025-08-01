<template>
  <div class="card">
    <div 
      class="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-6 p-6 rounded-t-lg transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center">
        <h3 class="text-lg font-semibold text-gray-900 mr-3">Request History</h3>
        <span 
          v-if="history.length > 0" 
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-3"
        >
          {{ history.length }}
        </span>
        <button 
          v-if="history.length > 0"
          @click.stop="clearAllHistory"
          class="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors"
          title="Clear all history"
        >
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear All
        </button>
      </div>
      <div class="flex items-center">
        <svg 
          :class="{ 'rotate-180': isExpanded }"
          class="w-5 h-5 text-gray-400 transition-transform duration-200" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <!-- Expandable Content -->
    <div 
      v-show="isExpanded" 
      class="mt-4 space-y-3 animate-fadeIn"
    >
      <!-- Empty State -->
      <div v-if="history.length === 0" class="text-center py-8">
        <svg class="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h4 class="text-sm font-medium text-gray-700 mb-1">No history yet</h4>
        <p class="text-xs text-gray-500">Your recent test generations will appear here</p>
      </div>

      <!-- History Entries -->
      <div v-else class="space-y-2">
        <div 
          v-for="entry in history" 
          :key="entry.id"
          class="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <!-- Header -->
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-xs text-gray-500">
                  {{ formatTimestamp(entry.timestamp) }}
                </span>
                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {{ entry.request.language }}
                </span>
                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  {{ entry.request.framework }}
                </span>
                <span v-if="entry.metadata.testCount" class="text-xs text-gray-500">
                  {{ entry.metadata.testCount }} tests
                </span>
              </div>

              <!-- Code Preview -->
              <div class="mb-3">
                <p class="text-sm text-gray-700 font-mono bg-white px-2 py-1 rounded border text-truncate">
                  {{ getCodePreview(entry.request.code) }}
                </p>
              </div>

              <!-- Metadata -->
              <div class="flex items-center text-xs text-gray-500 space-x-3">
                <span v-if="entry.metadata.executionTime">
                  {{ (entry.metadata.executionTime / 1000).toFixed(1) }}s
                </span>
                <span>{{ entry.request.modelConfig?.model || 'Unknown model' }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-1 ml-4">
              <button 
                @click="loadEntry(entry)"
                class="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                title="Load this entry back to the editor"
              >
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Load
              </button>
              <button 
                @click="deleteEntry(entry.id)"
                class="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors"
                title="Delete this entry"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { HistoryEntry } from '../types/index.js';

interface Props {
  history: HistoryEntry[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'load-entry': [entry: HistoryEntry];
  'delete-entry': [entryId: string];
  'clear-history': [];
}>();

const isExpanded = ref(false);

const formatTimestamp = (timestamp: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return timestamp.toLocaleDateString();
  }
};

const getCodePreview = (code: string): string => {
  const firstLine = code.split('\n')[0];
  if (firstLine.length > 80) {
    return firstLine.substring(0, 80) + '...';
  }
  const secondLine = code.split('\n')[1];
  if (secondLine) {
    const preview = firstLine + ' ' + secondLine;
    return preview.length > 80 ? preview.substring(0, 80) + '...' : preview;
  }
  return firstLine;
};

const loadEntry = (entry: HistoryEntry) => {
  emit('load-entry', entry);
};

const deleteEntry = (entryId: string) => {
  emit('delete-entry', entryId);
};

const clearAllHistory = () => {
  if (confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
    emit('clear-history');
  }
};
</script>

<style scoped>
.text-truncate {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>