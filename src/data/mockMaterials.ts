import type { Material, KnowledgeSearchResult } from '@/types';

export const mockMaterials: Material[] = [
  {
    id: 'mat-001',
    name: 'Deep Learning Notes.pdf',
    type: 'pdf',
    size: '4.2 MB',
    uploadedDate: '2025-09-28',
    status: 'ready',
    chunks: 342,
  },
  {
    id: 'mat-002',
    name: 'Neural Networks Slides.pptx',
    type: 'ppt',
    size: '12.8 MB',
    uploadedDate: '2025-09-27',
    status: 'ready',
    chunks: 128,
  },
  {
    id: 'mat-003',
    name: 'Lecture 5 - CNN.mp4',
    type: 'video',
    size: '186 MB',
    uploadedDate: '2025-09-26',
    status: 'ready',
    chunks: 96,
  },
  {
    id: 'mat-004',
    name: 'Machine Learning Textbook.pdf',
    type: 'pdf',
    size: '28.4 MB',
    uploadedDate: '2025-09-25',
    status: 'ready',
    chunks: 512,
  },
  {
    id: 'mat-005',
    name: 'Statistics Fundamentals.pdf',
    type: 'pdf',
    size: '8.1 MB',
    uploadedDate: '2025-09-29',
    status: 'processing',
    chunks: 0,
    progress: 65,
    processingStep: 'Generating embeddings...',
  },
];

export const mockSearchResults: KnowledgeSearchResult[] = [
  {
    id: 'sr-001',
    text: 'Backpropagation is a supervised learning algorithm used to train neural networks by computing the gradient of the loss function with respect to each weight by the chain rule. It iteratively adjusts the weights to minimize the error.',
    sourceName: 'Deep Learning Notes',
    sourceType: 'pdf',
    page: 42,
    relevance: 0.95,
  },
  {
    id: 'sr-002',
    text: 'The backpropagation algorithm works by propagating the error backward through the network. First, a forward pass computes the output, then the error is calculated, and finally gradients are propagated backward to update weights.',
    sourceName: 'Neural Networks Slides',
    sourceType: 'ppt',
    slide: 18,
    relevance: 0.88,
  },
  {
    id: 'sr-003',
    text: 'In this lecture, we cover backpropagation in detail. The key insight is that we use the chain rule of calculus to compute how each weight contributes to the overall error, allowing us to make targeted adjustments.',
    sourceName: 'Lecture 5',
    sourceType: 'video',
    timestamp: '12:42',
    relevance: 0.82,
  },
];
