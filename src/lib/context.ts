import { createContext } from 'react';
import { API } from '../types/api';

export const APIContext = createContext<API | null>(null);
