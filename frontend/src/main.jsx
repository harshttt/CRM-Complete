import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ConfigProvider } from 'antd';
import ThemeConfig from "./ThemeConfig.json";
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { MessageProvider } from "./utils/MessageProvider.jsx";

const queryClient = new QueryClient({
  defaultOptions:{
    queries:{
      staleTime:1000*60*2
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={{...JSON.parse(JSON.stringify(ThemeConfig))}}>
          <MessageProvider>
           <App />
          </MessageProvider>
        </ConfigProvider>
        <ReactQueryDevtools  initialIsOpen={false} position='bottom' />
      </QueryClientProvider>
  </StrictMode>,
)

