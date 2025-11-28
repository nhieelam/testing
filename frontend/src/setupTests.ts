import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { vi } from 'vitest';
configure({ testIdAttribute: 'data-text' });