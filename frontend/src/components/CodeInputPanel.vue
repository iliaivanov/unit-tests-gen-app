<template>
  <div class="card">
    <div class="mb-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Input Code</h3>
        <div class="flex items-center space-x-2">
          <select 
            :value="language" 
            @change="$emit('update:language', ($event.target as HTMLSelectElement).value)"
            class="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="cpp">C++</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
          </select>
          <button 
            v-if="code.trim()"
            @click="clearCode"
            class="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors"
            title="Clear input code"
          >
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
          </button>
        </div>
      </div>
      <ResizableEditor
        :model-value="code"
        @update:model-value="$emit('update:code', $event)"
        :language="language"
        :default-height="400"
        :min-height="200"
        :max-height="800"
        storage-key="input-editor-height"
        placeholder="// Enter your function or method here
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}"
      />
    </div>

    <!-- Quick Examples -->
    <div class="border-t pt-4">
      <button 
        @click="showExamples = !showExamples"
        class="flex items-center text-sm text-gray-600 hover:text-gray-800 mb-3"
      >
        <span class="mr-1">Quick Examples</span>
        <svg 
          :class="{ 'rotate-180': showExamples }"
          class="w-4 h-4 transition-transform duration-200" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div v-if="showExamples" class="space-y-2">
        <button 
          v-for="example in examples"
          :key="example.name"
          @click="loadExample(example)"
          class="block w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div class="font-medium text-sm text-gray-900">{{ example.name }}</div>
          <div class="text-xs text-gray-600 mt-1">{{ example.description }}</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { ProgrammingLanguage } from '../types/index.js';
import ResizableEditor from './ResizableEditor.vue';

interface Props {
  code: string;
  language: ProgrammingLanguage;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:code': [code: string];
  'update:language': [language: ProgrammingLanguage];
  'clear-code': [];
}>();

const showExamples = ref(false);

interface CodeExample {
  name: string;
  description: string;
  language: ProgrammingLanguage;
  code: string;
}

const allExamples: CodeExample[] = [
  {
    name: 'JavaScript Calculator',
    description: 'Simple calculator with basic operations',
    language: 'javascript',
    code: `function calculate(a, b, operation) {
  switch (operation) {
    case 'add':
      return a + b;
    case 'subtract':
      return a - b;
    case 'multiply':
      return a * b;
    case 'divide':
      if (b === 0) throw new Error('Division by zero');
      return a / b;
    default:
      throw new Error('Invalid operation');
  }
}`
  },
  {
    name: 'Python User Validator',
    description: 'Validates user data with various rules',
    language: 'python',
    code: `def validate_user(user_data):
    """Validate user registration data."""
    if not user_data.get('email'):
        raise ValueError('Email is required')
    
    if '@' not in user_data['email']:
        raise ValueError('Invalid email format')
    
    if not user_data.get('age') or user_data['age'] < 13:
        raise ValueError('Must be at least 13 years old')
    
    return True`
  },
  {
    name: 'TypeScript Array Utils',
    description: 'Utility functions for array manipulation',
    language: 'typescript',
    code: `function findMax<T>(arr: T[], compareFn: (a: T, b: T) => number): T | null {
  if (arr.length === 0) return null;
  
  return arr.reduce((max, current) => 
    compareFn(current, max) > 0 ? current : max
  );
}

function groupBy<T, K extends string | number>(
  arr: T[], 
  keyFn: (item: T) => K
): Record<K, T[]> {
  return arr.reduce((groups, item) => {
    const key = keyFn(item);
    (groups[key] = groups[key] || []).push(item);
    return groups;
  }, {} as Record<K, T[]>);
}`
  },
  {
    name: 'Java String Helper',
    description: 'String manipulation utilities',
    language: 'java',
    code: `public class StringHelper {
    public static boolean isPalindrome(String str) {
        if (str == null || str.isEmpty()) {
            return true;
        }
        
        String cleaned = str.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        int left = 0;
        int right = cleaned.length() - 1;
        
        while (left < right) {
            if (cleaned.charAt(left) != cleaned.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
}`
  },
  {
    name: 'Go HTTP Client',
    description: 'Simple HTTP client with error handling',
    language: 'go',
    code: `func fetchUserData(userID int) (*User, error) {
    if userID <= 0 {
        return nil, fmt.Errorf("invalid user ID: %d", userID)
    }
    
    url := fmt.Sprintf("https://api.example.com/users/%d", userID)
    resp, err := http.Get(url)
    if err != nil {
        return nil, fmt.Errorf("failed to fetch user: %w", err)
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("API returned status %d", resp.StatusCode)
    }
    
    var user User
    if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
        return nil, fmt.Errorf("failed to decode response: %w", err)
    }
    
    return &user, nil
}`
  }
];

const examples = computed(() => {
  return allExamples.filter(example => example.language === props.language);
});

const loadExample = (example: CodeExample) => {
  emit('update:code', example.code);
  emit('update:language', example.language);
  showExamples.value = false;
};

const clearCode = () => {
  emit('clear-code');
};
</script>